# Cahier des charges — Scène de référence Omra 3D

Date : 3 octobre 2026

Version : 1.0 — spécification initiale, réalisation à démarrer

Technologies retenues : Blender, Unity, Firebase et GitHub.

## 1. Objectif et contexte

Réaliser une première scène complète et interactive du Tawaf afin de valider la qualité visuelle et technique de la future application Omra et Hajj pour iOS et Android.

La vidéo `presentation-app-omra-3d.mp4` est uniquement un squelette de présentation. Ses personnages, matériaux, décors et interfaces simplifiés ne constituent pas le niveau de qualité attendu. Tout le contenu doit recevoir un habillage abouti et cohérent.

Le produit final vise une équivalence fonctionnelle avec « 3D Hajj and Umrah Guide », avec une identité, des modèles, des textures, des interfaces et des contenus originaux ou correctement licenciés. La liste exhaustive des fonctions sera établie par observation de l'application originale ; la fiche du store ne suffit pas.

Ce premier lot porte sur une scène de référence, pas sur la réalisation de l'ensemble Omra/Hajj. Aucun délai ferme ni engagement sur le prix de l'application complète n'est établi par ce document. Le plafond commercial de 1 500 € évoqué doit être confronté au périmètre après cette validation.

## 2. Résultat attendu

Une application de démonstration installable sur Android et iPhone permettant de :

1. Ouvrir la scène du Tawaf avec une interface finalisée.
2. Observer une Kaaba détaillée et un pèlerin correctement vêtu et animé.
3. Lancer, mettre en pause, reprendre et recommencer la démonstration.
4. Tourner la caméra, zoomer et revenir au cadrage initial.
5. Consulter une explication française et une invocation arabe avec traduction et audio validés.
6. Suivre les sept tours de la démonstration.
7. Utiliser la scène sans connexion après installation.

La qualité doit être appréciée dans Unity sur téléphone. Un beau rendu Blender ou une vidéo seuls ne valident pas la scène interactive.

## 3. Direction artistique

### 3.1 Style

Base proposée : 3D stylisée soignée, proportions crédibles, matériaux lisibles et éclairage naturel. Le style définitif sera fixé à partir de vues de référence de la Kaaba, du pèlerin et de la scène assemblée. La vidéo sert à comprendre l'organisation, pas à fixer la finition.

Les formes primitives de maquette, personnages non habillés, textures provisoires et boutons de débogage ne sont pas acceptables dans la version soumise à validation finale.

### 3.2 Kaaba et environnement

- Modèle aux proportions documentées, avec kiswa, bandeaux décoratifs, porte, socle et repérage de la pierre noire.
- Textures originales ou licenciées ; toute calligraphie visible doit être exacte et validée, jamais un assemblage décoratif de caractères inventés.
- Mataf avec matériau de sol travaillé, ombres de contact et repères compréhensibles.
- Hijr Ismail et Maqam Ibrahim identifiables et placés selon les références retenues.
- Galeries et arrière-plan cohérents, suffisamment détaillés depuis les angles accessibles.
- Cadrage et trajectoire sans passage à travers la Kaaba, le Hijr ou les obstacles.
- Éclairage et matériaux optimisés pour téléphone ; pas d'exigence de photoréalisme.

### 3.3 Pèlerin

- Un personnage principal adulte, entièrement habillé, avec visage, mains et pieds soignés.
- Tenue d'ihram crédible : pièces de tissu, plis, maintien et couverture appropriée.
- Personnage articulé ; vêtements adaptés au squelette et aux mouvements.
- Absence de traversées visibles du corps par les vêtements aux cadrages prévus.
- Modèle original ou acquis avec une licence compatible avec l'application et la remise des sources. Les restrictions éventuelles de redistribution doivent être documentées.
- Simulation de tissu en temps réel non requise ; plis modélisés et animation du vêtement privilégiés si le résultat est satisfaisant.

### 3.4 Présence d'autres pèlerins

Une ambiance de fréquentation peut être ajoutée si elle améliore la scène. Aucun nombre imposé de personnages ni objectif de foule massive. Les personnages secondaires doivent rester cohérents avec le style et ne pas masquer la démonstration. Leur densité sera ajustée après mesures sur appareils.

## 4. Animation et comportement

### 4.1 Séquence du Tawaf

- Départ clairement repéré et marche dans le sens prescrit, validés par le référent religieux.
- Boucle de marche naturelle, pieds sans glissement gênant, virages progressifs et vitesse cohérente.
- Déplacement piloté le long d'un parcours contrôlé, indépendant de la cadence d'affichage.
- Idle, démarrage, marche et arrêt avec transitions propres.
- Geste de salutation à intégrer seulement après définition et validation du geste attendu.
- Raml, idtiba et leurs conditions éventuelles doivent être définis par le référent avant implémentation ; ne pas généraliser une pratique à tous les profils.
- Aucun geste de prière, scène de Zamzam ou rasage n'est requis pour ce premier lot.

### 4.2 Commandes

