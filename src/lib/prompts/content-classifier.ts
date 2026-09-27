export type EditorialFamily =
  | 'PRODUCT'
  | 'GAME_OR_CREATIVE'
  | 'EXPERT_OPINION'
  | 'EDITORIAL'
  | 'ANNOUNCEMENT'
  | 'EDUCATIONAL'
  | 'STORY'
  | 'NEWS'
  | 'TESTIMONIAL';

export interface ClassificationResult {
  contentType: EditorialFamily;
  primaryIntent: 'SELL' | 'INFORM' | 'EDUCATE' | 'ANNOUNCE' | 'INSPIRE' | 'BUILD_TRUST' | 'GENERATE_LEADS';
  audience: string;
  commercialIntent: number; // 0 à 1
  emotionalAngle: string;
  detectedLabel: string;
  detectedReason: string;
  recommendedStructure: string[];
  confidence: number;
  keyEntities?: {
    productName?: string;
    brand?: string;
    priceOrOffer?: string;
    mainFeatures?: string[];
  };
}

export interface ClassifierInput {
  targetUrl?: string;
  targetUrlContent?: string;
  videoFileName?: string;
  videoDescription?: string;
  postSubject?: string;
  userRequestedStyle?: string; // 'auto' or specific style
  postObjective?: string;
  targetNetwork?: string;
  locale?: string;
}

