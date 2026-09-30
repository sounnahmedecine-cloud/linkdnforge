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
      {/* Clean Airy Title with Atelier Positioning */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono font-black uppercase tracking-wider text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full inline-block">
          ✨ Atelier de création de contenu
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Vous apportez la matière. LinkedInForge forge vos publications.
        </h1>
        <p className="text-slate-500 text-sm">
          Choisissez votre matière première pour forger votre prochain post LinkedIn dans votre style.
        </p>
      </div>

      {/* 3 Main Entry Doors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Door 1: Video */}
        <div
          onClick={() => onSelectTab('video')}
          className="group relative bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-500 rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-orange-100 group-hover:bg-orange-500 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Film className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                🎥 Vidéo → Contenu
              </h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Importez une vidéo (TikTok, Reels, Démo) pour extraire les moments clés et rédiger le post parfait.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
            <span>Créer depuis une vidéo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Door 2: URL */}
        <div
          onClick={() => onSelectTab('url')}
          className="group relative bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-500 rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Globe2 className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                🔗 URL → Contenu
              </h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Collez un lien (site, article, produit) pour capturer le visuel et rédiger le post instantanément.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Transformer un lien</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Door 3: Idea */}
        <div
          onClick={() => onSelectTab('idea')}
          className="group relative bg-white hover:bg-amber-50/20 border border-slate-200 hover:border-amber-500 rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 group-hover:bg-amber-500 text-amber-700 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                ✍️ Une Idée → Post
              </h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tapez votre idée brute en 2 lignes et laissez le Ghostwriter la forger selon votre style unique.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
            <span>Rédiger une idée</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