- Lecture, pause, reprise et recommencement de la séquence.
- Rotation tactile autour d'un point d'intérêt et zoom avec limites.
- Cadrage général, cadrage de suivi et retour à la vue initiale.
- Caméra protégée contre les traversées de murs et les angles montrant l'intérieur des modèles.
- Toucher les boutons ne doit pas déplacer simultanément la caméra.

### 4.3 Compteurs

Le compteur pédagogique suit les tours du personnage, de 0 à 7, avec un seul incrément par passage complet. Recommencer remet ce compteur à zéro.

Un compteur manuel destiné à l'usage réel peut être présenté sur un écran distinct : ajout d'un tour, annulation du dernier ajout et remise à zéro avec confirmation. Son état est sauvegardé localement. Il ne doit jamais être confondu avec le compteur de l'animation. Aucune détection GPS automatique n'est prévue.

## 5. Interface et contenus

- Identité originale, palette harmonisée, typographie lisible et icônes homogènes.
- Accueil minimal, écran de scène, panneau explicatif et réglages indispensables.
- Interface française pour cette scène ; structure des textes prête à recevoir d'autres langues sans les promettre dans ce lot.
- Texte arabe correctement lié et orienté de droite à gauche ; traduction et phonétique séparées.
- Audio fourni ou licencié et validé ; commandes de lecture et arrêt indépendantes de l'animation.
- Taille des textes ajustable, contraste lisible et boutons tactiles confortables.
- Mise en page adaptée aux encoches et aux formats de téléphones ; paysage proposé pour la scène, à valider au premier montage.
- Pas de compte utilisateur ni paiement requis pour accéder à cette scène.
- Les textes provisoires sont explicitement marqués comme tels ; aucune validation religieuse n'est présumée.

## 6. Architecture et hébergement

### 6.1 Application mobile

Blender produit les modèles et animations. Unity assemble les éléments, rend la 3D en temps réel et gère les écrans, les contrôles, l'audio et la sauvegarde locale. Un projet commun génère deux builds distincts : Android et iOS. Flutter n'est pas nécessaire dans cette architecture.

La scène de référence et ses contenus essentiels sont embarqués pour fonctionner hors ligne dès l'installation. Les mises à jour de contenu pourront utiliser Firebase sans rendre la scène dépendante du réseau.

### 6.2 Répartition GitHub / Firebase

| Élément | Destination et rôle |
|---|---|
| Cahier des charges, scripts, projet Unity et configuration web | GitHub : historique et collaboration |
| Sources Blender, textures et autres fichiers binaires volumineux | Git LFS si compatible avec les licences et quotas ; stratégie à configurer avant import |
| Partie web de présentation et accès aux démonstrations | Firebase App Hosting, relié au dossier web du dépôt GitHub |
| Contenus téléchargeables et médias publiés | Cloud Storage for Firebase si nécessaire |
| Scène native mobile | Exécutée localement par Unity sur le téléphone |
| Diffusion iOS et Android | Builds de test puis App Store et Google Play pour la livraison finale |

**Firebase App Hosting héberge la partie web ; il ne compile pas et n'exécute pas les applications natives Unity iOS/Android.** L'exigence « tout sur Firebase App Hosting et GitHub » est donc traduite en une infrastructure Firebase pour le web et les contenus, GitHub pour les sources, et une distribution native pour les applications mobiles.

Une démonstration Unity dans le navigateur est optionnelle. Si retenue, son export web, son intégration dans la page App Hosting, les en-têtes de compression, le chargement et la compatibilité navigateur feront l'objet d'une validation technique distincte. Elle ne remplace pas les essais natifs.

### 6.3 Livraison et accès

- Projet Firebase et comptes des stores identifiés avant déploiement ; aucun identifiant de projet n'est inventé.
- Partie web dans un répertoire dédié, avec version de framework prise en charge par App Hosting au moment de la réalisation.
- Builds Unity produits séparément ; compilation et signature iOS avec accès à une chaîne macOS/Xcode.
- Secrets de déploiement et de signature conservés dans des gestionnaires de secrets, jamais dans les fichiers versionnés.
- Accès en écriture aux contenus Firebase limités aux personnes ou services autorisés ; règles vérifiées avant mise en ligne.
- Estimer stockage, trafic et coûts de compilation avant activation des services ; configurer des alertes de budget.
- Environnements de démonstration et de production identifiés séparément.

## 7. Organisation proposée des sources

```text
omra-hajj-3d/
  CAHIER-DES-CHARGES.md
  docs/                  # références, décisions artistiques, rapports de tests
  blender/               # sources .blend et scripts de génération
  unity/                 # Assets, Packages, ProjectSettings et fichiers .meta
  web/                   # partie web destinée à Firebase App Hosting
  firebase/              # règles et configuration complémentaires
  licenses/              # licences et provenance des ressources
```

Cette arborescence décrit la cible. Au présent jalon, seul le cahier des charges est créé. Ne pas versionner les caches Unity, rendus temporaires, builds lourds ou secrets. Conserver les fichiers `.meta` Unity. Fixer les versions des logiciels et dépendances avant production.

