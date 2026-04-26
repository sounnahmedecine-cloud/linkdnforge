# LinkedInForge - Stratégie Complète MVP

## 🏗️ 1. ARCHITECTURE FIRESTORE

### Collections & Schéma

```
users/
├── {uid}
│   ├── email: string
│   ├── displayName: string
│   ├── profilePhoto: string (URL)
│   ├── linkedinUrl: string
│   ├── plan: "free" | "pro" | "enterprise"
│   ├── creditsUsed: number
│   ├── creditsLimit: number
│   ├── createdAt: timestamp
│   ├── stripeCustomerId: string (optional)
│   └── metadata: {
│       ├── companyName: string
│       ├── industry: string
│       └── goals: string[]
│     }

drafts/
├── {draftId}
│   ├── userId: string (FK)
│   ├── title: string
│   ├── content: string
│   ├── status: "draft" | "scheduled" | "published"
│   ├── characterCount: number
│   ├── engagement_score: number (0-100)
│   ├── tone: "expert" | "pédagogique" | "storytelling" | "humour" | "inspirant"
│   ├── contentTheme: string[] (ex: ["Tech", "SaaS B2B"])
│   ├── postType: "story" | "conseil" | "carousel" | "mini-article" | "sondage"
│   ├── visualType: "image" | "citation"
│   ├── aiGeneratedVariants: [{
│       ├── id: string
│       ├── content: string
│       ├── scoreEstimate: number
│       └── createdAt: timestamp
│     }]
│   ├── publishedAt: timestamp (optional)
│   ├── linkedinPostId: string (optional)
│   ├── analytics: {
│       ├── impressions: number
│       ├── engagements: number
│       ├── shares: number
│       └── comments: number
│     }
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

publications/
├── {pubId}
│   ├── userId: string (FK)
│   ├── draftId: string (FK)
│   ├── linkedinPostId: string
│   ├── publishedAt: timestamp
│   ├── linkedinMetrics: {
│       ├── impressions: number
│       ├── engagements: number
│       ├── shareClicks: number
│       └── comments: number
│     }
│   └── syncedAt: timestamp

analytics/
├── {userId}
│   ├── totalPosts: number
│   ├── totalImpressions: number
│   ├── averageEngagementRate: number
│   ├── topPerformingPost: string (draftId)
│   ├── avgEngagementPerPost: number
│   ├── publishFrequency: number (posts/month)
│   └── lastUpdated: timestamp
```

### Indexes Critiques
- `drafts`: compositeIndex(userId, createdAt DESC)
- `drafts`: compositeIndex(userId, status, updatedAt DESC)
- `publications`: compositeIndex(userId, publishedAt DESC)

---

## 📊 2. ROADMAP MARKETING - 30 JOURS → 10 UTILISATEURS PAYANTS

### Semaine 1 : Fondations (J1-7)
**Objectif** : 5 utilisateurs testeurs gratuits

| Jour | Action | Canal | Succès |
|------|--------|-------|--------|
| J1-2 | Launch Beta privée (email list) | Email | 2 inscrits |
| J3 | Post LinkedIn #1 "Avant/Après" | LinkedIn | 100+ vues |
| J4 | Twitter/X : thread technique | Twitter | 50+ likes |
| J5 | Démo vidéo 2min (YouTube Shorts) | TikTok/Shorts | 200+ vues |
| J6 | Webinaire gratuit 30min | Zoom | 3 inscrits |
| J7 | Reddit: r/entrepreneur, r/freelance | Reddit | 1-2 inscrits |

**KPI semaine 1** : 5-8 free users, 20+ engaged followers

---

### Semaine 2 : Validation Produit (J8-14)
**Objectif** : 1-2 utilisateurs payants + feedback

