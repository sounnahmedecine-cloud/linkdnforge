import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders();

  try {
    const body = await request.json();
    const { url, title, selectedText, tone = 'authority', locale = 'fr' } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const mockResult = generateMockExtensionPost({ url, title, selectedText, tone, locale });
      return NextResponse.json(mockResult, { headers: corsHeaders });
    }

    const result = await generateExtensionPostWithGemini({ url, title, selectedText, tone, locale }, apiKey);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Extension Generate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du post' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function getToneInstructions(tone: string): string {
  switch (tone) {
    case 'storytelling':
      return 'Ton narratif, captivant, débutant par une anecdote ou une situation vécue, avec de l’émotion et une leçon claire.';
    case 'educational':
    case 'educatif':
      return 'Ton pédagogique, structuré avec des points clés numérotés ou à puces, valeur actionnable immédiate, conseils concrets.';
    case 'direct':
      return 'Ton incisif, phrases courtes, sans fioritures, prise de position forte, va droit au but.';
    case 'conversational':
    case 'conversationnel':
      return 'Ton accessible, amical, engageant, comme une discussion entre pairs, incitant au débat et aux commentaires.';
    case 'authority':
    case 'autorite':
    default:
      return 'Ton d’expert reconnu, posture affirmée, vision stratégique, analyse percutante et crédible.';
  }
}

async function generateExtensionPostWithGemini(
  data: { url?: string; title?: string; selectedText?: string; tone?: string; locale?: string },
  apiKey: string
): Promise<{ post: string; hooks: string[]; title: string }> {
  const toneInstruction = getToneInstructions(data.tone || 'authority');

  const prompt = `Tu es le Ghostwriter IA de LinkedInForge, expert mondial en copywriting LinkedIn organique et viral.
Ta mission est de forger un post LinkedIn complet de haute qualité à partir d'un contenu web capturé par l'utilisateur.

SOURCE CAPTURÉE :
- Titre de la page : ${data.title || 'Non renseigné'}
- URL de la page : ${data.url || 'Non renseignée'}
- Extrait sélectionné par l'utilisateur : ${data.selectedText ? `"${data.selectedText}"` : 'Aucun texte spécifique sélectionné (se baser sur le titre/contexte de la page)'}

DIRECTIVES DE RÉDACTION :
- Langue : ${data.locale === 'en' ? 'Anglais' : data.locale === 'es' ? 'Espagnol' : 'Français'}
- Tonalité : ${toneInstruction}
- Structure LinkedIn à fort impact :
  1. Hook (première phrase percutante qui donne envie de cliquer sur "...voir plus")
  2. Le corps du post (aéré, sauts de lignes fréquents, rythme dynamique, liste à puces ou points clés bien visibles)
  3. La leçon / valeur clé tirée de la source
  4. Call to Action (CTA) invitant à la réflexion ou au partage en commentaire
  5. 2 à 4 hashtags pertinents à la fin.
- Pas de blabla promotionnel artificiel : du contenu authentique, percutant et mémorable.

PROPOSE AUSSI 3 VARIANTES DE HOOKS ALTERNATIFS :
- Hook 1 : Axé sur la curiosité / contre-intuitif
- Hook 2 : Axé sur le chiffre / résultat direct
- Hook 3 : Axé sur la question / défi d'opinion

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict, aucun texte avant ou après le JSON) :
{
  "post": "Le texte complet du post forgé...",
  "hooks": [
    "Variante de hook 1...",
    "Variante de hook 2...",
    "Variante de hook 3..."
  ],
  "title": "${(data.title || 'Post Forgé').replace(/"/g, "'")}"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 2500,
            temperature: 0.85,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API returned ${response.status} (${response.statusText}). Activating resilient fallback.`);
      return generateMockExtensionPost(data);
    }

    const resJson = await response.json();
    const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';

    const parsed = JSON.parse(text);
    return {
      post: parsed.post || text,
      hooks: Array.isArray(parsed.hooks) && parsed.hooks.length > 0 ? parsed.hooks : [
        'Voici ce que la plupart des professionnels ignorent sur ce sujet :',
        '3 leçons que j’aurais aimé comprendre 2 ans plus tôt :',
        'Et si votre approche était totalement à l’envers ?'
      ],
      title: parsed.title || data.title || 'Brouillon capturé',
    };
  } catch (e) {
    console.warn('Gemini generation error or parse error, fallback:', e);
    return generateMockExtensionPost(data);
  }
}


function generateMockExtensionPost(data: { url?: string; title?: string; selectedText?: string; tone?: string; locale?: string }) {
  const contentSubject = data.selectedText || data.title || 'cette idée clé';
  return {
    title: data.title || 'Brouillon capturé',
    post: `J'ai lu ceci récemment, et impossible de ne pas le partager :

« ${contentSubject} »

Voici les 3 enseignements majeurs que vous devriez en retenir dès aujourd'hui :

1️⃣ Ce qui semblait complexe devient un levier stratégique quand on l'applique avec clarté.
2️⃣ La plupart des professionnels passent à côté en cherchant la complication.
3️⃣ L'exécution régulière bat toujours le plan parfait non testé.

💡 Votre avis sur la question ? Comment intégrez-vous cette approche dans votre quotidien ?

${data.url ? `(Source : ${data.url})` : ''}

#Leadership #Productivité #Innovation #LinkedInForge`,
    hooks: [
      `La plupart des gens lisent ceci sans en voir l'impact. Voici pourquoi c'est une erreur :`,
      `En appliquant ce principe simple, vous gagnez 6 mois d'avance :`,
      `Est-ce que vous faites aussi cette erreur sans vous en rendre compte ?`
    ]
  };
}