Le dossier est actuellement placé dans le dépôt de travail `linkdnforge`, sans intégration à son application existante. Le dépôt GitHub définitif du produit Omra/Hajj pourra être séparé avant la phase de développement et la connexion à App Hosting.

## 8. Jalons de réalisation

1. **Références et inventaire** : vérifier les fonctions de référence, réunir les contenus, choisir les modèles de départ et contrôler leurs licences.
2. **Direction artistique** : proposer Kaaba, tenue et personnage habillés, matériaux et interface ; fixer la qualité attendue à partir de vues concrètes.
3. **Scène Blender** : finaliser les modèles et préparer les animations, UV, textures et exports.
4. **Intégration Unity** : importer, régler l'éclairage, programmer la séquence et ajouter caméra, interface et audio.
5. **Tests mobiles** : produire les builds, mesurer et corriger sur Android et iPhone.
6. **Présentation client** : livrer la scène interactive, les captures et la fiche de recette ; recueillir une validation écrite du style et des fonctions.
7. **Préparation de la suite** : réévaluer la charge des autres scènes Omra/Hajj à partir du travail effectivement réalisé.

Aucun délai ferme n'est fixé ici. Le calendrier dépend notamment de l'accès aux outils, modèles, appareils, contenus et comptes de compilation.

## 9. Critères de validation

| Domaine | Critère vérifiable |
|---|---|
| Finition | Aucun personnage primitif, texture manquante ou élément provisoire visible dans les cadrages de livraison |
| Kaaba | Détails prévus identifiables et implantation validée sur les références retenues |
| Pèlerin | Tenue complète, articulations et plis cohérents, absence de traversées flagrantes en lecture normale |
| Animation | Cycle de marche continu, transitions sans saut visible, trajectoire sans traversée d'obstacle |
| Contrôles | Rotation, zoom, pause, reprise et recommencement fonctionnels au toucher |
| Comptage | Sept tours comptés sans doublon ; reprise après pause et remise à zéro correctes |
| Contenus | Français lisible, arabe correctement rendu, textes et audio validés et sourcés |
| Hors ligne | Scène, explications et audio utilisables en mode avion, application relancée |
| Cycle de vie | Retour depuis l'arrière-plan sans perte indue de l'état ni audio parasite |
| Performances | Cible initiale de 30 images/s stables ; mesure sur un Android intermédiaire et un iPhone dont les modèles seront consignés |
| Stabilité | Session de 15 minutes sans plantage ; mémoire, chauffe et temps de chargement consignés |
| Livraison | Projet reproductible depuis les sources avec procédure écrite et versions exactes |

La cible de performance est à mesurer, pas une promesse acquise. Densité des personnages, textures et éclairage seront ajustés selon les résultats. Le rapport indiquera les appareils, versions système, résolution, mesures et limitations restantes.

## 10. Livrables de la scène complète

- Sources Blender éditables, textures autorisées et animations.
- Projet Unity complet avec scène, matériaux, scripts et interface.
- Build Android de démonstration et version iOS de test une fois la signature disponible.
- Captures et courte vidéo du rendu réel dans Unity.
- Partie web de présentation sur App Hosting lorsque le projet Firebase sera configuré.
- Sources dans GitHub, registre des licences et procédure de compilation.
- Rapport de tests et liste des points validés ou restant à corriger.

## 11. Hors périmètre de ce premier lot

Les autres scènes de la Omra, les lieux et séquences du Hajj, plusieurs profils de personnages, l'intégralité des langues, les achats intégrés, les comptes clients, un espace agences et un back-office complet sont réservés aux lots suivants. Cette délimitation ne réduit pas l'objectif final d'équivalence fonctionnelle.

## 12. Informations à fixer avant la production

- Style visuel final et références artistiques retenues.
- Modèle de personnage et droits sur les ressources réutilisées.
- Référent religieux et contenu validé du Tawaf.
- Appareils de test et orientation des écrans.
- Versions de Blender et Unity, modules mobiles disponibles et accès macOS/Xcode.
- Dépôt GitHub définitif, projet Firebase, accès et mode de diffusion de la démonstration.
- Intérêt d'une version interactive web en complément des builds mobiles.

## 13. Références

- Application fonctionnelle de référence : https://apps.apple.com/fr/app/3d-hajj-and-umrah-guide/id662839039
- Maquette de projection : `C:\MES PROJETS\app mekka\presentation-app-omra-3d.mp4`.
- Documents précédents : `devis-techniques-omra-3d.html` et `proposition-app-omra-hajj.html`. Documents de contexte, à réconcilier avec les exigences présentes ; leurs délais et périmètres ne sont pas reconduits automatiquement.
- Firebase App Hosting, frameworks et outils : https://firebase.google.com/docs/app-hosting/frameworks-tooling
- Cloud Storage for Firebase avec Unity : https://firebase.google.com/docs/storage/unity/start

Les responsabilités d'hébergement ont été vérifiées dans la documentation Firebase le 3 octobre 2026. Aucun déploiement, projet Unity, modèle 3D ou configuration Firebase n'est livré par la seule création de ce cahier des charges.
