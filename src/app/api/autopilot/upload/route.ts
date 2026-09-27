import { NextRequest, NextResponse } from 'next/server';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 120; // 2 minutes max for uploading and registering with Google AI

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Gemini manquante sur le serveur.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier vidéo reçu.' }, { status: 400 });
    }

    console.log(`Réception de la vidéo : ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} Mo)`);

    // Convert file to buffer and save to temp file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const tempFilePath = path.join(os.tmpdir(), `autopilot-${Date.now()}-${safeName}`);
    fs.writeFileSync(tempFilePath, buffer);

    try {
      // Upload directly to Google AI Studio File API (Gemini storage)
      const fileManager = new GoogleAIFileManager(apiKey);
      console.log('Envoi vers Google AI File Manager...');
      
      const uploadResult = await fileManager.uploadFile(tempFilePath, {
        mimeType: file.type || 'video/mp4',
        displayName: file.name,
      });

      console.log(`Fichier envoyé à Google AI avec succès : ${uploadResult.file.name}`);

      // Poll until file is processed by Google AI (usually takes 5 to 20 seconds)
      let googleFile = await fileManager.getFile(uploadResult.file.name);
      let attempts = 0;
      while (googleFile.state === 'PROCESSING' && attempts < 30) {
        console.log(`Traitement vidéo en cours chez Google AI... (tentative ${attempts + 1})`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        googleFile = await fileManager.getFile(uploadResult.file.name);
        attempts++;
      }

      if (googleFile.state === 'FAILED') {
        throw new Error('Le traitement vidéo a échoué chez Google AI.');
      }

      console.log(`Fichier prêt pour l’analyse multimodale : ${googleFile.uri}`);

      return NextResponse.json({
        success: true,
        fileUri: googleFile.uri,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'video/mp4',
        googleFileName: uploadResult.file.name,
      });
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  } catch (error: any) {
    console.error('Erreur API Upload Autopilot:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement de la vidéo.' },
      { status: 500 }
    );
  }
}
