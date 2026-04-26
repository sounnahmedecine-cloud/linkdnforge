import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Le contenu est requis' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Clé API manquante. Ajoutez ANTHROPIC_API_KEY à vos variables d\'environnement',
          variants: mockVariants(content)
        },
        { status: 200 }
      );
    }

    const variants = await generateWithClaude(content, apiKey);

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

async function generateWithClaude(content: string, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-1',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Tu es un expert LinkedIn. Génère 3 variantes optimisées du post suivant pour maximiser l'engagement. Pour chaque variante, assign un score d'engagement de 0-100.

Format de réponse (JSON):
{
  "variants": [
    {"text": "variante 1", "score": 85},
    {"text": "variante 2", "score": 90},
    {"text": "variante 3", "score": 78}
  ]
}

Post original:
${content}`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur Claude API: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

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
