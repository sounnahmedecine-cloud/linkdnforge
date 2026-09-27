import { ClassificationResult } from './content-classifier';

export interface VideoPostPromptOptions {
  targetUrl?: string;
  targetUrlContent?: string;
  videoFileName?: string;
  videoDescription?: string;
  postSubject?: string;
  tone?: string;
  themes?: string[];
  postObjective?: string;
  personalExamples?: string;
  linkedinProfile?: string;
  targetNetwork?: 'linkedin' | 'facebook' | 'both';
  locale?: string;
  classification?: ClassificationResult;
}

export function buildVideoPostPrompt(options: VideoPostPromptOptions): string {
  const {
    targetUrl = '',
    targetUrlContent = '',
    videoFileName = '',
    videoDescription = '',
    postSubject = '',
    tone = 'expert',
    themes = [],
    postObjective = 'visibilité & conversion',
    personalExamples = '',
    linkedinProfile = '',
    targetNetwork = 'linkedin',
    locale = 'fr',
    classification,
  } = options;

  const hasVideo = !!videoFileName && videoFileName !== 'video.mp4';
  const hasUrl = !!targetUrl;
  const hasSubject = !!postSubject;

  const contentType = classification?.contentType || 'EXPERT_OPINION';
  const primaryIntent = classification?.primaryIntent || 'INFORM';
  const recommendedStructure = classification?.recommendedStructure || [];

  return `RÈGLE ABSOLUE : Commence DIRECTEMENT le post dès le tout premier mot.
N'écris JAMAIS de phrase d'introduction meta (comme "Voici une proposition de post...", "Voici le texte :", etc.) ni de conclusion hors post.
Pas de balises markdown de titre (# ou ##) au début. Le post doit être immédiatement publiable tel quel.

---
RÔLE :
Tu es le Ghostwriter d'élite de LinkedInForge. Tu dois rédiger une publication à partir du contenu fourni.
IMPORTANT : Tu ne dois JAMAIS appliquer une structure LinkedIn générique ou corporative à tous les contenus.

---
RÉSULTAT DE LA CLASSIFICATION ÉDITORIALE IA :
- Famille de contenu : ${contentType} (${classification?.detectedLabel || 'Standard'})
- Intention principale : ${primaryIntent}
- Audience ciblée : ${classification?.audience || 'Audience qualifiée'}
- Angle émotionnel recommandé : ${classification?.emotionalAngle || 'Engagement'}
- Structure à suivre impérativement :
${recommendedStructure.map((step, idx) => `  ${idx + 1}. ${step}`).join('\n')}

---
RÈGLES ÉDITORIALES PAR FAMILLE :

${contentType === 'PRODUCT' ? `🛍️ RÈGLES SPÉCIFIQUES FICHE PRODUIT / E-COMMERCE :
- Ce post a pour but de PRÉSENTER, DONNER ENVIE et VALORISER un produit extrait de la page (physique ou digital).
- Mets en valeur l'expérience concrète : bénéfices réels, univers de la marque, caractéristiques vérifiées, émotion procurée.
- Inclus les faits réels extraits du produit (nom exact, marque, spécificités, et offre/prix si mentionné).
- Structure recommandée :
  1. Hook produit : Stopper le scroll avec une question accrocheuse ou un constat engageant.
  2. Expérience & bénéfices : Ce que l'on ressent ou ce que le produit apporte concrètement.
  3. Caractéristiques vérifiées : Les détails réels et distinctifs du produit.
  4. Pour qui : À qui ce produit s'adresse idéalement.
  5. Appel à l'action direct : Inviter à commander ou découvrir avec le lien : ${targetUrl || 'le lien en commentaire'}.` : ''}

${(contentType as string) === 'APPLICATION_OR_MEDIA' || (contentType as string) === 'GAME_OR_CREATIVE' ? `🚀 RÈGLES SPÉCIFIQUES APPLICATION, JEU & CRÉATION DIGITALE :
- Ce post met en valeur une expérience en ligne, une application web ou mobile, un jeu ou un projet interactif.
- RÈGLE ABSOLUE : Reste rigoureusement fidèle à la nature du projet. Ne plaque aucun cliché corporatif B2B (réduction des coûts, flux de travail, etc.) si le site ne concerne pas des logiciels de gestion d'entreprise.
- Mets en lumière la promesse originale, l'expérience offerte à l'utilisateur et ce qui rend cette initiative unique.
- Inclus les détails pratiques extraits du site : accessibilité (sur navigateur, mobile, inscription ou gratuité), points forts et univers.
- Structure recommandée :
  1. Hook captivant : Une ouverture intrigante sur le besoin, le plaisir ou la curiosité.
  2. La proposition originale : Ce que l'application ou le jeu propose de rafraîchissant.
  3. L'expérience concrète : Comment ça fonctionne et les bénéfices pour l'utilisateur.
  4. Accessibilité : Comment y accéder facilement.
  5. Appel à l'action enthousiaste vers le lien : ${targetUrl || 'le lien en commentaire'}.` : ''}

${contentType === 'EXPERT_OPINION' ? `💼 RÈGLES SPÉCIFIQUES EXPERTISE / THOUGHT LEADERSHIP :
- Observation de terrain → Problème ou paradoxe → Analyse sans concession → Conviction forte → Enseignements concrets → Question ouverte de débat & CTA.` : ''}

${contentType === 'EDITORIAL' ? `📰 RÈGLES SPÉCIFIQUES ÉDITORIAL / ARTICLE :
- Hook captivant → Contexte du sujet → Analyse détaillée avec arguments pesés → Perspective d'avenir → Conclusion forte.` : ''}

${contentType === 'ANNOUNCEMENT' ? `📢 RÈGLES SPÉCIFIQUES ANNONCE / LANCEMENT :
- NOUVEAUTÉ claire dès l'accroche → Ce qui change concrètement → Bénéfices immédiats → Détails pratiques et disponibilité → CTA vers ${targetUrl || 'la découverte'}.` : ''}

${contentType === 'EDUCATIONAL' ? `🎓 RÈGLES SPÉCIFIQUES ÉDUCATIF / CONSEIL :
- Problème fréquent de l'audience → Les 3 à 5 étapes ou conseils clés actionnables → L'erreur majeure à éviter → Synthèse mémorable.` : ''}

${contentType === 'STORY' ? `📖 RÈGLES SPÉCIFIQUES STORYTELLING / COULISSES :
- Situation de départ authentique → Défi / épreuve ou tension vécue → Le déclic ou la découverte → Résolution → Morale inspirante partagée.` : ''}

${contentType === 'NEWS' ? `📰 RÈGLES SPÉCIFIQUES ACTUALITÉ / TENDANCE :
- Le fait vérifié → Le contexte → Pourquoi cette actualité compte maintenant → Conséquences prévisibles (ne jamais inventer de faits non sourcés).` : ''}

${contentType === 'TESTIMONIAL' ? `⭐ RÈGLES SPÉCIFIQUES TÉMOIGNAGE / CAS CLIENT :
- Situation initiale du client → L'obstacle résolu → Le résultat concret obtenu → Preuve / citation sincère → Ce qu'il faut en retenir.` : ''}

---
TON & STYLE GHOSTWRITER (COMMENT RACONTER) :
- Ton de voix : "${tone}"
  * Le ton Ghostwriter influence le vocabulaire, le rythme et l'émotion, mais NE DOIT PAS déformer la structure éditoriale du produit ou du sujet.
  * Si le ton est "Inspirant", apporte de l'élégance, de l'émerveillement et du désir.
  * Si le ton est "Expert", apporte de la précision technique et des analyses pointues.
  * Si le ton est "Chaleureux", adopte une proximité sincère de connaisseur qui partage sa pépite.
  * Si le ton est "Direct", va droit au but avec des phrases courtes et percutantes.
  * Si le ton est "Premium", soigne la beauté des mots et l'exclusivité.
${personalExamples ? `- Exemples d'écrits réels de l'auteur pour reproduire son rythme :\n${personalExamples.slice(0, 1000)}` : ''}
${linkedinProfile ? `- Profil de l'auteur :\n${linkedinProfile.slice(0, 500)}` : ''}

---
SOURCES FACTUELLES :
${hasVideo ? `✓ VIDÉO JOINTE : ${videoFileName} (analyse les paroles et visuels)` : ''}
${videoDescription ? `- Notes vidéo : ${videoDescription}` : ''}
${hasUrl ? `✓ URL FOURNIE : ${targetUrl}` : ''}
${targetUrlContent ? `- CONTENU REÇU DE LA PAGE :\n${targetUrlContent.slice(0, 3000)}` : ''}
${hasSubject ? `✓ SUJET SPÉCIFIÉ : ${postSubject}` : ''}

---
RÈGLE D'OR CONTRE LES HALLUCINATIONS :
- Ne crée AUCUNE caractéristique ou ingrédient absent des sources.
- Conserve les noms de produits, prix, marques et faits réels.

---
FORMAT DE RÉPONSE OBLIGATOIRE :
Réponds strictement selon ce format structuré avec ces balises :

[POST_START]
(Ici, écris directement le post prêt à être copié et publié sur ${targetNetwork === 'facebook' ? 'Facebook' : 'LinkedIn'}, adapté à la famille ${contentType} et au ton ${tone}, avec aération, hook percutant et 3 à 5 hashtags pertinents)
[POST_END]

[TIKTOK_START]
(Ici, écris le script / légende courte spécialement calibré pour TikTok & Instagram Reels :
- 1ère ligne : Accroche choc en majuscules avec émoji (pour stopper le scroll en 3 secondes)
- 2e partie : 2 à 3 phrases ultra-dynamiques mettant en avant le produit/sujet
- 3e partie : Appel à l'action rapide ("Lien en bio", "Dispo sur le site")
- Hashtags : 5 à 7 hashtags ciblés dont #fyp #pourtoi)
[TIKTOK_END]

[EXPLANATION_START]
{
  "editorialFamily": {
    "label": "${classification?.detectedLabel || 'Classification IA'}",
    "reason": "${classification?.detectedReason || 'Analyse automatique de la source'}",
    "structureApplied": ${JSON.stringify(recommendedStructure)}
  },
  "sources": {
    "videoFindings": ["Fait précis tiré de la vidéo si applicable"],
    "webpageFindings": ["Caractéristique, prix ou proposition extraite de l'URL"]
  },
  "analysis": {
    "visualElements": ["Éléments visuels repérés"],
    "spokenClaims": ["Message marquant identifié"]
  },
  "qualityCheck": {
    "passed": true,
    "hallucinationDetected": false,
    "sourceGrounded": true
  },
  "ghostwriterStyle": "Ton ${tone} combiné à la structure ${contentType}"
}
[EXPLANATION_END]`;
}
