import { localizeThemes, resolveLocale, type PromptLocale } from './themes';

interface ForgePostFormData {
  themes?: string[];
  tone?: string;
  postType?: string;
  postObjective?: string;
  postSubject?: string;
  linkedinProfile?: string;
  personalExamples?: string;
  locale?: string;
}

const TONE_DESCRIPTIONS: Record<PromptLocale, Record<string, string>> = {
  fr: {
    expert: 'Expert - Partage ton savoir avec autorité et certitude',
    peda: 'Pédagogique - Explique, enseigne, vulgarise pour tous',
    story: 'Storytelling - Raconte une histoire personnelle inspirante',
    humour: 'Humour - Léger, amusant, décalé sans être irrespectueux',
    inspirant: 'Inspirant - Motivant, élévateur, donne envie d\'agir',
  },
  en: {
    expert: 'Expert - Share your knowledge with authority and confidence',
    peda: 'Educational - Explain, teach, make it accessible to everyone',
    story: 'Storytelling - Tell an inspiring personal story',
    humour: 'Humor - Light, fun, playful without being disrespectful',
    inspirant: 'Inspirational - Motivating, uplifting, makes people want to act',
  },
  es: {
    expert: 'Experto - Comparte tu conocimiento con autoridad y seguridad',
    peda: 'Pedagógico - Explica, enseña, hazlo accesible para todos',
    story: 'Storytelling - Cuenta una historia personal inspiradora',
    humour: 'Humor - Ligero, divertido, desenfadado sin faltar al respeto',
    inspirant: 'Inspirador - Motivador, elevador, invita a la acción',
  },
};

const POST_TYPE_DESCRIPTIONS: Record<PromptLocale, Record<string, string>> = {
  fr: {
    story: 'Story personnelle - Raconte une anecdote ou un moment clé de ta vie',
    advice: 'Conseils - Donne 3-5 tips concrets et actionnables',
    carousel: 'Carrousel - Prépare le texte pour un carrousel (format multi-images)',
    ghostwriter: 'Ghostwriter - Hook + 3 insights contre-intuitifs + CTA (150 mots, style personnel)',
  },
  en: {
    story: 'Personal story - Tell an anecdote or a key moment of your life',
    advice: 'Advice - Give 3-5 concrete, actionable tips',
    carousel: 'Carousel - Prepare the text for a carousel (multi-image format)',
    ghostwriter: 'Ghostwriter - Hook + 3 counter-intuitive insights + CTA (150 words, personal style)',
  },
  es: {
    story: 'Historia personal - Cuenta una anécdota o un momento clave de tu vida',
    advice: 'Consejos - Da 3-5 tips concretos y accionables',
    carousel: 'Carrusel - Prepara el texto para un carrusel (formato multi-imagen)',
    ghostwriter: 'Ghostwriter - Hook + 3 insights contraintuitivos + CTA (150 palabras, estilo personal)',
  },
};

function getToneDescription(tone: string | undefined, locale: PromptLocale): string {
  const tones = TONE_DESCRIPTIONS[locale];
  return tones[tone ?? ''] || tones.expert;
}

function getPostTypeDescription(type: string | undefined, locale: PromptLocale): string {
  const types = POST_TYPE_DESCRIPTIONS[locale];
  return types[type ?? ''] || types.advice;
}

function objectiveText(postObjective: string | undefined, locale: PromptLocale): string {
  const isLeads = postObjective === 'leads';
  if (locale === 'en') {
    return isLeads
      ? 'Generate leads — show my expertise, make people want to reach out'
      : 'Visibility & engagement — reach as many people as possible';
  }
  if (locale === 'es') {
    return isLeads
      ? 'Generar leads — mostrar mi experiencia, dar ganas de contactarme'
      : 'Visibilidad y engagement — llegar al máximo de personas posible';
  }
  return isLeads
    ? 'Générer des leads — montrer mon expertise, donner envie de me contacter'
    : 'Visibilité & engagement — toucher un max de personnes';
}

