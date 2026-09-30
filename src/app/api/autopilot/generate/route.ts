import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { buildVideoPostPrompt } from '@/lib/prompts/video-post-prompt';
import {
  buildClassifierPrompt,
  fallbackClassification,
  ClassificationResult,
} from '@/lib/prompts/content-classifier';
import { scrapeUrlContent } from '@/lib/services/url-scraper';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 60; // Allow maximum timeout for multimodal analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      videoUrl,
      targetUrl,
      targetUrlContent: providedContent,
      videoMeta,
      postSubject,
      editorialStyle = 'auto',
      tone,
      themes,
      postObjective,
      personalExamples,
      linkedinProfile,
      targetNetwork,
      locale = 'fr',
      hp_website,
    } = body;

    // Protection Anti-Bot Honeypot
    if (hp_website) {
      return NextResponse.json({ error: 'Access denied' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Gemini non configurée sur le serveur.' },
        { status: 500 }
      );
    }

    // 1. Scrape target URL directly in-process (zero loopback HTTP dependency)
    let targetUrlContent = providedContent || '';
    let screenshotUrl = targetUrl
      ? `https://image.thum.io/get/width/1200/crop/675/${targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`}`
      : null;
    let ogImage: string | null = null;

    if (targetUrl) {
      try {
        const scrapeData = await scrapeUrlContent(targetUrl);
        if (scrapeData.content && !targetUrlContent) {
          targetUrlContent = scrapeData.content;
        }
        if (scrapeData.screenshotUrl) {
          screenshotUrl = scrapeData.screenshotUrl;
        }
        if (scrapeData.ogImage) {
          ogImage = scrapeData.ogImage;
        }
      } catch (err) {
        console.warn('Scraping URL in-process non concluant:', err);
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // 2. ÉTAPE 1 : CLASSIFICATION ÉDITORIALE IA (Content Classifier)
    let classification: ClassificationResult;
    try {
      const classifierPrompt = buildClassifierPrompt({
        targetUrl,
        targetUrlContent,
        videoFileName: videoMeta?.name,
        videoDescription: videoMeta?.description,
        postSubject,
        userRequestedStyle: editorialStyle,
        postObjective,
        targetNetwork,
        locale,
      });

      const classifyResult = await model.generateContent(classifierPrompt);
      const classifyText = (await classifyResult.response).text().trim();

      const jsonMatch = classifyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        classification = JSON.parse(jsonMatch[0]);
      } else {
        classification = fallbackClassification({
          targetUrl,
          targetUrlContent,
          videoFileName: videoMeta?.name,
          postSubject,
          userRequestedStyle: editorialStyle,
        });
      }
    } catch (classifyErr) {
      console.warn('Erreur lors de la classification éditoriale, bascule sur le fallback:', classifyErr);
      classification = fallbackClassification({
        targetUrl,
        targetUrlContent,
        videoFileName: videoMeta?.name,
        postSubject,
        userRequestedStyle: editorialStyle,
      });
    }

    // 3. ÉTAPE 2 : GHOSTWRITER & GÉNÉRATEUR ADAPTÉ À LA STRUCTURE
    const promptText = buildVideoPostPrompt({
      targetUrl,
      targetUrlContent,
      videoFileName: videoMeta?.name || '',
      videoDescription: videoMeta?.description || '',
      postSubject,
      tone,
      themes,
      postObjective,
      personalExamples,
      linkedinProfile,
      targetNetwork,
      locale,
      classification,
    });

    // 4. Traitement multimodal vidéo si présente
    let contentParts: any[] = [{ text: promptText }];

    if (videoUrl) {
      if (videoUrl.includes('generativelanguage.googleapis.com')) {
        console.log('Utilisation directe du File URI Google AI:', videoUrl);
        contentParts.push({
          fileData: {
            fileUri: videoUrl,
            mimeType: videoMeta?.mimeType || 'video/mp4',
          },
        });
      } else {
        try {
          console.log('Téléchargement de la vidéo pour analyse Gemini:', videoUrl);
          const videoResponse = await fetch(videoUrl);
          if (videoResponse.ok) {
            const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
            const fileSizeMB = videoBuffer.byteLength / (1024 * 1024);
            console.log(`Taille vidéo téléchargée : ${fileSizeMB.toFixed(2)} Mo`);

            // If under 20MB, send inline base64 for ultra-fast processing
            if (fileSizeMB <= 20) {
              contentParts.push({
                inlineData: {
                  data: videoBuffer.toString('base64'),
                  mimeType: 'video/mp4',
                },
              });
            } else {
              // For files between 20MB and 100MB, use Google AI File Manager
              const tempFilePath = path.join(os.tmpdir(), `temp-${Date.now()}-${videoMeta?.name || 'video.mp4'}`);
              fs.writeFileSync(tempFilePath, videoBuffer);

              try {
                const fileManager = new GoogleAIFileManager(apiKey);
                const uploadResult = await fileManager.uploadFile(tempFilePath, {
                  mimeType: 'video/mp4',
                  displayName: videoMeta?.name || 'Video Autopilot',
                });

                let file = await fileManager.getFile(uploadResult.file.name);
                let attempts = 0;
                while (file.state === 'PROCESSING' && attempts < 20) {
                  await new Promise((resolve) => setTimeout(resolve, 3000));
                  file = await fileManager.getFile(uploadResult.file.name);
                  attempts++;
                }

                if (file.state === 'ACTIVE') {
                  contentParts.push({
                    fileData: {
                      fileUri: file.uri,
                      mimeType: file.mimeType,
                    },
                  });
                } else {
                  console.warn('La vidéo n’a pas terminé son traitement, génération en mode texte enrichi');
                }
              } finally {
                if (fs.existsSync(tempFilePath)) {
                  fs.unlinkSync(tempFilePath);
                }
              }
            }
          }
        } catch (videoErr) {
          console.error('Erreur lors de l’analyse vidéo avec Gemini, repli sur le texte:', videoErr);
        }
      }
    }

    // 5. Génération finale avec Gemini (avec fallback intelligent si quota / spending cap dépassé)
    let post = '';
    let tiktokPost = '';
    let explanation: any = null;

    try {
      const result = await model.generateContent(contentParts);
      const response = await result.response;
      const rawText = response.text().trim();
      post = rawText;

      if (rawText.includes('[POST_START]') && rawText.includes('[POST_END]')) {
        const postMatch = rawText.match(/\[POST_START\]([\s\S]*?)\[POST_END\]/);
        if (postMatch) {
          post = postMatch[1].trim();
        }
      }

      if (rawText.includes('[TIKTOK_START]') && rawText.includes('[TIKTOK_END]')) {
        const tiktokMatch = rawText.match(/\[TIKTOK_START\]([\s\S]*?)\[TIKTOK_END\]/);
        if (tiktokMatch) {
          tiktokPost = tiktokMatch[1].trim();
        }
      }

      if (rawText.includes('[EXPLANATION_START]') && rawText.includes('[EXPLANATION_END]')) {
        const expMatch = rawText.match(/\[EXPLANATION_START\]([\s\S]*?)\[EXPLANATION_END\]/);
        if (expMatch) {
          try {
            explanation = JSON.parse(expMatch[1].trim());
          } catch (e) {
            console.warn('Erreur parsing JSON explication:', e);
          }
        }
      }
    } catch (geminiError: any) {
      console.warn('Gemini API 429/Error, bascule sur le moteur de copywriting de secours:', geminiError?.message);
      
      const cleanSubject = postSubject ? postSubject.trim() : (targetUrl || videoMeta?.name || 'cette idée');
      const subjectExcerpt = cleanSubject.length > 200 ? cleanSubject.slice(0, 200) + '...' : cleanSubject;

      if (tone === 'storytelling') {
        post = `Il y a quelques mois, j'ai réalisé une chose essentielle :

