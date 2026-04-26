import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { post: generateMockPost(formData) },
        { status: 200 }
      );
    }

    const post = await generateWithClaude(formData, apiKey);
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}

function getToneDescription(tone: string): string {
  const tones: Record<string, string> = {
    expert: 'Expert - Partage ton savoir avec autorité et certitude',
    peda: 'Pédagogique - Explique, enseigne, vulgarise pour tous',
    story: 'Storytelling - Raconte une histoire personnelle inspirante',
    humour: 'Humour - Léger, amusant, décalé sans être irrespectueux',
    inspirant: 'Inspirant - Motivant, élévateur, donne envie d\'agir'
  };
  return tones[tone] || tones.expert;
}

function getPostTypeDescription(type: string): string {
  const types: Record<string, string> = {
    story: 'Story personnelle - Raconte une anecdote ou un moment clé de ta vie',
    advice: 'Conseils - Donne 3-5 tips concrets et actionnables',
    carousel: 'Carrousel - Prépare le texte pour un carrousel (format multi-images)'
  };
  return types[type] || types.advice;
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

async function generateWithClaude(formData: any, apiKey: string): Promise<string> {
  const prompt = `Tu es un copyreader expert en LinkedIn avec 10 ans d'expérience. Tu as guidé des centaines de freelances et entrepreneurs à générer des leads via LinkedIn.

CONTEXT:
- Thèmes d'expertise: ${formData.themes?.join(', ') || 'non spécifiés'}
- Ton vocal: ${getToneDescription(formData.tone)}
- Type de post: ${getPostTypeDescription(formData.postType)}
- Objectif: ${formData.postObjective === 'leads' ? 'Générer des leads qualifiés et conversions' : 'Maximiser la visibilité et l\'engagement'}
- Profil: ${formData.linkedinProfile ? 'Profil fourni' : 'Pas de profil'}
- Sujet du post: ${formData.postSubject || 'à définir selon ton expertise'}

TA MISSION: Génère UN post LinkedIn qui va "Killer" - court, percutant, mémorable.

STRUCTURE OBLIGATOIRE:
1. ACCROCHE (1-2 lignes max): Une phrase qui STOPPE le scroll. Provoque la curiosité ou l'émotion.
2. DÉVELOPPEMENT (3-5 lignes): Le cœur du message. Raconte une histoire, partage une insight, révèle une truth que tu as découverte.
3. VALEUR/TRANSFORMATION: Montre concrètement ce que tu offres ou enseignes. Sois spécifique.
4. APPEL À L'ACTION: Termine par une question engageante, une invitation ou un défi. Quelque chose qui demande une réaction.

RÈGLES DE RYTHME:
- Alterne phrases courtes et longues
- Utilise des sauts de ligne pour la respiration
- 1 emoji maximum par paragraphe (pertinent, pas gratuit)
- Longueur totale: 200-400 caractères (c'est LinkedIn, pas un roman)

TON STYLE:
- Authentique et human (pas de robot)
- Conversationnel mais professionnel
- Basé sur ton: ${getToneDescription(formData.tone)}
- Raconte TES expériences, pas des généralités

GÉNÈRE LE POST DIRECTEMENT, SANS EXPLICATIONS.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-1',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur Claude API: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}
