import { resolveLocale, type PromptLocale } from './themes';

export type SocialNetworkType = 'linkedin' | 'x' | 'facebook' | 'reddit';

export const NETWORK_LIMITS: Record<SocialNetworkType, { maxChars: number; optimalChars: number; label: string; name: string }> = {
  linkedin: {
    maxChars: 3000,
    optimalChars: 1500,
    label: 'Format Développé (~300 mots)',
    name: 'LinkedIn',
  },
  x: {
    maxChars: 280,
    optimalChars: 260,
    label: 'Format Court (Max 280 car.)',
    name: 'X (Twitter)',
  },
  facebook: {
    maxChars: 5000,
    optimalChars: 1200,
    label: 'Format Engageant (~250 mots)',
    name: 'Facebook',
  },
  reddit: {
    maxChars: 10000,
    optimalChars: 1500,
    label: 'Format Communauté Markdown',
    name: 'Reddit',
  },
};

/**
 * Intelligent helper to format/trim a tweet so it NEVER exceeds 280 characters.
 */
export function formatTweetSafe(text: string, maxChars = 280): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  // Slice down and find the last whitespace or sentence break
  const sliceTarget = trimmed.slice(0, maxChars - 3);
  const lastBreak = Math.max(
    sliceTarget.lastIndexOf('. '),
    sliceTarget.lastIndexOf('? '),
    sliceTarget.lastIndexOf('! '),
    sliceTarget.lastIndexOf('\n'),
    sliceTarget.lastIndexOf(' ')
  );

  if (lastBreak > 180) {
    return sliceTarget.slice(0, lastBreak).trim() + '...';
  }

  return sliceTarget.trim() + '...';
}

/**
 * Generates prompt to adapt an existing post to a specific network's character count and constraints.
 */
export function buildNetworkAdaptationPrompt(
  originalPost: string,
  targetNetwork: SocialNetworkType,
  rawLocale?: string
): string {
  const locale = resolveLocale(rawLocale);

  if (targetNetwork === 'x') {
    if (locale === 'fr') {
      return `Tu es un expert en copywriting X (Twitter).
Voici un post LinkedIn riche et développé :
---
${originalPost}
---

MISSION : Condense ce post en UN SEUL TWEET ultra-percutant pour X (Twitter).

RÈGLES CRITIQUES ET ABSOLUES :
1. TAILLE STRICTE : Le texte final DOIT FAIRE ENTRE 220 ET 275 CARACTÈRES MAXIMUM (espaces et ponctuation compris). Il est STRICTEMENT INTERDIT de dépasser 280 caractères sous peine de blocage.
2. FIDÉLITÉ DE TON : Conserve exactement le même ton, la même authenticité, la même voix à la 1ère personne (Je, J'ai, Mon), et la même idée centrale que le post d'origine.
3. STRUCTURE D'UN EXCELLENT TWEET :
   - Ligne 1 : Accroche forte / constat frappant
   - Ligne 2 : L'insight clé ou la leçon majeure
   - Ligne 3 : Question courte ou chute percutante
4. ZÉRO jargon IA générique (pas de "game-changer", "déclic", etc.).
5. 0 à 1 emoji maximum.

RENVOIE UNIQUEMENT LE TEXTE DU TWEET, SANS GUILLEMETS, SANS INTRODUCTION, SANS COMPTEUR.`;
    }

    return `You are an X (Twitter) copywriting expert.
Here is a complete post:
---
${originalPost}
---

MISSION: Condense this post into A SINGLE ultra-punchy tweet for X (Twitter).

CRITICAL & ABSOLUTE RULES:
1. STRICT LENGTH: The final text MUST BE BETWEEN 220 AND 275 CHARACTERS MAXIMUM (including spaces). NEVER exceed 280 characters.
2. SAME TONE: Keep the exact same voice in first person (I, My), same authenticity and core takeaway.
3. STRUCTURE:
   - Line 1: Strong hook / provocative insight
   - Line 2: The key lesson or takeaway
   - Line 3: Punchy short question or wrap-up
4. ZERO generic AI buzzwords.

OUTPUT ONLY THE TWEET TEXT, NO QUOTES, NO INTRO.`;
  }

  if (targetNetwork === 'facebook') {
    return `Tu es un expert Facebook. Adapte ce post pour Facebook en gardant exactement le même texte et la même profondeur, mais en aérant les paragraphes et en rendant la lecture fluide et conversationnelle. Reste à la 1ère personne. Moins de 300 mots. Renvoie uniquement le texte.

Post original :
${originalPost}`;
  }

  if (targetNetwork === 'reddit') {
    return `Tu es un créateur Reddit expérimenté. Adapte ce post pour Reddit (format markdown propre). 
RÈGLES :
- Titre accrocheur et honnête sur la première ligne (commençant sans balise ou avec un titre clair)
- Corps du post structuré avec des insights concrets tirés de l'expérience vécue
- ZÉRO ton corporatif, 100% authentique et orienté discussion.
- Moins de 350 mots.

Post original :
${originalPost}`;
  }

  // Default: LinkedIn (returns original structure intact)
  return originalPost;
}
