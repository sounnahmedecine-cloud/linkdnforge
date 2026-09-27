import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { buildVideoPostPrompt } from '@/lib/prompts/video-post-prompt';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 60; // Allow maximum timeout for video analysis

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      videoUrl,
      targetUrl,
      targetUrlContent: providedContent,
      videoMeta,
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
    if (targetUrl && !targetUrlContent) {
      try {
        const scrapeRes = await fetch(`${request.nextUrl.origin}/api/scrape-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        });
        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          targetUrlContent = scrapeData.data || '';
        }
      } catch (err) {
        console.warn('Scraping URL automatique non concluant:', err);
      }
    }

    // 2. Prepare the prompt text
    const promptText = buildVideoPostPrompt({
      targetUrl,
      targetUrlContent,
      videoFileName: videoMeta?.name || 'video.mp4',
      videoDescription: videoMeta?.description || '',
      tone,
      themes,
      postObjective,
      personalExamples,
      linkedinProfile,
      targetNetwork,
      locale,
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // 3. Process video if videoUrl is present
    let contentParts: any[] = [{ text: promptText }];

    if (videoUrl) {
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

    // 4. Generate content with Gemini
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
      explanation,
      hasVideo: !!videoUrl,
      videoUrl: videoUrl || null,
      targetUrl: targetUrl || null,
    });
  } catch (error: any) {
    console.error('Erreur Autopilot API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération avec le pilote automatique.' },
      { status: 500 }
    );
  }
}
