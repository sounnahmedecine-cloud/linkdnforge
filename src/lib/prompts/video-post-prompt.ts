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
    postObjective = 'visibilité & engagement',
    personalExamples = '',
    linkedinProfile = '',
    targetNetwork = 'linkedin',
    locale = 'fr',
  } = options;

  const hasVideo = !!videoFileName && videoFileName !== 'video.mp4';
  const hasUrl = !!targetUrl;
  const hasSubject = !!postSubject;

  return `RÈGLE ABSOLUE : Commence DIRECTEMENT le post dès le tout premier mot.
N'écris JAMAIS de phrase d'introduction meta (comme "Voici une proposition de post...", "Voici le texte :", etc.) ni de conclusion hors post.
Pas de balises markdown de titre (# ou ##) au début. Le post doit être immédiatement publiable tel quel.

---
RÔLE :
Tu es le Ghostwriter d'élite et copywriter stratégique pour le compte de l'utilisateur. Ton objectif est de transformer les éléments fournis (vidéo, URL et/ou sujet) en une publication virale, captivante et humaine pour ${targetNetwork === 'facebook' ? 'Facebook' : 'LinkedIn'}.

---
CASCADE DE PRIORITÉ DES SOURCES :
${hasVideo ? '✓ VIDÉO DÉTECTÉE : Analyse en priorité absolue les paroles (audio), le message et les visuels de la vidéo.' : '• Aucune vidéo fournie : passe aux sources suivantes.'}
${hasUrl ? `✓ URL FOURNIE (${targetUrl}) : Incorpore la proposition de valeur, les bénéfices ou le contenu du site.` : '• Aucune URL fournie.'}
${hasSubject ? `✓ SUJET DÉFINI PAR L'AUTEUR : "${postSubject}"` : ''}

${targetUrlContent ? `---
CONTENU EXTRAIT DE L'URL CIBLE :
${targetUrlContent.slice(0, 3000)}` : ''}

${hasVideo ? `---
CONTEXTE VIDÉO :
- Fichier : ${videoFileName}
${videoDescription ? `- Notes : ${videoDescription}` : ''}
- Consigne : Ton texte DOIT refléter fidèlement le contenu parlé et montré dans la vidéo.` : ''}

${hasSubject ? `---
ANGLE / SUJET DEMANDÉ :
${postSubject}` : ''}

---
STYLE & PERSONNALITÉ :
- Ton recherché : ${tone} (adopte ce ton avec naturel et conviction).
- Thématiques clés : ${themes.length > 0 ? themes.join(', ') : 'Innovation, Entrepreneuriat, Partage de valeur'}.
- Objectif de la publication : ${postObjective}.
${personalExamples ? `- Exemples du style d'écriture de l'auteur :\n${personalExamples.slice(0, 1000)}` : ''}
${linkedinProfile ? `- Profil de l'auteur :\n${linkedinProfile.slice(0, 500)}` : ''}

---
STRUCTURE RECOMMANDÉE DU POST :
1. LE HOOK (Accroche - 1 à 2 lignes) :
   - Doit stopper le scroll immédiatement.
   - Fait écho au problème ou à la révélation majeure de la vidéo.
   - Saut de ligne après le hook.

2. LE DÉVELOPPEMENT / LES INSIGHTS (Corps du post) :
   - Explique pourquoi ce qui est montré dans la vidéo est crucial.
   - Partage 2 à 4 points clairs, actionnables ou contre-intuitifs.
   - Phrases courtes, aérées, avec des listes à puces simples (✓ ou tirets discrets).

3. LE CALL TO ACTION (Passage à l'action) :
   - Invite à regarder la vidéo complète.
   ${targetUrl ? `- Si pertinent pour en savoir plus, invite à visiter : ${targetUrl}` : ''}
   - Pose une question ouverte pour susciter les commentaires et le débat sous le post.

4. HASHTAGS :
   - 3 à 5 hashtags stratégiques, ultra-ciblés et professionnels en fin de post.

---
FORMAT DE RÉPONSE OBLIGATOIRE :
Réponds strictement selon ce format structuré avec ces balises :

[POST_START]
(Ici, écris directement le post expert prêt à être copié et publié sur LinkedIn/Facebook, avec aération, hook percutant, bullet points et hashtags pro)
[POST_END]

[TIKTOK_START]
(Ici, écris la légende courte et ultra-dynamique spécialement calibrée pour TikTok & Instagram Reels :
- 1ère ligne : Accroche choc en majuscules / émoji pour retenir l'attention dans les 3 premières secondes
- 2e partie : 2 à 3 phrases ultra-rythmées qui donnent envie d'enregistrer la vidéo
- 3e partie : Appel à l'action court ("Lien en bio" ou "Commente X pour recevoir...")
- Hashtags viraux : 5 à 7 hashtags percutants ex: #fyp #pourtoi #viral #[thematique])
[TIKTOK_END]

[EXPLANATION_START]
{
  "videoInsights": ["1er élément clé tiré de la vidéo", "2e élément clé"],
  "urlInsights": ["Élément clé ou proposition de valeur tirée du site web"],
  "ghostwriterStyle": "Brève explication du ton et de la structure adoptée"
}
[EXPLANATION_END]

Langue du post : ${locale === 'en' ? 'Anglais' : locale === 'es' ? 'Espagnol' : 'Français'}.
Génère maintenant :`;
}
