import { NextRequest, NextResponse } from 'next/server';
import { buildForgePostPrompt } from '@/lib/prompts/forge-post';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Check user authentication and quota
    const authToken = request.cookies.get('auth_token');
    let isAdmin = false;
    let unlimited = false;

    if (authToken?.value) {
      try {
        const user = JSON.parse(authToken.value);
        isAdmin = user.role === 'admin';
        unlimited = user.unlimited === true;
      } catch (e) {
        // Token parsing failed, continue as guest
      }
    }

    // For non-admin users, implement quota checking here
    if (!unlimited) {
      // TODO: Implement quota system with database tracking
      // For now, allow unlimited for all
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { post: generateMockPost(formData) },
        { status: 200 }
      );
    }

    const post = await generateWithGemini(formData, apiKey);
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}

function generateMockPost(formData: any): string {
  const themes = formData.themes?.join(', ') || 'votre domaine';
  const tone = formData.tone || 'expert';
  const objective = formData.postObjective || 'leads';
  const subject = formData.postSubject || 'votre sujet';

  return `Bonjour 👋

Je viens de réaliser quelque chose d'important sur ${themes}.

${subject}

Après plusieurs années d'expérience, j'ai découvert que les meilleures stratégies sont celles qui combinent:
✓ L'authenticité avec la structure
✓ La valeur immédiate avec le potentiel long terme
✓ Les résultats concrets avec l'impact durable

Si vous travaillez dans ${themes}, vous savez que ${objective === 'leads' ? 'générer des leads qualifiés' : 'augmenter votre visibilité'} demande une approche réfléchie.

Qu'en pensez-vous? Avez-vous rencontré des défis similaires?

#${themes.split(',')[0]?.trim().replace(/\s+/g, '')} #LinkedIn #Expertise`;
}

async function generateWithGemini(formData: any, apiKey: string): Promise<string> {
  const prompt = buildForgePostPrompt(formData);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4000, temperature: 0.9 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur Gemini API: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}