function buildGhostwriterPromptFr(formData: ForgePostFormData, themeLabels: string[]): string {
  return `Tu es un expert LinkedIn francophone qui écrit à la PREMIÈRE PERSONNE DU SINGULIER (je, j'ai, mon, ma, mes).
Tu vas rédiger un vrai post LinkedIn développé, humain, expert — pas un résumé, pas une liste vide.
${formData.personalExamples ? `\nSTYLE À IMITER (voix, rythme, tournures de l'utilisateur) :\n${formData.personalExamples}\n` : ''}
${formData.linkedinProfile ? `PROFIL LINKEDIN :\n${formData.linkedinProfile}\n` : ''}
THÈMES : ${themeLabels.join(', ') || 'Entrepreneuriat / Tech / Business'}
OBJECTIF : ${objectiveText(formData.postObjective, 'fr')}
SUJET DU POST : ${formData.postSubject || 'Mon expertise et ce que j\'ai appris'}

STRUCTURE OBLIGATOIRE :
1. HOOK (2-3 lignes) : accroche forte à la 1ère personne — question provocante, chiffre concret, ou mini-anecdote qui intrigue
2. DÉVELOPPEMENT (8-10 lignes) : explique le problème vécu, ce que tu as fait, 2 insights concrets tirés de ton expérience
3. ENSEIGNEMENT (2-3 lignes) : la leçon clé, ton point de vue personnel
4. CTA (1 ligne) : question directe au lecteur

RÈGLES ABSOLUES :
- TOUJOURS à la 1ère personne du singulier : "J'ai créé", "Je vois", "Mon expérience", "Chez moi", "J'ai décidé"
- JAMAIS à la 2ème personne pour parler de l'auteur
- 300 à 350 mots MAXIMUM — c'est un post long, complet, qui apporte de la vraie valeur
- Chaque idée doit être développée, expliquée, illustrée — pas juste mentionnée
- ZÉRO jargon IA : pas de "déclic", "game-changer", "révolutionnaire", "j'ai réalisé que", "en tant qu'entrepreneur"
- Ton humain, direct, expert — concret, spécifique, jamais générique
- 0-2 emojis max, placés naturellement
- Sauts de ligne fréquents entre les idées pour la lisibilité LinkedIn

GÉNÈRE LE POST DIRECTEMENT, SANS INTRODUCTION NI EXPLICATION. RESPECTE STRICTEMENT LA LIMITE DE 400 MOTS.`;
}

function buildGhostwriterPromptEn(formData: ForgePostFormData, themeLabels: string[]): string {
  return `You are an English-speaking LinkedIn expert writing in the FIRST PERSON SINGULAR (I, I've, my).
You will write a real, developed, human, expert LinkedIn post — not a summary, not an empty list.
${formData.personalExamples ? `\nSTYLE TO MATCH (the user's voice, rhythm, phrasing):\n${formData.personalExamples}\n` : ''}
${formData.linkedinProfile ? `LINKEDIN PROFILE:\n${formData.linkedinProfile}\n` : ''}
TOPICS: ${themeLabels.join(', ') || 'Entrepreneurship / Tech / Business'}
OBJECTIVE: ${objectiveText(formData.postObjective, 'en')}
POST TOPIC: ${formData.postSubject || 'My expertise and what I\'ve learned'}

REQUIRED STRUCTURE:
1. HOOK (2-3 lines): strong first-person opener — a provocative question, a concrete number, or a short intriguing anecdote
2. BODY (8-10 lines): explain the problem you lived through, what you did, 2 concrete insights from your experience
3. TAKEAWAY (2-3 lines): the key lesson, your personal point of view
4. CTA (1 line): a direct question to the reader

ABSOLUTE RULES:
- ALWAYS first person singular: "I built", "I see", "My experience", "In my case", "I decided"
- NEVER second person when talking about the author
- 300 to 350 words MAXIMUM — this is a long, complete post that delivers real value
- Every idea must be developed, explained, illustrated — not just mentioned
- ZERO AI jargon: no "game-changer", "revolutionary", "unlock", "I realized that", "as an entrepreneur"
- Human, direct, expert tone — concrete, specific, never generic
- 0-2 emojis max, placed naturally
- Frequent line breaks between ideas for LinkedIn readability

GENERATE THE POST DIRECTLY, WITHOUT INTRODUCTION OR EXPLANATION. STRICTLY RESPECT THE 400-WORD LIMIT.`;
}

function buildGhostwriterPromptEs(formData: ForgePostFormData, themeLabels: string[]): string {
  return `Eres un experto de LinkedIn hispanohablante que escribe en PRIMERA PERSONA DEL SINGULAR (yo, he, mi).
Vas a redactar un post de LinkedIn real, desarrollado, humano y experto — no un resumen, no una lista vacía.
${formData.personalExamples ? `\nESTILO A IMITAR (voz, ritmo, giros del usuario):\n${formData.personalExamples}\n` : ''}
${formData.linkedinProfile ? `PERFIL DE LINKEDIN:\n${formData.linkedinProfile}\n` : ''}
TEMAS: ${themeLabels.join(', ') || 'Emprendimiento / Tech / Negocios'}
OBJETIVO: ${objectiveText(formData.postObjective, 'es')}
TEMA DEL POST: ${formData.postSubject || 'Mi experiencia y lo que he aprendido'}

ESTRUCTURA OBLIGATORIA:
1. HOOK (2-3 líneas): apertura potente en primera persona — pregunta provocadora, cifra concreta o mini-anécdota que enganche
2. DESARROLLO (8-10 líneas): explica el problema vivido, lo que hiciste, 2 insights concretos de tu experiencia
3. APRENDIZAJE (2-3 líneas): la lección clave, tu punto de vista personal
4. CTA (1 línea): pregunta directa al lector

REGLAS ABSOLUTAS:
- SIEMPRE en primera persona del singular: "Creé", "Veo", "Mi experiencia", "En mi caso", "Decidí"
- NUNCA en segunda persona al hablar del autor
- 300 a 350 palabras MÁXIMO — es un post largo, completo, que aporta valor real
- Cada idea debe estar desarrollada, explicada, ilustrada — no solo mencionada
- CERO jerga de IA: nada de "game-changer", "revolucionario", "me di cuenta de que", "como emprendedor"
- Tono humano, directo, experto — concreto, específico, nunca genérico
- 0-2 emojis máximo, colocados con naturalidad
- Saltos de línea frecuentes entre ideas para la legibilidad en LinkedIn

GENERA EL POST DIRECTAMENTE, SIN INTRODUCCIÓN NI EXPLICACIÓN. RESPETA ESTRICTAMENTE EL LÍMITE DE 400 PALABRAS.`;
}

function buildStandardPromptFr(formData: ForgePostFormData, themeLabels: string[]): string {
  return `Tu es un expert LinkedIn francophone qui écrit à la PREMIÈRE PERSONNE DU SINGULIER (je, j'ai, mon, ma, mes).
Tu rédiges un post LinkedIn complet, humain et expert — pas un résumé, un vrai post développé.

CONTEXTE :
- Thèmes : ${themeLabels.join(', ') || 'Entrepreneuriat / Business / Tech'}
- Ton : ${getToneDescription(formData.tone, 'fr')}
- Type : ${getPostTypeDescription(formData.postType, 'fr')}
- Objectif : ${objectiveText(formData.postObjective, 'fr')}
${formData.linkedinProfile ? `- Profil LinkedIn : ${formData.linkedinProfile}` : ''}
${formData.personalExamples ? `- Style à imiter (voix de l'utilisateur) : ${formData.personalExamples}` : ''}
- Sujet : ${formData.postSubject || 'Mon expertise et ce que j\'ai appris'}

STRUCTURE OBLIGATOIRE :
1. HOOK (2-3 lignes) : accroche forte à la 1ère personne — question provocante, chiffre concret, ou mini-anecdote qui intrigue
2. DÉVELOPPEMENT (8-10 lignes) : explique le problème vécu, ce que tu as fait, 2 insights concrets tirés de ton expérience
3. ENSEIGNEMENT (2-3 lignes) : la leçon clé, ton point de vue personnel
4. CTA (1 ligne) : question directe au lecteur

RÈGLES ABSOLUES :
- TOUJOURS à la 1ère personne du singulier : "J'ai", "Je", "Mon", "Ma", "Chez moi", "J'ai décidé"
- JAMAIS : "Bonjour 👋", "Après plusieurs années d'expérience...", "En tant qu'entrepreneur..."
- 300 à 350 mots MAXIMUM — post long, complet, qui apporte de la vraie valeur
- Chaque idée doit être développée, expliquée, illustrée — pas juste mentionnée
- Ton humain, direct, expert — concret et spécifique, jamais générique
- 0-2 emojis max
- Sauts de ligne fréquents entre les idées pour la lisibilité LinkedIn

GÉNÈRE LE POST DIRECTEMENT, SANS INTRODUCTION NI EXPLICATION. RESPECTE STRICTEMENT LA LIMITE DE 400 MOTS.`;
}

function buildStandardPromptEn(formData: ForgePostFormData, themeLabels: string[]): string {
  return `You are an English-speaking LinkedIn expert writing in the FIRST PERSON SINGULAR (I, I've, my).
You write a complete, human, expert LinkedIn post — not a summary, a real developed post.

CONTEXT:
- Topics: ${themeLabels.join(', ') || 'Entrepreneurship / Business / Tech'}
- Tone: ${getToneDescription(formData.tone, 'en')}
- Type: ${getPostTypeDescription(formData.postType, 'en')}
- Objective: ${objectiveText(formData.postObjective, 'en')}
${formData.linkedinProfile ? `- LinkedIn profile: ${formData.linkedinProfile}` : ''}
${formData.personalExamples ? `- Style to match (user's voice): ${formData.personalExamples}` : ''}
- Topic: ${formData.postSubject || 'My expertise and what I\'ve learned'}

REQUIRED STRUCTURE:
1. HOOK (2-3 lines): strong first-person opener — a provocative question, a concrete number, or a short intriguing anecdote
2. BODY (8-10 lines): explain the problem you lived through, what you did, 2 concrete insights from your experience
3. TAKEAWAY (2-3 lines): the key lesson, your personal point of view
4. CTA (1 line): a direct question to the reader

ABSOLUTE RULES:
- ALWAYS first person singular: "I've", "I", "My", "In my case", "I decided"
- NEVER: "Hello 👋", "After years of experience...", "As an entrepreneur..."
- 300 to 350 words MAXIMUM — long, complete post that delivers real value
- Every idea must be developed, explained, illustrated — not just mentioned
- Human, direct, expert tone — concrete and specific, never generic
- 0-2 emojis max
- Frequent line breaks between ideas for LinkedIn readability

GENERATE THE POST DIRECTLY, WITHOUT INTRODUCTION OR EXPLANATION. STRICTLY RESPECT THE 400-WORD LIMIT.`;
}

function buildStandardPromptEs(formData: ForgePostFormData, themeLabels: string[]): string {
  return `Eres un experto de LinkedIn hispanohablante que escribe en PRIMERA PERSONA DEL SINGULAR (yo, he, mi).
Redactas un post de LinkedIn completo, humano y experto — no un resumen, un post real y desarrollado.

CONTEXTO:
- Temas: ${themeLabels.join(', ') || 'Emprendimiento / Negocios / Tech'}
- Tono: ${getToneDescription(formData.tone, 'es')}
- Tipo: ${getPostTypeDescription(formData.postType, 'es')}
- Objetivo: ${objectiveText(formData.postObjective, 'es')}
${formData.linkedinProfile ? `- Perfil de LinkedIn: ${formData.linkedinProfile}` : ''}
${formData.personalExamples ? `- Estilo a imitar (voz del usuario): ${formData.personalExamples}` : ''}
- Tema: ${formData.postSubject || 'Mi experiencia y lo que he aprendido'}

ESTRUCTURA OBLIGATORIA:
1. HOOK (2-3 líneas): apertura potente en primera persona — pregunta provocadora, cifra concreta o mini-anécdota que enganche
2. DESARROLLO (8-10 líneas): explica el problema vivido, lo que hiciste, 2 insights concretos de tu experiencia
3. APRENDIZAJE (2-3 líneas): la lección clave, tu punto de vista personal
4. CTA (1 línea): pregunta directa al lector

REGLAS ABSOLUTAS:
- SIEMPRE en primera persona del singular: "He", "Yo", "Mi", "En mi caso", "Decidí"
- NUNCA: "Hola 👋", "Tras varios años de experiencia...", "Como emprendedor..."
- 300 a 350 palabras MÁXIMO — post largo, completo, que aporta valor real
- Cada idea debe estar desarrollada, explicada, ilustrada — no solo mencionada
- Tono humano, directo, experto — concreto y específico, nunca genérico
- 0-2 emojis máximo
- Saltos de línea frecuentes entre ideas para la legibilidad en LinkedIn

GENERA EL POST DIRECTAMENTE, SIN INTRODUCCIÓN NI EXPLICACIÓN. RESPETA ESTRICTAMENTE EL LÍMITE DE 400 PALABRAS.`;
}

const GHOSTWRITER_BUILDERS: Record<PromptLocale, (f: ForgePostFormData, themes: string[]) => string> = {
  fr: buildGhostwriterPromptFr,
  en: buildGhostwriterPromptEn,
  es: buildGhostwriterPromptEs,
};

const STANDARD_BUILDERS: Record<PromptLocale, (f: ForgePostFormData, themes: string[]) => string> = {
  fr: buildStandardPromptFr,
  en: buildStandardPromptEn,
  es: buildStandardPromptEs,
};

export function buildForgePostPrompt(formData: ForgePostFormData): string {
  const locale = resolveLocale(formData.locale);
  const themeLabels = localizeThemes(formData.themes, locale);
  const isGhostwriter = formData.postType === 'ghostwriter';
  const builders = isGhostwriter ? GHOSTWRITER_BUILDERS : STANDARD_BUILDERS;
  return builders[locale](formData, themeLabels);
}
