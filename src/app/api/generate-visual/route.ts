import { NextRequest, NextResponse } from 'next/server';
import { localizeThemes, resolveLocale, type PromptLocale } from '@/lib/prompts/themes';

export async function POST(request: NextRequest) {
  try {
    const { post, visualType, themes, locale: rawLocale } = await request.json();
    const locale = resolveLocale(rawLocale);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 });
    }

    let quote = '';
    if (visualType === 'quote') {
      quote = await extractAndCorrectQuote(post, apiKey, locale);
    }

    const themeLabels = localizeThemes(themes, locale);
    const prompt = buildImagePrompt(post, visualType, themeLabels, quote, locale);

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

const QUOTE_CORRECTION_PROMPTS: Record<PromptLocale, (post: string) => string> = {
  fr: (post) => `Tu es un correcteur de français expert. Lis ce post LinkedIn et extrais la phrase la plus percutante et mémorable (maximum 80 caractères). Corrige toutes les fautes d'orthographe et de grammaire. Réponds UNIQUEMENT avec la phrase corrigée, sans guillemets, sans explication.

Post :
${post}`,
  en: (post) => `You are an expert English copy editor. Read this LinkedIn post and extract the single most striking, memorable sentence (maximum 80 characters). Fix all spelling and grammar mistakes. Reply ONLY with the corrected sentence, no quotes, no explanation.

Post:
${post}`,
  es: (post) => `Eres un corrector de español experto. Lee este post de LinkedIn y extrae la frase más impactante y memorable (máximo 80 caracteres). Corrige todas las faltas de ortografía y gramática. Responde ÚNICAMENTE con la frase corregida, sin comillas, sin explicación.

Post:
${post}`,
};

async function extractAndCorrectQuote(post: string, apiKey: string, locale: PromptLocale): Promise<string> {
  const prompt = QUOTE_CORRECTION_PROMPTS[locale](post);

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

const LANGUAGE_NAMES: Record<PromptLocale, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
};

function buildImagePrompt(post: string, visualType: string, themeLabels: string[], quote: string, locale: PromptLocale): string {
  const theme = themeLabels?.[0] || 'business';

  if (visualType === 'quote') {
    return `Professional LinkedIn quote card. Minimal elegant design. Deep navy blue background (#0f172a). Render this exact ${LANGUAGE_NAMES[locale]} text with perfect spelling, letter by letter, no changes: "${quote}". Large white bold sans-serif font. Subtle horizontal accent line in orange (#f97316). Small "in" LinkedIn logo bottom right in white. No gradients. No people. Clean whitespace. Square 1:1 format. The text must be reproduced exactly as given, character by character.`;
  }

  return `Professional LinkedIn post illustration for the topic: "${theme}". Abstract minimal business illustration. Modern flat design. Blue and slate color palette (#0ea5e9, #1e293b, white). No text. No people. Clean geometric shapes suggesting growth, technology or expertise. Suitable as a LinkedIn post background. Landscape 1200x627 format.`;
}