| Jour | Action | Impact |
|------|--------|--------|
| J8-9 | Onboarding 1-on-1 avec early users | Product-Market Fit tests |
| J10 | Lancer pricing tiers + Stripe integration | Revenue ready |
| J11 | Case study #1 (user testimonial video) | Social proof |
| J12 | ProductHunt launch (soft launch) | 100-200 upvotes cible |
| J13 | Email nurture sequence v1 | Conversion |
| J14 | Review/ajustement UX basé feedback | Retention |

**KPI semaine 2** : 2-3 utilisateurs payants, 12+ free users

---

### Semaine 3 : Croissance (J15-21)
**Objectif** : 5-6 utilisateurs payants

| Jour | Action | Mécanique |
|------|--------|-----------|
| J15 | LinkedIn Ad campaign #1 (micro-budget: 50€) | Lead generation |
| J16 | Partnership: micro-influenceurs LinkedIn | Reach exponential |
| J17 | Blog post: "Comment LinkedIn favorise les freelances" | SEO |
| J18 | Webinaire payante (prix psycho: 7€) | Revenue + leads |
| J19 | Case study #2 publish | Trust building |
| J20 | Email blast: "Only 3 spots left in Founder Program" | FOMO |
| J21 | Referral program launch (réduction 20% pour refs) | Viral loop |

**KPI semaine 3** : 5-6 utilisateurs payants, 25+ free users

---

### Semaine 4 : Consolidation + Scaling (J22-30)
**Objectif** : 8-10 utilisateurs payants

| Jour | Action | Scale |
|------|--------|-------|
| J22 | LinkedIn Ad campaign #2 (budget up: 100€) | More qualified leads |
| J23 | Partner webinaire avec 2-3 creators LinkedIn | Joint audience |
| J24 | Launch "Founder Club" (groupe privé Discord/Slack) | Community + stickiness |
| J25 | Email sequence finale: "Last chance Founder Pricing" | Urgency |
| J26 | Referral leaderboard + prizes | Gamification |
| J27 | Medium.com: Republish best insights | Backlinks + authority |
| J28 | TikTok/Shorts compilation video | Trend riding |
| J29 | Final push: LinkedIn direct outreach (50 DMs) | Personal touch |
| J30 | Recap + Review planning pour mois 2 | Iteration |

**KPI semaine 4** : 8-10 utilisateurs payants, 40-50 free users

---

### Budget Marketing Recommandé (30 jours)
- Paid Ads (LinkedIn, Twitter): 200€
- Webinaires/Tools (Zoom, Loom): 50€
- Misc (domains, email marketing): 30€
- **Total**: ~280€ pour atteindre 10 users payants

### Taux de Conversion Cible
- Free → Paid: 20-25%
- Visitor → Free: 5-10%
- Referral: 30%+ (best performer)

---

## 💻 3. CODE - COMPOSANT ÉDITEUR DE POST

### Structure Composants Hiérarchie

```
/src/components/
├── Editor/
│   ├── PostEditor.tsx (composant parent)
│   ├── EditorToolbar.tsx (tone, theme, postType)
│   ├── TextInput.tsx (textarea + character counter)
│   ├── AIEnhancer.tsx (bouton + status)
│   ├── VariantSelector.tsx (carousel variantes)
│   └── Preview.tsx (aperçu LinkedIn)
├── Common/
│   ├── CharacterCounter.tsx
│   ├── ToneSelector.tsx
│   └── EngagementScoreBadge.tsx
```

### Code Principal