export function buildClassifierPrompt(input: ClassifierInput): string {
  const {
    targetUrl = '',
    targetUrlContent = '',
    videoFileName = '',
    videoDescription = '',
    postSubject = '',
    userRequestedStyle = 'auto',
    postObjective = '',
    targetNetwork = 'linkedin',
    locale = 'fr',
  } = input;

  return `Tu es le moteur de classification éditoriale de LinkedInForge.
Ta mission n'est PAS d'écrire le post.
Tu dois d'abord comprendre la nature réelle du contenu fourni afin de déterminer quelle structure rédactionnelle est la plus pertinente.

${userRequestedStyle && userRequestedStyle !== 'auto' ? `NOTE PRIORITAIRE : L'utilisateur a explicitement demandé le style : "${userRequestedStyle}". Respecte ce choix tout en analysant le fond.` : ''}

SOURCES FOURNIES :
${targetUrl ? `- URL du site ou produit : ${targetUrl}` : ''}
${targetUrlContent ? `- Contenu extrait de la page / produit :\n${targetUrlContent.slice(0, 3500)}` : ''}
${videoFileName ? `- Vidéo jointe : ${videoFileName}` : ''}
${videoDescription ? `- Notes / transcription vidéo : ${videoDescription}` : ''}
${postSubject ? `- Sujet ou angle précisé : ${postSubject}` : ''}
${postObjective ? `- Objectif utilisateur : ${postObjective}` : ''}
- Réseau cible : ${targetNetwork}

CONSIGNES STRICTES :
1. Détermine le contentType parmi les 9 familles :
   - "GAME_OR_CREATIVE" : Jeu vidéo (RPG, serious game, mobile, pixel art), projet interactif, bande dessinée, contenu jeunesse, projet artistique ou culturel. Objectif : faire découvrir l'univers, émerveiller, donner envie de tester en 1 clic.
   - "PRODUCT" : Fiche produit e-commerce, parfum, cosmétique, vêtement, matériel, livre, accessoire. Objectif : présenter le produit, donner envie, susciter le désir, orienter vers l'achat/découverte.
   - "EXPERT_OPINION" : Analyse de consultant B2B, conviction professionnelle forte, retour d'expérience sur un marché pro.
   - "EDITORIAL" : Article de fond, réflexion stratégique, décryptage complet.
   - "ANNOUNCEMENT" : Nouveauté majeure, lancement officiel, disponibilité immédiate, événement.
   - "EDUCATIONAL" : Tutoriel, guide pratique, 3 à 5 conseils actionnables, enseignement de valeurs ou compétences.
   - "STORY" : Histoire vécue, coulisses de création de projet, anecdote entrepreneuriale sincère, leçon de vie.
   - "NEWS" : Actualité factuelle, fait marquant, tendance récente.
   - "TESTIMONIAL" : Avis client, cas concret, avant/après, preuve sociale.

2. RÈGLE CRITIQUE ANTI-DÉFORMATION :
   - Ne transforme JAMAIS un jeu vidéo, une initiative pour enfants ou un projet culturel en logiciel SaaS de productivité B2B d'entreprise !
   - Pas de jargon d'entreprise hors-sujet (ex: "perte de temps opérationnelle", "outils disparates", "logiciels complexes", "optimiser vos flux de travail", "dispersion des tâches") si le sujet est un jeu, un loisir ou un produit culturel.
   - Si le contenu traite d'un jeu vidéo ou d'une expérience (comme NOUR RPG), classe OBLIGATOIREMENT en "GAME_OR_CREATIVE".

3. Fournis une analyse détaillée au format JSON strict.

RÉPONDS UNIQUEMENT AVEC UN JSON STRICT respectant cette forme exacte, sans texte avant ni après :
{
  "contentType": "GAME_OR_CREATIVE",
  "primaryIntent": "INSPIRE",
  "audience": "Parents, éducateurs, communauté, joueurs et passionnés",
  "commercialIntent": 0.4,
  "emotionalAngle": "Émerveillement, bienveillance et innovation ludique",
  "detectedLabel": "🎮 Jeu Vidéo / Projet Créatif",
  "detectedReason": "Explication claire en français de la détection",
  "recommendedStructure": [
    "Hook paradoxe ou constat percutant",
    "Présentation de l'univers et de l'initiative",
    "Mécaniques concrètes et gameplay",
    "Pour qui et accessibilité",
    "Appel à tester avec lien direct"
  ],
  "confidence": 0.95,
  "keyEntities": {
    "productName": "Nom exact du projet ou jeu",
    "brand": "Créateur ou studio",
    "priceOrOffer": "Gratuit, Démo, Bêta ou Prix",
    "mainFeatures": ["Caractéristique 1", "Caractéristique 2"]
  }
}`;
}

export function fallbackClassification(input: ClassifierInput): ClassificationResult {
  const urlLower = (input.targetUrl || '').toLowerCase();
  const textLower = (input.targetUrlContent || '').toLowerCase();
  const subjectLower = (input.postSubject || '').toLowerCase();
  const allText = `${urlLower} ${textLower} ${subjectLower}`;

  const isGaming =
    allText.includes('rpg') ||
    allText.includes('jeu') ||
    allText.includes('game') ||
    allText.includes('nour') ||
    allText.includes('playnour') ||
    allText.includes('pixel-art') ||
    allText.includes('pixel art') ||
    allText.includes('adab') ||
    allText.includes('waswas');

  if (isGaming) {
    return {
      contentType: 'GAME_OR_CREATIVE',
      primaryIntent: 'INSPIRE',
      audience: 'Parents, enfants, éducateurs et amateurs d’expériences ludiques éthiques',
      commercialIntent: 0.3,
      emotionalAngle: 'Sens, transmission et émerveillement ludique',
      detectedLabel: '🎮 Jeu Vidéo / Expérience Ludique',
      detectedReason: 'Votre contenu concerne un jeu vidéo ou une aventure interactive narrative.',
      recommendedStructure: [
        'Accroche sur la conciliation jeu & transmission de valeurs',
        'Présentation du concept du jeu sans violence',
        'Mécaniques de progression et originalité',
        'Accessibilité immédiate (navigateur, gratuit)',
        'Appel à tester le jeu en famille'
      ],
      confidence: 0.95,
      keyEntities: {
        productName: 'NOUR RPG',
        priceOrOffer: 'Gratuit / Bêta ouverte',
        mainFeatures: ['Sans violence', 'Quiz de sagesse', 'Directement dans le navigateur']
      }
    };
  }

  const isProduct =
    urlLower.includes('/parfum') ||
    urlLower.includes('/produit') ||
    urlLower.includes('/product') ||
    urlLower.includes('/shop') ||
    textLower.includes('ajouter au panier') ||
    textLower.includes('eau de parfum') ||
    textLower.includes('prix :') ||
    textLower.includes('livraison');

  if (isProduct) {
    return {
      contentType: 'PRODUCT',
      primaryIntent: 'SELL',
      audience: 'Acheteurs et passionnés à la recherche d’un produit de qualité',
      commercialIntent: 0.85,
      emotionalAngle: 'Désir, découverte et exclusivité',
      detectedLabel: '🛍️ Produit / E-commerce',
      detectedReason: 'Votre contenu présente une fiche produit avec des caractéristiques à faire découvrir et commander.',
      recommendedStructure: [
        'Accroche produit captivante',
        'Bénéfices & univers',
        'Caractéristiques réelles vérifiées',
        'Pour qui / Pourquoi maintenant',
        'Appel à l’action vers la boutique'
      ],
      confidence: 0.9,
    };
  }

  return {
    contentType: 'EXPERT_OPINION',
    primaryIntent: 'INFORM',
    audience: 'Professionnels, entrepreneurs et créateurs',
    commercialIntent: 0.4,
    emotionalAngle: 'Clarté, impact et valeur partagée',
    detectedLabel: '💼 Expertise / Thought Leadership',
    detectedReason: 'Votre contenu apporte un retour d’expérience et une vision stratégique sur votre domaine.',
    recommendedStructure: [
      'Hook constat ou paradoxe',
      'Problème sous-jacent',
      'Analyse & conviction forte',
      'Enseignements concrets',
      'Question ouverte & CTA'
    ],
    confidence: 0.8,
  };
}
