import { NextRequest, NextResponse } from 'next/server';
import { resolveLocale, type PromptLocale } from '@/lib/prompts/themes';

export async function POST(request: NextRequest) {
  try {
    const { content, locale: rawLocale } = await request.json();
    const locale = resolveLocale(rawLocale);

    if (!content) {
      return NextResponse.json(
        { error: 'Le contenu est requis' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Clé API manquante. Ajoutez GEMINI_API_KEY à vos variables d\'environnement',
          variants: mockVariants(content)
        },
        { status: 200 }
      );
    }

    const variants = await generateWithGemini(content, apiKey, locale);

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}

function mockVariants(originalContent: string) {
  return [
    {
      id: 1,
      text: originalContent + '\n\n→ Variante 1: Avec accent sur les résultats et ROI',
      score: 82
    },
    {
      id: 2,
      text: originalContent + '\n\n→ Variante 2: Avec storytelling et expérience personnelle',
      score: 88
    },
    {
      id: 3,
      text: originalContent + '\n\n→ Variante 3: Avec call-to-action et engagement',
      score: 75
    }
  ];
}

const VARIANTS_PROMPTS: Record<PromptLocale, (content: string) => string> = {
  fr: (content) => `Tu es un expert LinkedIn. Génère 3 variantes optimisées du post suivant pour maximiser l'engagement. Pour chaque variante, assigne un score d'engagement de 0-100.

Réponds UNIQUEMENT avec ce JSON (sans markdown, sans explication):
{"variants":[{"text":"variante 1","score":85},{"text":"variante 2","score":90},{"text":"variante 3","score":78}]}

Post original:
${content}`,
  en: (content) => `You are a LinkedIn expert. Generate 3 optimized variants of the following post to maximize engagement. For each variant, assign an engagement score from 0-100.

Reply ONLY with this JSON (no markdown, no explanation):
{"variants":[{"text":"variant 1","score":85},{"text":"variant 2","score":90},{"text":"variant 3","score":78}]}

Original post:
${content}`,
  es: (content) => `Eres un experto de LinkedIn. Genera 3 variantes optimizadas del siguiente post para maximizar el engagement. Para cada variante, asigna una puntuación de engagement de 0-100.

Responde ÚNICAMENTE con este JSON (sin markdown, sin explicación):
{"variants":[{"text":"variante 1","score":85},{"text":"variante 2","score":90},{"text":"variante 3","score":78}]}

Post original:
${content}`,
};

async function generateWithGemini(content: string, apiKey: string, locale: PromptLocale) {
  const prompt = VARIANTS_PROMPTS[locale](content);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur Gemini API: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  try {
    const parsed = JSON.parse(text);
    return parsed.variants.map((v: any, idx: number) => ({
      id: idx + 1,
      text: v.text,
      score: v.score
    }));
  } catch {
    return mockVariants(content);
  }
}