**components/Editor/PostEditor.tsx**
```tsx
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import TextInput from './TextInput';
import AIEnhancer from './AIEnhancer';
import VariantSelector from './VariantSelector';
import EditorToolbar from './EditorToolbar';
import Preview from './Preview';
import { useAuth } from '@/hooks/useAuth';

interface PostDraft {
  content: string;
  tone: 'expert' | 'pédagogique' | 'storytelling' | 'humour' | 'inspirant';
  contentTheme: string[];
  postType: 'story' | 'conseil' | 'carousel' | 'mini-article' | 'sondage';
  visualType: 'image' | 'citation';
  variants: Array<{ id: string; content: string; score: number }>;
}

export default function PostEditor({ draftId }: { draftId?: string }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState<PostDraft>({
    content: '',
    tone: 'expert',
    contentTheme: [],
    postType: 'story',
    visualType: 'image',
    variants: []
  });

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  // Sauvegarde auto (debounce 2s)
  const handleContentChange = (content: string) => {
    setDraft(prev => ({ ...prev, content }));
    saveDraft({ ...draft, content });
  };

  const saveDraft = async (data: PostDraft) => {
    if (!user) return;
    
    try {
      if (draftId) {
        await updateDoc(doc(db, 'drafts', draftId), {
          ...data,
          characterCount: data.content.length,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'drafts'), {
          userId: user.uid,
          ...data,
          characterCount: data.content.length,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!draft.content || draft.content.length < 50) {
      alert('Minimum 50 caractères requis');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-post', {
        method: 'POST',
        body: JSON.stringify({
          content: draft.content,
          tone: draft.tone,
          postType: draft.postType,
          themes: draft.contentTheme
        })
      });

      const { variants } = await response.json();
      setDraft(prev => ({
        ...prev,
        variants: variants.map((v: string, i: number) => ({
          id: `v${i}`,
          content: v,
          score: calculateEngagementScore(v)
        }))
      }));
    } catch (error) {
      console.error('Erreur IA:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const calculateEngagementScore = (content: string): number => {
    let score = 50;
    
    // Questions augmentent le score (+15)
    if (content.includes('?')) score += 15;
    
    // Emojis (+10 par emoji, max 20)
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    score += Math.min(emojiCount * 10, 20);
    
    // Hashtags (+5 par tag, max 15)
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    score += Math.min(hashtagCount * 5, 15);
    
    // Appels à l'action (+10)
    if (/^(Partagez|Dites-moi|Votez|Répondez)/i.test(content)) score += 10;
    
    return Math.min(score, 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Colonne gauche : Éditeur */}
        <div className="space-y-4">
          <EditorToolbar
            tone={draft.tone}
            onToneChange={(tone) => setDraft(prev => ({ ...prev, tone }))}
            themes={draft.contentTheme}
            onThemesChange={(themes) => setDraft(prev => ({ ...prev, contentTheme: themes }))}
            postType={draft.postType}
            onPostTypeChange={(postType) => setDraft(prev => ({ ...prev, postType }))}
          />

          <TextInput
            value={draft.content}
            onChange={handleContentChange}
            maxLength={3000}
            placeholder="Écrivez votre post LinkedIn... (min 50 caractères)"
          />

          <div className="flex gap-3">
            <button
              onClick={handleEnhanceWithAI}
              disabled={isEnhancing || draft.content.length < 50}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isEnhancing ? (
                <>
                  <span className="animate-spin">⚡</span> Amélioration...
                </>
              ) : (
                <>⚡ Améliorer avec LinkedInForge</>
              )}
            </button>
            <button
              onClick={() => saveDraft(draft)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              💾 Brouillon
            </button>
          </div>
        </div>

        {/* Colonne droite : Aperçu */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Aperçu LinkedIn</h2>
          
          {draft.variants.length > 0 && (
            <VariantSelector
              variants={draft.variants}
              selected={selectedVariant}
              onSelect={setSelectedVariant}
            />
          )}

          <Preview
            content={selectedVariant !== null ? draft.variants[selectedVariant].content : draft.content}
            engagementScore={selectedVariant !== null ? draft.variants[selectedVariant].score : calculateEngagementScore(draft.content)}
          />
        </div>
      </div>
    </div>
  );
}
```

