Voici la synthèse de votre stratégie pour **LinkedInForge**, conçue pour être exécutée avec votre stack actuelle (Next.js/Firebase).

### 1. Prompt Complet pour l'IA (Stratégie & Développement)
Copiez-collez ce prompt dans votre session avec Claude ou l'IA de votre choix pour démarrer chaque séance de travail sur le SaaS :

> "Agis comme un expert en branding LinkedIn et croissance SaaS. Nous travaillons sur **LinkedInForge**, un outil SaaS qui permet aux freelances et e-commerçants de rédiger des posts LinkedIn à haute autorité en alliant 'artisanat' humain et puissance de l'IA.
>
> **Contexte technique :** Je développe avec Next.js et Firebase (Firestore).
> **Tes tâches actuelles :**
> 1. Agis comme un architecte logiciel : Propose la structure de données Firestore pour stocker les utilisateurs, leurs brouillons de posts, et leurs historiques de publication.
> 2. Agis comme un stratège marketing : Définis un calendrier de lancement de 30 jours pour passer de 0 à 10 utilisateurs payants.
> 3. Agis comme un développeur : Donne-moi le code du composant de base pour la rédaction assistée (input texte avec compteur de caractères et bouton 'Améliorer avec LinkedInForge').
>
> Garde un ton professionnel, pragmatique et humain. Priorise le MVP et la simplicité."

***

### 2. Feuille de Route du Projet (MVP en 30 Jours)

Cette feuille de route est optimisée pour votre profil d'entrepreneur digital, en misant sur un développement rapide et une validation immédiate.

| Semaine | Focus | Livrable / Action Clé |
| :--- | :--- | :--- |
| **S1** | **Structure & MVP** | Configuration Firebase/Next.js, création du schéma de base de données Firestore, intégration de l'UI de rédaction. |
| **S2** | **Cœur de l'IA** | Finalisation du prompt système de l'IA pour le style "Artisan", intégration du bouton de génération/amélioration. |
| **S3** | **Connexion API** | Liaison avec l'API LinkedIn pour la programmation des posts ou le copier-coller facilité. |
| **S4** | **Lancement** | Acquisition des 10 premiers utilisateurs payants via votre réseau (WhatsApp Business, LinkedIn, artisans). |

***

### Conseils pour votre exécution
* **Data :** Pour Firestore, structurez par collection `users` → `posts` (avec des champs `content`, `status` [draft/published], `timestamp`).
* **Validation :** Ne cherchez pas la perfection technique. Votre objectif est que le premier utilisateur crée ses 5 premiers posts avec l'outil dès la fin de la semaine 2.
* **Stack :** Utilisez `claude.md` pour maintenir votre documentation technique à jour pendant que vous codez vos composants Next.js.

Voulez-vous que je génère dès maintenant le squelette de la base de données Firestore à copier dans votre projet ?
