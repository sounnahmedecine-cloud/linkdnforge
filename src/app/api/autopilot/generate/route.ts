import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { buildVideoPostPrompt } from '@/lib/prompts/video-post-prompt';
import {
  buildClassifierPrompt,
  fallbackClassification,
  ClassificationResult,
} from '@/lib/prompts/content-classifier';
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
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Gemini non configurée sur le serveur.' },
        { status: 500 }
      );
    }

    // 1. Scrape target URL if provided and not yet scraped
    let targetUrlContent = providedContent || '';
    let screenshotUrl = targetUrl
      ? `https://s0.wp.com/mshots/v1/${encodeURIComponent(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`)}?w=1200&h=675`
      : null;
    let ogImage: string | null = null;

    if (targetUrl) {
      try {
        const scrapeRes = await fetch(`${request.nextUrl.origin}/api/scrape-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        });
        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          if (!targetUrlContent) {
            targetUrlContent = scrapeData.data || '';
          }
          if (scrapeData.screenshotUrl) {
            screenshotUrl = scrapeData.screenshotUrl;
          }
          if (scrapeData.ogImage) {
            ogImage = scrapeData.ogImage;
          }
        }
      } catch (err) {
        console.warn('Scraping URL automatique non concluant:', err);
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

    // 5. Génération finale avec Gemini
    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const rawText = response.text().trim();

    let post = rawText;
    let explanation: any = null;

    if (rawText.includes('[POST_START]') && rawText.includes('[POST_END]')) {
      const postMatch = rawText.match(/\[POST_START\]([\s\S]*?)\[POST_END\]/);
      if (postMatch) {
        post = postMatch[1].trim();
      }
    }

    let tiktokPost = '';
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
