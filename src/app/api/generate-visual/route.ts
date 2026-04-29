import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { post, visualType, themes } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 });
    }

    const prompt = buildImagePrompt(post, visualType, themes);

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

function buildImagePrompt(post: string, visualType: string, themes: string[]): string {
  const theme = themes?.[0] || 'business';
  const firstLine = post?.split('\n').find(l => l.trim()) || '';

  if (visualType === 'quote') {
    return `Professional LinkedIn quote card. Minimal and elegant design. Deep navy blue background (#0f172a). Large white bold sans-serif text: "${firstLine.slice(0, 80)}". Subtle horizontal accent line in orange (#f97316). Small "in" LinkedIn logo bottom right in white. No gradients. No people. Clean whitespace. Square 1:1 format.`;
  }

  return `Professional LinkedIn post illustration for the topic: "${theme}". Abstract minimal business illustration. Modern flat design. Blue and slate color palette (#0ea5e9, #1e293b, white). No text. No people. Clean geometric shapes suggesting growth, technology or expertise. Suitable as a LinkedIn post background. Landscape 1200x627 format.`;
}
