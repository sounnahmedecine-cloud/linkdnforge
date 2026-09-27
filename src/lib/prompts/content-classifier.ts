export type EditorialFamily =
  | 'PRODUCT'
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
${targetUrlContent ? `- Contenu extrait de la page / produit :\n${targetUrlContent.slice(0, 3000)}` : ''}
${videoFileName ? `- Vidéo jointe : ${videoFileName}` : ''}
${videoDescription ? `- Notes / transcription vidéo : ${videoDescription}` : ''}
${postSubject ? `- Sujet ou angle précisé : ${postSubject}` : ''}
${postObjective ? `- Objectif utilisateur : ${postObjective}` : ''}
- Réseau cible : ${targetNetwork}

CONSIGNES STRICTES :
1. Détermine le contentType parmi les 8 familles :
   - "PRODUCT" : Fiche produit, parfum, cosmétique, vêtement, matériel, livre, application e-commerce. Objectif : présenter le produit, donner envie, susciter le désir, orienter vers l'achat/découverte.
   - "EXPERT_OPINION" : Analyse de consultant, conviction professionnelle forte, retour d'expérience B2B, point de vue tranché sur le marché.
   - "EDITORIAL" : Article de fond, réflexion stratégique, décryptage complet.
   - "ANNOUNCEMENT" : Nouveauté, lancement, disponibilité, événement, refonte.
   - "EDUCATIONAL" : Tutoriel, guide pratique, 3 à 5 conseils actionnables, erreurs à éviter.
   - "STORY" : Histoire vécue, coulisses de création, anecdote entrepreneuriale sincère, leçon de vie.
   - "NEWS" : Actualité factuelle, fait marquant, tendance récente (zéro invention de faits).
   - "TESTIMONIAL" : Avis client, cas concret, avant/après, preuve sociale.

2. Ne choisis JAMAIS "EXPERT_OPINION" par défaut si le contenu décrit un produit commercial (ex: parfum, boutique e-commerce, article en vente). Un produit e-commerce doit être classé en "PRODUCT", même s'il sera publié sur LinkedIn.

3. Fournis une analyse détaillée au format JSON strict.

RÉPONDS UNIQUEMENT AVEC UN JSON STRICT respectant cette forme exacte, sans texte avant ni après :
{
  "contentType": "PRODUCT",
  "primaryIntent": "SELL",
  "audience": "Description concise du public ciblé",
  "commercialIntent": 0.85,
  "emotionalAngle": "Désir, élégance et découverte sensorielle",
  "detectedLabel": "🛍️ Produit / E-commerce",
  "detectedReason": "Explication claire en français de pourquoi ce format correspond au contenu",
  "recommendedStructure": [
    "Hook produit irrésistible",
    "Bénéfices sensoriels & univers",
    "Notes & caractéristiques clés vérifiées",
    "Pour quelle occasion / pour qui",
    "Appel à l'action clair"
  ],
  "confidence": 0.95,
  "keyEntities": {
    "productName": "Nom du produit ou service s'il y en a un",
    "brand": "Marque ou boutique",
    "priceOrOffer": "Prix ou offre mentionnée si présente",
    "mainFeatures": ["Caractéristique 1", "Caractéristique 2"]
  }
}`;
}

export function fallbackClassification(input: ClassifierInput): ClassificationResult {
  const urlLower = (input.targetUrl || '').toLowerCase();
  const textLower = (input.targetUrlContent || '').toLowerCase();

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
