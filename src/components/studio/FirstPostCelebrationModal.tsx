'use client';

import { Check, Sparkles, ArrowRight, X, UserCheck, Share2 } from 'lucide-react';
import { StudioTab } from '@/lib/studio/types';

interface FirstPostCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToGhostwriter: () => void;
}

export default function FirstPostCelebrationModal({
  isOpen,
  onClose,
  onGoToGhostwriter,
}: FirstPostCelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-10 shadow-2xl border border-slate-100 relative text-center animate-in zoom-in-95 duration-300 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/25 animate-bounce">
          <span className="text-3xl">🎉</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="inline-block text-xs font-mono font-black uppercase tracking-widest text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
            Étape 1 réussie !
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
            Votre première publication est forgée !
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Votre post LinkedIn est structuré, aéré et optimisé pour capter l&apos;attention de votre réseau dès la première ligne.
          </p>
        </div>

        {/* Upsell / Progression Card to Ghostwriter */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Prochaine étape recommandée :</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Voulez-vous que vos prochains posts ressemblent encore plus à votre façon naturelle de parler et à votre profil ?
          </p>
          <button
            type="button"
            onClick={() => {
              onGoToGhostwriter();
              onClose();
            }}
            className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition hover:scale-[1.01] cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Personnaliser mon style Ghostwriter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          Voir et copier mon post forgé →
        </button>
      </div>
    </div>
  );
}
