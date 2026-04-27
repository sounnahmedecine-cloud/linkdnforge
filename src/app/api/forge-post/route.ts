import { NextRequest, NextResponse } from 'next/server';

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
    carousel: 'Carrousel - Prépare le texte pour un carrousel (format multi-images)',
    ghostwriter: 'Ghostwriter - Hook + 3 insights contre-intuitifs + CTA (150 mots, style personnel)'
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

async function generateWithGemini(formData: any, apiKey: string): Promise<string> {
  const isGhostwriter = formData.postType === 'ghostwriter';
  const prompt = isGhostwriter ? buildGhostwriterPrompt(formData) : buildStandardPrompt(formData);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.9 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur Gemini API: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

function buildGhostwriterPrompt(formData: any): string {
  return `Tu es un ghostwriter LinkedIn pour entrepreneurs tech francophones.
${formData.personalExamples ? `
STYLE DE L'UTILISATEUR — imite sa voix, son rythme, ses tournures:
${formData.personalExamples}
` : ''}
${formData.linkedinProfile ? `PROFIL LINKEDIN:\n${formData.linkedinProfile}\n` : ''}
THÈMES: ${formData.themes?.join(', ') || 'Tech/Entrepreneuriat'}
OBJECTIF: ${formData.postObjective === 'leads' ? 'Générer des leads' : 'Visibilité & engagement'}
SUJET: ${formData.postSubject || 'à définir selon le profil'}

STRUCTURE OBLIGATOIRE:
1. Hook (1-2 lignes) : question percutante OU anecdote personnelle concrète
2. 3 insights contre-intuitifs (courts, directs, surprenants)
3. CTA : "Et vous ? [question précise]" ou invitation à commenter

RÈGLES NON NÉGOCIABLES:
- 150 mots maximum
- ZÉRO tournures IA : pas de "déclic", "game-changer", "révolutionnaire", "j'ai réalisé que"
- Ton humain, pro, direct — jamais générique
- 0-2 emojis maximum
- Si exemples fournis, colle exactement au style de l'utilisateur

GÉNÈRE LE POST DIRECTEMENT, SANS INTRODUCTION NI EXPLICATION.`;
}

function buildStandardPrompt(formData: any): string {
  return `Tu es un copyreader expert en LinkedIn avec 10 ans d'expérience. Tu as guidé des centaines de freelances et entrepreneurs à générer des leads via LinkedIn.

CONTEXT:
- Thèmes d'expertise: ${formData.themes?.join(', ') || 'non spécifiés'}
- Ton vocal: ${getToneDescription(formData.tone)}
- Type de post: ${getPostTypeDescription(formData.postType)}
- Objectif: ${formData.postObjective === 'leads' ? 'Générer des leads qualifiés et conversions' : 'Maximiser la visibilité et l\'engagement'}
${formData.linkedinProfile ? `- Profil LinkedIn: ${formData.linkedinProfile}` : ''}
${formData.personalExamples ? `- Posts précédents (imite ce style): ${formData.personalExamples}` : ''}
- Sujet du post: ${formData.postSubject || 'à définir selon ton expertise'}

TA MISSION: Génère UN post LinkedIn qui va "Killer" - court, percutant, mémorable.

RÈGLES CRITIQUES:
- ❌ PAS de "Bonjour 👋 Je viens de réaliser que..."
- ❌ PAS de "Après plusieurs années d'expérience..."
- ✅ SPÉCIFIQUE et PERSONNEL: anecdote réelle, chiffre concret, observation unique

STRUCTURE:
1. ACCROCHE (1-2 lignes): observation choquante, contradiction, question qui tue
2. CONTEXTE (2-3 lignes): problème ou dilemme, intègre le sujet naturellement
3. RÉVÉLATION (2-3 lignes): ce que tu as découvert ou compris
4. CTA (1 ligne): question directe

RYTHME: phrases courtes + longues, sauts de ligne, 0-2 emojis max, 150-350 mots

GÉNÈRE LE POST DIRECTEMENT, SANS EXPLICATIONS NI PREAMBULLE.`;
}
