'use client';

import { useState, useEffect } from 'react';
import { Check, Zap, ArrowRight, X, ExternalLink, Sparkles } from 'lucide-react';

interface SocialOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export default function SocialOnboardingModal({
  isOpen,
  onClose,
  onOpenSettings,
}: SocialOnboardingModalProps) {
  const [linkedInStatus, setLinkedInStatus] = useState<{
    connected: boolean;
    hasAppConfigured: boolean;
    profile?: { name: string };
  } | null>(null);

  const [facebookStatus, setFacebookStatus] = useState<{
    connected: boolean;
    hasAppConfigured: boolean;
    page?: { id: string; name: string };
  } | null>(null);

  const [twitterStatus, setTwitterStatus] = useState<{
    connected: boolean;
    hasAppConfigured: boolean;
    user?: { id: string; username: string; name: string };
  } | null>(null);

  const [redditStatus, setRedditStatus] = useState<{
    connected: boolean;
    hasAppConfigured: boolean;
    user?: { id: string; name: string };
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/auth/linkedin/status')
      .then((res) => res.json())
      .then((data) => setLinkedInStatus(data))
      .catch((err) => console.error('Failed to load LinkedIn status:', err));

    fetch('/api/auth/facebook/status')
      .then((res) => res.json())
      .then((data) => setFacebookStatus(data))
      .catch((err) => console.error('Failed to load Facebook status:', err));

    fetch('/api/auth/twitter/status')
      .then((res) => res.json())
      .then((data) => setTwitterStatus(data))
      .catch((err) => console.error('Failed to load Twitter status:', err));

    fetch('/api/auth/reddit/status')
      .then((res) => res.json())
      .then((data) => setRedditStatus(data))
      .catch((err) => console.error('Failed to load Reddit status:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const connectedCount =
    (linkedInStatus?.connected ? 1 : 0) +
    (facebookStatus?.connected ? 1 : 0) +
    (twitterStatus?.connected ? 1 : 0) +
    (redditStatus?.connected ? 1 : 0);

  const handleFinish = () => {
    try {
      localStorage.setItem('linkdnforge_social_onboarded', 'true');
    } catch (e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleFinish}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          title="Passer pour le moment"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon + Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-400 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Reliez vos canaux en 1 Clic
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Pour diffuser vos posts instantanément en 0 clic, connectez vos comptes une seule fois.
          </p>

          {connectedCount > 0 && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                {connectedCount} canal{connectedCount > 1 ? 'aux' : ''} connecté{connectedCount > 1 ? 's' : ''} avec succès ! Vous pouvez lier vos autres canaux ou entrer dans le Studio.
              </span>
            </div>
          )}
        </div>

        {/* Channels Grid (4 Channels) */}
        <div className="space-y-3 pt-2">
          {/* 1. LinkedIn */}
          <div
            className={`border rounded-2xl p-4 flex items-center justify-between gap-3 transition ${
              linkedInStatus?.connected
                ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                : 'bg-slate-50 hover:bg-blue-50/30 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                in
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-900 block truncate">LinkedIn</span>
                <span className="text-xs text-slate-500 block truncate">
                  {linkedInStatus?.connected
                    ? `Connecté en tant que ${linkedInStatus.profile?.name || 'Vous'}`
                    : 'Profil personnel & Réseau pro'}
                </span>
              </div>
            </div>

            {linkedInStatus?.connected ? (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 border border-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Connecté
              </span>
            ) : (
              <a
                href="/api/auth/linkedin"
                className="px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
              >
                <span>Lier mon compte</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}
          </div>

          {/* 2. Facebook Page */}
          <div
            className={`border rounded-2xl p-4 flex items-center justify-between gap-3 transition ${
              facebookStatus?.connected
                ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                : 'bg-slate-50 hover:bg-blue-50/30 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                f
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-900 block truncate">Page Facebook</span>
                <span className="text-xs text-slate-500 block truncate">
                  {facebookStatus?.connected
                    ? `Page : ${facebookStatus.page?.name || 'Votre Page'}`
                    : 'Page officielle créateur / entreprise'}
                </span>
              </div>
            </div>

            {facebookStatus?.connected ? (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 border border-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Connecté
              </span>
            ) : (
              <a
                href="/api/auth/facebook"
                className="px-4 py-2 bg-[#1877F2] hover:bg-[#0f60c7] text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
              >
                <span>Lier ma Page</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}
          </div>

          {/* 3. X (Twitter) */}
          <div
            className={`border rounded-2xl p-4 flex items-center justify-between gap-3 transition ${
              twitterStatus?.connected
                ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100/60 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                𝕏
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-900 block truncate">X (Twitter)</span>
                <span className="text-xs text-slate-500 block truncate">
                  {twitterStatus?.connected
                    ? `Connecté en tant que @${twitterStatus.user?.username || 'Vous'}`
                    : 'Compte officiel & API v2'}
                </span>
              </div>
            </div>

            {twitterStatus?.connected ? (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 border border-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Connecté
              </span>
            ) : (
              <a
                href="/api/auth/twitter"
                className="px-4 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
              >
                <span>Lier mon compte</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}
          </div>

          {/* 4. Reddit */}
          <div
            className={`border rounded-2xl p-4 flex items-center justify-between gap-3 transition ${
              redditStatus?.connected
                ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                : 'bg-slate-50 hover:bg-orange-50/30 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FF4500] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                🤖
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-900 block truncate">Reddit</span>
                <span className="text-xs text-slate-500 block truncate">
                  {redditStatus?.connected
                    ? `Connecté en tant que u/${redditStatus.user?.name || 'Vous'}`
                    : 'Subreddits & Profil Reddit'}
                </span>
              </div>
            </div>

            {redditStatus?.connected ? (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 border border-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Connecté
              </span>
            ) : (
              <a
                href="/api/auth/reddit"
                className="px-4 py-2 bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
              >
                <span>Lier mon compte</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer"
          >
            <span>Accéder à mon Studio de Création</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-[11px] text-slate-400">
            Vous pourrez toujours modifier vos comptes à tout moment depuis l'onglet « Réglages ».
          </p>
        </div>
      </div>
    </div>
  );
}
