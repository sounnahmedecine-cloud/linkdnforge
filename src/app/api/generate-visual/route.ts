import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { post, visualType, themes } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 });
    }

    let quote = '';
    if (visualType === 'quote') {
      quote = await extractAndCorrectQuote(post, apiKey);
    }

    const prompt = buildImagePrompt(post, visualType, themes, quote);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini Image API: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const inlineData = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData;

    if (!inlineData) {
      throw new Error('Aucune image dans la réponse');
    }

    return NextResponse.json({
      image: `data:${inlineData.mimeType};base64,${inlineData.data}`
    });
  } catch (error) {
    console.error('Erreur génération visuel:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du visuel' }, { status: 500 });
  }
}

async function extractAndCorrectQuote(post: string, apiKey: string): Promise<string> {
  const prompt = `Tu es un correcteur de français expert. Lis ce post LinkedIn et extrais la phrase la plus percutante et mémorable (maximum 80 caractères). Corrige toutes les fautes d'orthographe et de grammaire. Réponds UNIQUEMENT avec la phrase corrigée, sans guillemets, sans explication.

Post :
${post}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 100, temperature: 0.1 }
      })
    }
  );

  if (!response.ok) {
    const firstLine = post?.split('\n').find(l => l.trim()) || '';
    return firstLine.slice(0, 80);
  }

  const data = await response.json();
  const extracted = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  return extracted.slice(0, 80);
}

function buildImagePrompt(post: string, visualType: string, themes: string[], quote: string): string {
  const theme = themes?.[0] || 'business';

  if (visualType === 'quote') {
    return `Professional LinkedIn quote card. Minimal elegant design. Deep navy blue background (#0f172a). Render this exact French text with perfect spelling, letter by letter, no changes: "${quote}". Large white bold sans-serif font. Subtle horizontal accent line in orange (#f97316). Small "in" LinkedIn logo bottom right in white. No gradients. No people. Clean whitespace. Square 1:1 format. The text must be reproduced exactly as given, character by character.`;
  }

  return `Professional LinkedIn post illustration for the topic: "${theme}". Abstract minimal business illustration. Modern flat design. Blue and slate color palette (#0ea5e9, #1e293b, white). No text. No people. Clean geometric shapes suggesting growth, technology or expertise. Suitable as a LinkedIn post background. Landscape 1200x627 format.`;
}