**components/Editor/TextInput.tsx**
```tsx
import { ChangeEvent } from 'react';

interface TextInputProps {
  value: string;
  onChange: (content: string) => void;
  maxLength: number;
  placeholder?: string;
}

export default function TextInput({ value, onChange, maxLength, placeholder }: TextInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      onChange(e.target.value);
    }
  };

  const remaining = maxLength - value.length;
  const percentage = (value.length / maxLength) * 100;

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="flex justify-between items-center">
        <span className={`text-sm font-semibold ${remaining < 100 ? 'text-orange-600' : 'text-gray-600'}`}>
          {value.length} / {maxLength} caractères
        </span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

**components/Editor/Preview.tsx**
```tsx
import { EngagementScoreBadge } from '@/components/Common/EngagementScoreBadge';

interface PreviewProps {
  content: string;
  engagementScore: number;
}

export default function Preview({ content, engagementScore }: PreviewProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
      {/* LinkedIn-like card */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full" />
          <div>
            <p className="font-bold text-gray-900">Votre Nom</p>
            <p className="text-xs text-gray-600">À l'instant</p>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{content}</p>

        {/* Engagement Score */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <EngagementScoreBadge score={engagementScore} />
          <div className="flex gap-4 text-gray-500 text-xs">
            <span>👍 Likes</span>
            <span>💬 Commentaires</span>
            <span>↗️ Partages</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**API: /api/enhance-post** (à déployer avec Claude API ou OpenAI)
```tsx
// pages/api/enhance-post.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { content, tone, postType, themes } = await req.json();

  const toneInstructions = {
    expert: "Soyez autoritaire, apportez de la valeur unique et de l'expertise.",
    pédagogique: "Expliquez simplement, utilisez des listes et des analogies claires.",
    storytelling: "Racontez une histoire, avec un arc narratif et une leçon.",
    humour: "Injectez de l'humour léger, des observations amusantes sur le métier.",
    inspirant: "Soyez motivant, visionnaire, utilisez des appels à l'action."
  };

  const prompt = `Tu es un expert en contenu LinkedIn spécialisé en ${postType}. 

Contexte du post original:
"${content}"

Thématiques: ${themes.join(', ')}
Ton: ${toneInstructions[tone as keyof typeof toneInstructions]}

Génère 3 variantes DISTINCTES du post LinkedIn (différentes angles, structures, accroches).

Contraintes:
- Chaque variante max 3000 caractères
- Optimisées pour l'engagement LinkedIn
- Conserve l'idée centrale du post original
- Inclus 1-2 emojis pertinents par variante
- Ajoute un CTA clair (question, partage, ou appel à l'action)

Format réponse JSON:
{
  "variants": ["variante 1", "variante 2", "variante 3"]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const { variants } = JSON.parse(responseText);

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Erreur IA' }, { status: 500 });
  }
}
```

---

## 🎯 PRIORISATION MVP

### Phase 1 (Semaine 1-2)
- ✅ Authentification Firebase
- ✅ Composant éditeur basique
- ✅ Sauvegarde brouillons Firestore
- ✅ Intégration API IA Claude
- ⏳ Stripe (payment simple)

### Phase 2 (Semaine 3)
- Plans de pricing
- Limite de crédits
- Historique posts
- Analytique basique

### Phase 3+ (Après)
- Intégration API LinkedIn officielle
- Scheduling automatique
- Templates de contenus
- Équipe collaboration

---

## 📈 MÉTRIQUES À TRACKER

| Métrique | Cible J30 | Outil |
|----------|-----------|-------|
| Signups | 40-50 | Firebase Analytics |
| Conversion Free→Paid | 20-25% | Stripe + custom |
| MRR | 500-600€ (10×60€) | Stripe |
| CAC | <50€ | UTM + Analytics |
| Churn | <10% | Dashboard custom |

---

**En résumé** : Focalise-toi sur le code MVP week 1-2, lance la bêta fermée J5, puis itère marketing hard weeks 2-4. Les 10 premiers utilisateurs payants = product-market fit validé.
