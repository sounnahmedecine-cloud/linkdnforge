'use client';

import { Film, Globe2, Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { StudioTab, RecentPost, GhostwriterProfile } from '@/lib/studio/types';
import RecentPostsList from './RecentPostsList';

interface StudioHubProps {
  onSelectTab: (tab: StudioTab) => void;
  recentPosts: RecentPost[];
  onSelectPost: (post: RecentPost) => void;
  onDeletePost: (id: string) => void;
  ghostwriterProfile: GhostwriterProfile;
}

export default function StudioHub({
  onSelectTab,
  recentPosts,
  onSelectPost,
  onDeletePost,
  ghostwriterProfile,
}: StudioHubProps) {
  const isProfileConfigured = !!ghostwriterProfile.linkedinUrl || !!ghostwriterProfile.personalExamples;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-semibold backdrop-blur mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Studio Intelligent LinkedInForge
          </div>
          
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight mb-2">
            Que voulez-vous créer aujourd'hui ?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Donnez ce que vous avez. L'IA analyse la matière brute, identifie la famille éditoriale et applique votre style Ghostwriter.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Ghostwriter actif : <strong className="text-white capitalize">{ghostwriterProfile.tone || 'Expert'}</strong>
            </span>
            <span>•</span>
            <button
              onClick={() => onSelectTab('profile')}
              className="text-orange-400 hover:text-orange-300 underline font-semibold transition"
            >
              Modifier mon identité
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Entry Doors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Door 1: Video */}
        <div
          onClick={() => onSelectTab('video')}
          className="group relative bg-white hover:bg-orange-50/20 border-2 border-slate-200 hover:border-orange-500 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 group-hover:bg-orange-500 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Film className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  Audio & Vision
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  Priorité 1
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                🎥 Vidéo → Contenu
              </h2>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Déposez votre vidéo (TikTok, Reels, Démo). L'IA transcrit, extrait les moments clés et crée un post LinkedIn + script court.
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between text-sm font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
            <span>Commencer avec une vidéo</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Door 2: URL */}
        <div
          onClick={() => onSelectTab('url')}
          className="group relative bg-white hover:bg-blue-50/20 border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Globe2 className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Scraping & Hero HD
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  Produit / Article
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                🔗 URL → Contenu
              </h2>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Collez un lien (e-commerce, article, landing SaaS). L'IA détecte la nature de la page, extrait le visuel et rédige le post idéal.
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Transformer un lien</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Door 3: Idea */}
        <div
          onClick={() => onSelectTab('idea')}
          className="group relative bg-white hover:bg-amber-50/20 border-2 border-slate-200 hover:border-amber-500 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 group-hover:bg-amber-500 text-amber-700 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Ghostwriter Pur
                </span>
                <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  Pensée brute
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                ✍️ Une Idée → Post
              </h2>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Une victoire, une anecdote, une réflexion marché ? Tapez deux lignes de contexte et laissez votre Ghostwriter structurer le post.
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between text-sm font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
            <span>Rédiger une idée</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Mes Contenus Récents */}
      <div className="pt-4">
        <RecentPostsList
          posts={recentPosts}
          onSelectPost={onSelectPost}
          onDeletePost={onDeletePost}
          onNewCreation={() => onSelectTab('video')}
        />
      </div>
    </div>
  );
}
