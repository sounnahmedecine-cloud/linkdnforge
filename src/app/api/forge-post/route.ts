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

function buildGhostwriterPrompt(formData: any): string {
  return `Tu es un expert LinkedIn francophone qui écrit à la PREMIÈRE PERSONNE DU SINGULIER (je, j'ai, mon, ma, mes).
Tu vas rédiger un vrai post LinkedIn développé, humain, expert — pas un résumé, pas une liste vide.
${formData.personalExamples ? `\nSTYLE À IMITER (voix, rythme, tournures de l'utilisateur) :\n${formData.personalExamples}\n` : ''}
${formData.linkedinProfile ? `PROFIL LINKEDIN :\n${formData.linkedinProfile}\n` : ''}
THÈMES : ${formData.themes?.join(', ') || 'Entrepreneuriat / Tech / Business'}
OBJECTIF : ${formData.postObjective === 'leads' ? 'Générer des leads — montrer mon expertise, donner envie de me contacter' : 'Visibilité & engagement — toucher un max de personnes'}
SUJET DU POST : ${formData.postSubject || 'Mon expertise et ce que j\'ai appris'}

STRUCTURE OBLIGATOIRE (développe CHAQUE partie en profondeur, NE RÉSUME PAS) :
1. HOOK (2-3 lignes) : accroche forte à la 1ère personne — question provocante, chiffre concret, ou mini-anecdote personnelle qui intrigue
2. CONTEXTE & PROBLÈME (4-6 lignes) : décris le problème que tu as vécu ou observé, avec des détails concrets — noms, situations, chiffres réels
3. TON HISTOIRE / TA SOLUTION (6-10 lignes) : raconte ce que TU as fait, construit ou découvert — étapes, obstacles, ce qui a marché, ce qui a échoué
4. 3 INSIGHTS CLÉS (3 x 3-4 lignes chacun) : trois leçons concrètes tirées de ton expérience, expliquées en détail, pas juste listées
5. CONCLUSION & ENSEIGNEMENT (3-4 lignes) : ce que ça t'a appris au fond, pourquoi c'est important, ton point de vue personnel
6. CTA (1-2 lignes) : question directe et engageante au lecteur

RÈGLES ABSOLUES :
- TOUJOURS à la 1ère personne du singulier : "J'ai créé", "Je vois", "Mon expérience", "Chez moi", "J'ai décidé"
- JAMAIS à la 2ème personne pour parler de l'auteur
- 800 mots MINIMUM — c'est un post long, complet, qui apporte de la vraie valeur
- Chaque idée doit être développée, expliquée, illustrée — pas juste mentionnée
- ZÉRO jargon IA : pas de "déclic", "game-changer", "révolutionnaire", "j'ai réalisé que", "en tant qu'entrepreneur"
- Ton humain, direct, expert — concret, spécifique, jamais générique
- 0-2 emojis max, placés naturellement
- Sauts de ligne fréquents entre les idées pour la lisibilité LinkedIn

GÉNÈRE LE POST DIRECTEMENT, SANS INTRODUCTION NI EXPLICATION. NE T'ARRÊTE PAS AVANT 800 MOTS.`;
}

function buildStandardPrompt(formData: any): string {
  return `Tu es un expert LinkedIn francophone qui écrit à la PREMIÈRE PERSONNE DU SINGULIER (je, j'ai, mon, ma, mes).
Tu rédiges un post LinkedIn complet, humain et expert — pas un résumé, un vrai post développé.

CONTEXTE :
- Thèmes : ${formData.themes?.join(', ') || 'Entrepreneuriat / Business / Tech'}
- Ton : ${getToneDescription(formData.tone)}
- Type : ${getPostTypeDescription(formData.postType)}
- Objectif : ${formData.postObjective === 'leads' ? 'Générer des leads — montrer mon expertise, donner envie de me contacter' : 'Visibilité & engagement — toucher un max de personnes'}
${formData.linkedinProfile ? `- Profil LinkedIn : ${formData.linkedinProfile}` : ''}
${formData.personalExamples ? `- Style à imiter (voix de l'utilisateur) : ${formData.personalExamples}` : ''}
- Sujet : ${formData.postSubject || 'Mon expertise et ce que j\'ai appris'}

STRUCTURE (développe CHAQUE partie en profondeur, NE RÉSUME PAS) :
1. HOOK (2-3 lignes) : accroche forte à la 1ère personne — question provocante, chiffre concret, ou mini-anecdote personnelle qui intrigue
2. CONTEXTE & PROBLÈME (4-6 lignes) : décris le problème vécu ou observé, avec des détails concrets — situations réelles, chiffres, noms
3. TON HISTOIRE / TA SOLUTION (6-10 lignes) : raconte ce que TU as fait, construit ou découvert — étapes, obstacles, ce qui a marché, ce qui a échoué
4. 3 INSIGHTS CLÉS (3 x 3-4 lignes chacun) : trois leçons concrètes tirées de l'expérience, expliquées en détail, pas juste listées
5. CONCLUSION & ENSEIGNEMENT (3-4 lignes) : ce que ça t'a appris au fond, pourquoi c'est important, ton point de vue personnel
6. CTA (1-2 lignes) : question directe et engageante au lecteur

RÈGLES ABSOLUES :
- TOUJOURS à la 1ère personne du singulier : "J'ai", "Je", "Mon", "Ma", "Chez moi", "J'ai décidé"
- JAMAIS : "Bonjour 👋", "Après plusieurs années d'expérience...", "En tant qu'entrepreneur..."
- 800 mots MINIMUM — post long, complet, qui apporte de la vraie valeur
- Chaque idée doit être développée, expliquée, illustrée — pas juste mentionnée
- Ton humain, direct, expert — concret et spécifique, jamais générique
- 0-2 emojis max
- Sauts de ligne fréquents entre les idées pour la lisibilité LinkedIn

GÉNÈRE LE POST DIRECTEMENT, SANS INTRODUCTION NI EXPLICATION. NE T'ARRÊTE PAS AVANT 800 MOTS.`;
}
