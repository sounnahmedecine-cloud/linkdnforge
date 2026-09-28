# 📜 Archive & Référence des Prompts Originaux — LinkedInForge

Ce document conserve précieusement l'intégralité du prompt initial mis en place au tout début du projet pour le scraping et l'adaptation au contenu de site web, ainsi que son évolution vers le moteur universel actuel.

---

## 1. Le Prompt Initial d'Origine (Scraping URL, Douleurs & Proposition de Valeur)

Ce prompt a été conçu spécifiquement pour que l'IA **s'adapte à 100% au contenu brut du site scrapé**, sans plaquer de structure LinkedIn artificielle ou de faux storytelling personnel.

### Version Initiale Fondatrice (Commit `d004fee`)

```text
⚠️ INSTRUCTION CRITIQUE : LE SUJET PRINCIPAL DU POST EST CE SITE/PRODUIT :
--- CONTENU DU SITE ---
${targetUrlContent}
----------------------------------
Ton but absolu est de parler de CE produit/service précis, de la douleur qu'il résout, et de sa proposition de valeur. 
Les informations du profil LinkedIn et les thèmes donnés plus haut ne servent qu'à donner la "voix" et le contexte de l'auteur, mais ne doivent PAS remplacer le sujet du site. 
Formule le post pour faire la promotion de ce lien.
```

---

## 2. Le Prompt de Copywriting Spécialisé Promotion & Scraping (Commit `0d44e40` & `9b59226`)

Ce prompt dédié interdit les clichés habituels de LinkedIn ("j'ai eu un déclic", "game-changer", etc.) et force l'IA à analyser :
- Les **douleurs / problèmes résolus**
- La **proposition de valeur réelle**
- Les **détails concrets extraits du site**
- Le **Call-to-Action obligatoire** vers l'URL

### Contenu Intégral du Prompt :

```text
Tu es un expert en copywriting. Ton objectif est de faire la promotion d'un produit ou article, en te basant STRICTEMENT sur le contenu de son site.

--- CONTENU DU SITE ---
${truncatedContent}
-----------------------

CONTEXTE DE L'AUTEUR :
- Thèmes : ${themeLabels.join(', ')}
${linkedinProfile ? `- Profil : ${linkedinProfile}` : ''}
${personalExamples ? `- Style à imiter : ${personalExamples}` : ''}

CONSIGNES DE RÉDACTION :
- Ton : ${toneDescription}
- Le post DOIT être centré sur le PRODUIT/SITE, avec des détails précis tirés du texte. Ne sois pas générique.
- Va droit au but dès la première ligne sur le problème que le produit résout. Ne raconte aucune réflexion introspective ni d'anecdotes sur ton passé.
- Utilise un vocabulaire simple, clair et terre-à-terre. Bannis totalement le jargon de startup et les anglicismes à la mode.
- Explique concrètement le problème résolu et la solution apportée.
- Ajoute obligatoirement un appel à l'action (Call-to-Action) à la toute fin du post en incluant ce lien précis : ${targetUrl}
- Va à l'essentiel (moins de 250 mots). Formule ça comme un post naturel, pas comme un communiqué de presse.
```

---

## 3. Emplacement dans le Code Source Actuel

Le prompt d'origine est également conservé et exécutable dans le fichier source :
- [`src/lib/prompts/forge-post.ts`](file:///d:/MES%20PROJETS/linkdnforge/src/lib/prompts/forge-post.ts#L326-L359)

Et ses principes fondamentaux (zéro hallucination, fidélité au produit/service, analyse des bénéfices réels et des douleurs cibles, CTA précis) alimentent le moteur multimodal et le classifier dans :
- [`src/lib/prompts/content-classifier.ts`](file:///d:/MES%20PROJETS/linkdnforge/src/lib/prompts/content-classifier.ts)
- [`src/lib/prompts/video-post-prompt.ts`](file:///d:/MES%20PROJETS/linkdnforge/src/lib/prompts/video-post-prompt.ts)
