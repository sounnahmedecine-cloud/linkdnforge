import { NextRequest, NextResponse } from 'next/server';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 120; // 2 minutes max for processing large video assembly and Google AI registration

export async function POST(request: NextRequest) {
  let fileId = '';
  let chunkIndex = 0;
  let totalChunks = 1;
  let assembledFilePath = '';

  try {
    const formData = await request.formData();
    const chunk = formData.get('chunk') as File | null;
    fileId = ((formData.get('fileId') as string) || '').replace(/[^a-zA-Z0-9_-]/g, '');
    chunkIndex = parseInt(formData.get('chunkIndex') as string, 10);
    totalChunks = parseInt(formData.get('totalChunks') as string, 10);
    const fileName = (formData.get('fileName') as string) || 'video.mp4';
    const mimeType = (formData.get('mimeType') as string) || 'video/mp4';

    if (!chunk || !fileId || isNaN(chunkIndex) || isNaN(totalChunks) || totalChunks <= 0) {
      return NextResponse.json(
        { error: 'Paramètres de téléversement invalides ou fichier manquant.' },
        { status: 400 }
      );
    }

    const tmpDir = os.tmpdir();

    // Save current chunk part
    const partFilePath = path.join(tmpDir, `upload-${fileId}-${chunkIndex}.part`);
    const chunkBytes = await chunk.arrayBuffer();
    fs.writeFileSync(partFilePath, Buffer.from(chunkBytes));

    console.log(`[Upload Chunk] Reçu segment ${chunkIndex + 1}/${totalChunks} pour ${fileId} (${(chunk.size / (1024 * 1024)).toFixed(2)} Mo)`);

    // If not the final chunk, acknowledge receipt
    if (chunkIndex < totalChunks - 1) {
      return NextResponse.json({
        success: true,
        complete: false,
        chunkIndex,
        totalChunks,
      });
    }

    // Final chunk received: verify and assemble
    console.log(`[Upload Chunk] Tous les segments reçus pour ${fileId}. Début de l'assemblage...`);

    const missingChunks: number[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const p = path.join(tmpDir, `upload-${fileId}-${i}.part`);
      if (!fs.existsSync(p)) {
        missingChunks.push(i);
      }
    }

    if (missingChunks.length > 0) {
      return NextResponse.json(
        { error: `Segments manquants détectés : ${missingChunks.join(', ')}. Veuillez réessayer le téléversement.` },
        { status: 400 }
      );
    }

    // Assemble parts into one final temp video file
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    assembledFilePath = path.join(tmpDir, `upload-${fileId}-${safeName}.tmp`);
    const writeStream = fs.createWriteStream(assembledFilePath);

    for (let i = 0; i < totalChunks; i++) {
      const partPath = path.join(tmpDir, `upload-${fileId}-${i}.part`);
      const buffer = fs.readFileSync(partPath);
      writeStream.write(buffer);
      try {
        fs.unlinkSync(partPath); // Free chunk part immediately
      } catch {
        // Ignore unlink error
      }
    }

    writeStream.end();
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });

    const finalStats = fs.statSync(assembledFilePath);
    console.log(`[Upload Chunk] Assemblage terminé avec succès : ${(finalStats.size / (1024 * 1024)).toFixed(2)} Mo.`);

    // Upload to Google AI File Manager (Gemini File API)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Gemini manquante sur le serveur.' },
        { status: 500 }
      );
    }

    const fileManager = new GoogleAIFileManager(apiKey);
    console.log('[Upload Chunk] Envoi vers Google AI File Manager...');

    const uploadResult = await fileManager.uploadFile(assembledFilePath, {
      mimeType: mimeType || 'video/mp4',
      displayName: fileName,
    });

    console.log(`[Upload Chunk] Enregistré auprès de Google AI : ${uploadResult.file.name}. En attente du statut ACTIVE...`);

    // Poll until file is processed by Google AI (Gemini indexation)
    let googleFile = await fileManager.getFile(uploadResult.file.name);
    let attempts = 0;
    while (googleFile.state === 'PROCESSING' && attempts < 30) {
      console.log(`[Upload Chunk] Traitement IA en cours (tentative ${attempts + 1})...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      googleFile = await fileManager.getFile(uploadResult.file.name);
      attempts++;
    }

    if (googleFile.state === 'FAILED') {
      throw new Error("L'indexation vidéo a échoué chez Google AI.");
    }

    console.log(`[Upload Chunk] Vidéo prête pour l'analyse IA : ${googleFile.uri}`);

    return NextResponse.json({
      success: true,
      complete: true,
      fileUri: googleFile.uri,
      fileName,
      fileSize: finalStats.size,
      mimeType: mimeType || 'video/mp4',
      googleFileName: uploadResult.file.name,
    });
  } catch (error: any) {
    console.error('[Upload Chunk] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement par segments de la vidéo.' },
      { status: 500 }
    );
  } finally {
    // Always clean up assembled file and any orphan parts for this fileId
    if (assembledFilePath && fs.existsSync(assembledFilePath)) {
      try {
        fs.unlinkSync(assembledFilePath);
      } catch {
        // ignore
      }
    }
    if (fileId) {
      const tmpDir = os.tmpdir();
      for (let i = 0; i < totalChunks; i++) {
        const p = path.join(tmpDir, `upload-${fileId}-${i}.part`);
        if (fs.existsSync(p)) {
          try {
            fs.unlinkSync(p);
          } catch {
            // ignore
          }
        }
      }
    }
  }
}
