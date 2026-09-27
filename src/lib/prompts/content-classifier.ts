export type EditorialFamily =
  | 'PRODUCT'
  | 'APPLICATION_OR_MEDIA'
  | 'SERVICE_OR_CONSULTING'
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

  return `Tu es le moteur d'analyse éditoriale de LinkedInForge.
Ta mission n'est PAS d'écrire le post mais de classifier fidèlement la nature réelle de la ressource fournie.

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
1. Détermine le contentType parmi les familles universelles :
   - "APPLICATION_OR_MEDIA" : Application web/mobile, jeu, plateforme interactive, création numérique, contenu jeunesse ou média. Objectif : faire découvrir l'univers, donner envie d'explorer et d'essayer.
   - "PRODUCT" : Fiche produit e-commerce, article en vente (physique ou digital), équipement, livre, création artisanale. Objectif : susciter le désir, présenter les caractéristiques clés et orienter vers l'achat/découverte.
   - "SERVICE_OR_CONSULTING" : Prestation de service, agence, freelance, coaching, accompagnement métier.
   - "EXPERT_OPINION" : Analyse professionnelle, conviction métier forte, retour d'expérience terrain sur un marché.
   - "EDITORIAL" : Article de fond, réflexion stratégique ou décryptage thématique.
   - "ANNOUNCEMENT" : Lancement d'un nouveau projet, sortie officielle, événement ou nouveauté majeure.
   - "EDUCATIONAL" : Guide pratique, conseils, tutoriel, transmission de savoirs ou méthodes.
   - "STORY" : Histoire vécue, coulisses d'un projet, anecdote authentique ou leçon de parcours.
   - "NEWS" : Actualité factuelle, tendance récente ou fait marquant.
   - "TESTIMONIAL" : Retour d'expérience utilisateur, cas client ou preuve sociale.

2. RÈGLE D'OR D'AUTHENTICITÉ (ZÉRO HALLUCINATION) :
   - Reste STRICTEMENT aligné avec ce que présente la page web.
   - N'invente AUCUN modèle économique ou cas d'usage imaginaire.
   - Ne plaque JAMAIS de stéréotype B2B corporate (ex: "perte de temps opérationnelle", "outils disparates", "logiciels complexes", "optimiser vos flux de travail", "dispersion des tâches") si la page web ne vend pas explicitement un logiciel de gestion pour entreprises !
   - Si la page est grand public, ludique, artisanale, éducative ou créative, adopte fidèlement son univers.

3. Fournis une analyse détaillée au format JSON strict.

RÉPONDS UNIQUEMENT AVEC UN JSON STRICT respectant cette forme exacte, sans texte avant ni après :
{
  "contentType": "APPLICATION_OR_MEDIA",
  "primaryIntent": "INSPIRE",
  "audience": "Description concise du public ciblé réel",
  "commercialIntent": 0.4,
  "emotionalAngle": "Émotion naturelle de l'offre (ex: Découverte, Curiosité, Désir, Confiance)",
  "detectedLabel": "🚀 Application / Expérience en ligne",
  "detectedReason": "Explication claire en français de la détection",
  "recommendedStructure": [
    "Accroche percutante et captivante",
    "Proposition de valeur centrale",
    "Points forts et détails concrets vérifiés",
    "Pour qui et bénéfices réels",
    "Appel à l'action direct vers le lien"
  ],
  "confidence": 0.95,
  "keyEntities": {
    "productName": "Nom exact de l'offre ou du site",
    "brand": "Nom du créateur, marque ou éditeur",
    "priceOrOffer": "Offre, tarif ou gratuité si mentionné",
    "mainFeatures": ["Point fort 1", "Point fort 2"]
  }
}`;
}

export function fallbackClassification(input: ClassifierInput): ClassificationResult {
  const urlLower = (input.targetUrl || '').toLowerCase();
  const textLower = (input.targetUrlContent || '').toLowerCase();
  const subjectLower = (input.postSubject || '').toLowerCase();
  const allText = `${urlLower} ${textLower} ${subjectLower}`;

  // 1. Detect interactive apps, tools, games, online media
  const isAppOrMedia =
    allText.includes('app') ||
    allText.includes('play') ||
    allText.includes('game') ||
    allText.includes('jeu') ||
    allText.includes('interactive') ||
    allText.includes('plateforme') ||
    allText.includes('online tool') ||
    allText.includes('navigateur');

  if (isAppOrMedia) {
    return {
      contentType: 'APPLICATION_OR_MEDIA',
      primaryIntent: 'INSPIRE',
      audience: 'Utilisateurs, passionnés et curieux à la recherche d’une expérience en ligne originale',
      commercialIntent: 0.3,
      emotionalAngle: 'Découverte, curiosité et accessibilité',
      detectedLabel: '🎮 Application & Expérience Web',
      detectedReason: 'Votre page présente une application, un jeu ou un service interactif accessible en ligne.',
      recommendedStructure: [
        'Accroche captivante sur le concept ou le besoin auquel il répond',
        'Présentation de l’univers et de la proposition originale',
        'Fonctionnalités et expérience concrète pour l’utilisateur',
        'Accessibilité (facilité d’accès, disponibilité)',
        'Appel à l’action chaleureux pour tester et découvrir'
      ],
      confidence: 0.9,
    };
  }

  // 2. Detect e-commerce, shopping and physical/digital products
  const isProduct =
    urlLower.includes('/produit') ||
    urlLower.includes('/product') ||
    urlLower.includes('/shop') ||
    urlLower.includes('/boutique') ||
    allText.includes('panier') ||
    allText.includes('commander') ||
    allText.includes('livraison') ||
    allText.includes('ajouter au panier') ||
    allText.includes('prix :') ||
    allText.includes('store');

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

  // 3. Detect educational content, tutorials, courses
  const isEducation =
    allText.includes('cours') ||
    allText.includes('formation') ||
    allText.includes('apprendre') ||
    allText.includes('tutoriel') ||
    allText.includes('guide pratique');

  if (isEducation) {
    return {
      contentType: 'EDUCATIONAL',
      primaryIntent: 'EDUCATE',
      audience: 'Personnes souhaitant progresser et acquérir de nouvelles compétences',
      commercialIntent: 0.4,
      emotionalAngle: 'Pédagogie, clarté et bienveillance',
      detectedLabel: '🎓 Éducatif / Guide & Apprentissage',
      detectedReason: 'Votre contenu transmet des connaissances ou des méthodes pratiques.',
      recommendedStructure: [
        'Accroche sur un défi ou apprentissage clé',
        'Les étapes ou enseignements majeurs',
        'Les erreurs courantes à éviter',
        'Synthèse et mise en pratique',
        'Appel à l’action pour approfondir'
      ],
      confidence: 0.85,
    };
  }

  // 4. Default: Announcement or thought leadership based strictly on content
  return {
    contentType: 'ANNOUNCEMENT',
    primaryIntent: 'INFORM',
    audience: 'Audience intéressée par votre domaine et vos actualités',
    commercialIntent: 0.4,
    emotionalAngle: 'Clarté, intérêt et valeur partagée',
    detectedLabel: '📢 Découverte & Nouveauté',
    detectedReason: 'Votre contenu présente un projet, un service ou une initiative à faire découvrir.',
    recommendedStructure: [
      'Accroche directe et engageante',
      'Ce que propose concrètement cette page',
      'Ce qui la rend remarquable',
      'Pour qui elle est pensée',
      'Appel à l’action vers le site'
    ],
    confidence: 0.8,
  };
}
