'use client';

import { useState } from 'react';
import { Film, Globe2, Sparkles, ArrowRight, X, Zap, CheckCircle2 } from 'lucide-react';
import { StudioTab } from '@/lib/studio/types';

interface FirstTimeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoor: (door: StudioTab) => void;
}

export default function FirstTimeOnboardingModal({
  isOpen,
  onClose,
  onSelectDoor,
}: FirstTimeOnboardingModalProps) {
  if (!isOpen) return null;

  const handleChoose = (tab: StudioTab) => {
    try {
      localStorage.setItem('linkdnforge_first_onboarding_started', 'true');
    } catch (e) {}
    onSelectDoor(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] max-w-2xl w-full p-6 sm:p-10 shadow-2xl border border-slate-100 relative text-left animate-in zoom-in-95 duration-300 space-y-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          aria-label="Fermer et explorer librement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Welcome badge */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Bienvenue dans votre Atelier personnel
          </span>

          <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
            Forgons votre premier post en moins de 30 secondes.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            <strong className="text-slate-900">Vous apportez la matière première.</strong> LinkedInForge forge le contenu prêt à publier, optimisé pour l&apos;algorithme.
          </p>
        </div>

        {/* 3 Main Raw Material Doors */}
        <div className="space-y-3">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Quelle est votre matière première aujourd&apos;hui ?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Door 1: Video */}
            <button
              type="button"
              onClick={() => handleChoose('video')}
              className="group text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-orange-500 bg-slate-50/60 hover:bg-orange-50/30 transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 group-hover:bg-orange-500 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors shadow-inner">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-orange-600">
                    🎥 J&apos;ai une vidéo
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    TikTok, Reels, mp4, démo ou webinaire.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                <span>Choisir vidéo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Door 2: URL */}
            <button
              type="button"
              onClick={() => handleChoose('url')}
              className="group text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-inner">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-blue-600">
                    🔗 J&apos;ai une URL
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Site web, article de blog ou page produit.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Coller un lien</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Door 3: Idea */}
            <button
              type="button"
              onClick={() => handleChoose('idea')}
              className="group text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-500 bg-slate-50/60 hover:bg-amber-50/30 transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-500 text-amber-700 group-hover:text-white flex items-center justify-center transition-colors shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-amber-600">
                    ✍️ J&apos;ai une idée
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Une leçon, une note brute ou un avis métier.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                <span>Rédiger une idée</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Reassurance Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>5 générations complètes offertes · Sans engagement</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-700 underline font-medium"
          >
            Explorer l&apos;Atelier librement
          </button>
        </div>
      </div>
    </div>
  );
}