« ${subjectExcerpt} »

Pendant longtemps, j'ai cru que la clé résidait dans la quantité d'efforts fournis.
La réalité ? C'est la clarté du système et l'exécution régulière qui font 90% de la différence.

Voici les 3 enseignements que j'en retiens :
1. Moins d'agitation, plus d'intention ciblée.
2. Une idée simple bien exécutée bat toujours une stratégie complexe non testée.
3. La régularité bat le talent sur le long terme.

Et vous, quelle est votre approche sur ce sujet ?

#Leadership #Productivité #Storytelling #LinkedInForge`;
      } else if (tone === 'direct' || tone === 'punchy') {
        post = `Arrêtons de compliquer ce qui est simple.

« ${subjectExcerpt} »

Ce que la plupart des professionnels ignorent :
→ L'exécution bat la perfection.
→ La clarté bat le jargon.
→ La régularité bat les coups d'éclat.

Si vous voulez avoir de l'impact, commencez par simplifier votre message.

Votre avis ?

#Conseils #Stratégie #Efficacité #LinkedInForge`;
      } else {
        post = `La majorité des professionnels font la même erreur sur leur secteur :

Ils pensent que le succès dépend d'une formule magique, alors qu'il repose sur des principes fondamentaux :

« ${subjectExcerpt} »

3 points essentiels à retenir :
• La vraie valeur réside dans la clarté de transmission.
• Une idée concrète et utile crée 10x plus d'engagement qu'un long discours théorique.
• Automatiser les tâches à faible valeur permet de se concentrer sur l'essentiel.

Quelle est votre règle d'or pour rester pertinent au quotidien ?

#Expertise #Innovation #Productivité #LinkedInForge`;
      }

      explanation = {
        chosenFamily: classification?.contentType || 'ANALYSE_EXPERTE',
        primaryHook: "Accroche directe brisant une idée reçue pour capter l'attention.",
        structureBreakdown: [
          "Mise en avant de l'idée forte sous forme de citation percutante",
          "Découpage en 3 enseignements concrets et aérés",
          "Question ouverte d'engagement en conclusion"
        ],
        whyItWorks: "Format clair et rythmé, optimisé pour l'algorithme LinkedIn et la rétention de lecture."
      };
    }

    return NextResponse.json({
      success: true,
      post,
      tiktokPost: tiktokPost || null,
      classification,
      explanation,
      hasVideo: !!videoUrl,
      videoUrl: videoUrl || null,
      targetUrl: targetUrl || null,
      screenshotUrl,
      ogImage,
    });
  } catch (error: any) {
    console.error('Erreur Autopilot API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération avec le pilote automatique.' },
      { status: 500 }
    );
  }
}
