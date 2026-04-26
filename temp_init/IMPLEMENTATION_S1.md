# LinkedInForge - Phase 1 : Structure & MVP

Ce document détaille la structure technique initiale pour lancer le MVP de LinkedInForge.

## 1. Structure de la Base de Données Firestore

Selon la stratégie "Artisan", nous utiliserons une structure hiérarchique centrée sur l'utilisateur pour garantir la sécurité et la simplicité des règles d'accès.

### Collection : `users`
*Chaque document a pour ID l'UID Firebase Auth.*
- `email`: string
- `displayName`: string
- `createdAt`: timestamp
- `onboardingComplete`: boolean
- `settings`: map
    - `preferredTone`: string (ex: "Artisan", "Expert", "Minimalist")

### Sous-collection : `users/{userId}/posts`
- `content`: string (Le corps du post)
- `status`: string (`"draft"` | `"published"` | `"scheduled"`)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `aiMetadata`: map
    - `promptUsed`: string
    - `model`: string (ex: "gpt-4o", "claude-3-5-sonnet")
- `linkedinData`: map (optionnel)
    - `postId`: string
    - `publishedAt`: timestamp

---

## 2. Composant de Rédaction Assistée (Next.js + Tailwind)

Voici une base pour le composant `DraftEditor.tsx`. Il inclut le compteur de caractères et le bouton d'appel à l'IA.

```tsx
import React, { useState } from 'react';

const DraftEditor = () => {
  const [content, setContent] = useState('');
  const MAX_CHARS = 3000;

  const handleImprove = async () => {
    console.log("Amélioration avec LinkedInForge...");
    // Logique d'appel API à implémenter
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Votre "Artisanat" (Brouillon)
      </label>
      
      <textarea
        className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-800"
        placeholder="Écrivez votre idée ici..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex justify-between items-center mt-3">
        <span className={`text-xs ${content.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
          {content.length} / {MAX_CHARS} caractères
        </span>
        
        <button
          onClick={handleImprove}
          disabled={!content}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-full hover:shadow-md active:scale-95 disabled:opacity-50 transition-all"
        >
          ✨ Améliorer avec LinkedInForge
        </button>
      </div>
    </div>
  );
};

export default DraftEditor;
```

---

## 3. Prochaines Étapes
1. **Initialisation Next.js** : `npx create-next-app@latest .`
2. **Setup Firebase** : Créer le projet dans la console Firebase et ajouter les clés dans un fichier `.env.local`.
3. **Déploiement initial** : Connecter le repo à Vercel.

Souhaitez-vous que je vous aide à initialiser le projet Next.js maintenant ?
