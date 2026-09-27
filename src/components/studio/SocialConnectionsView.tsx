'use client';

import { useState } from 'react';
import { SocialConnections } from '@/lib/studio/types';
import { saveSocialConnections } from '@/lib/studio/storage';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Key,
  Globe2,
  Lock,
  ExternalLink,
  Zap,
  Info,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SocialConnectionsViewProps {
  connections: SocialConnections;
  onUpdateConnections: (updated: SocialConnections) => void;
  onBack: () => void;
  isAdmin?: boolean;
}

export default function SocialConnectionsView({
  connections,
  onUpdateConnections,
  onBack,
  isAdmin = false,
}: SocialConnectionsViewProps) {
  const [formData, setFormData] = useState<SocialConnections>(connections);
  const [showToken, setShowToken] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSocialConnections(formData);
    onUpdateConnections(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isBufferConfigured = !!formData.bufferToken || isAdmin;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Studio
        </button>
        <span className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <Zap className="w-3.5 h-3.5 fill-current" />
          Fonctionnalité Pro : Multi-Diffusion 1-Clic
        </span>
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1.5 flex items-center gap-2">
          <span>🔗</span> Comptes & Réseaux Connectés
        </h2>
        <p className="text-sm text-slate-500">
          Connectez vos comptes sociaux pour activer la publication automatique depuis votre Studio. Dès que votre contenu est forgé, diffusez-le en un clic sans copier-coller manuel.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Buffer Central Gateway */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xl">
                B
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  Passerelle Buffer Multi-Réseaux
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Recommandé
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Reliez TikTok, Instagram, LinkedIn et Facebook en un seul endroit grâce à l'API Buffer.
                </p>
              </div>
            </div>

            <a
              href="https://buffer.com/developers/apps"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 self-start sm:self-auto transition"
            >
              Obtenir ma clé API Buffer
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-orange-400" />
                Token d'accès Buffer personnel (Access Token)
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  name="bufferToken"
                  value={formData.bufferToken || ''}
                  onChange={handleInputChange}
                  placeholder={
                    isAdmin
                      ? 'Compte Administrateur : Token par défaut actif'
                      : 'Collez votre Access Token Buffer (ex: 1/abcdef123456...)'
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {showToken ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                Votre token reste chiffré et n'est utilisé que pour diffuser vos propres publications.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ID Profil TikTok Buffer (Optionnel)
                </label>
                <input
                  type="text"
                  name="bufferProfileIdTiktok"
                  value={formData.bufferProfileIdTiktok || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 66324ef289..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ID Profil Instagram Buffer (Optionnel)
                </label>
                <input
                  type="text"
                  name="bufferProfileIdInstagram"
                  value={formData.bufferProfileIdInstagram || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 66324f019a..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Connected Channels Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span>📡</span> Vos Canaux de Diffusion
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LinkedIn */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 hover:bg-white transition shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    in
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">LinkedIn</h4>
                    <p className="text-[11px] text-slate-500">Profil & Page Entreprise</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Connecté
                </span>
              </div>
              <input
                type="text"
                name="linkedinProfileName"
                value={formData.linkedinProfileName || ''}
                onChange={handleInputChange}
                placeholder="Nom du compte ou URL du profil"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* TikTok */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 hover:bg-white transition shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    🎵
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">TikTok</h4>
                    <p className="text-[11px] text-slate-500">Vidéos courtes & Scripts</p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isBufferConfigured
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border border-amber-200'
                }`}>
                  {isBufferConfigured ? '✓ Prêt via Buffer' : 'Configuration requise'}
                </span>
              </div>
              <input
                type="text"
                name="tiktokAccountName"
                value={formData.tiktokAccountName || ''}
                onChange={handleInputChange}
                placeholder="@votre_compte_tiktok"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
              />
            </div>

            {/* Instagram */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 hover:bg-white transition shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    📸
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Instagram</h4>
                    <p className="text-[11px] text-slate-500">Reels & Carrousels</p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isBufferConfigured
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border border-amber-200'
                }`}>
                  {isBufferConfigured ? '✓ Prêt via Buffer' : 'Configuration requise'}
                </span>
              </div>
              <input
                type="text"
                name="instagramAccountName"
                value={formData.instagramAccountName || ''}
                onChange={handleInputChange}
                placeholder="@votre_compte_instagram"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Facebook */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 hover:bg-white transition shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    f
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Facebook</h4>
                    <p className="text-[11px] text-slate-500">Pages professionnelles</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  Prêt
                </span>
              </div>
              <input
                type="text"
                name="facebookPageName"
                value={formData.facebookPageName || ''}
                onChange={handleInputChange}
                placeholder="Nom de votre Page Facebook"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* X / Twitter */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 hover:bg-white transition shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    𝕏
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">X (Twitter)</h4>
                    <p className="text-[11px] text-slate-500">Fils & Threads d'expertise</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  Actif
                </span>
              </div>
              <input
                type="text"
                name="xHandle"
                value={formData.xHandle || ''}
                onChange={handleInputChange}
                placeholder="@votre_handle_x"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
              />
            </div>

            {/* Snapchat & YouTube Shorts */}
            <div className="border border-dashed border-slate-300 rounded-2xl p-5 space-y-2 bg-slate-50/30 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👻 📺</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Snapchat & YouTube Shorts</h4>
                    <p className="text-[10px] text-slate-500">Distribution vidéo automatique</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  Roadmap Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                La publication native vers Snapchat Spotlight et YouTube Shorts arrive dans la mise à jour suivante.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <Button
            type="submit"
            size="lg"
            className="py-3 px-6 text-sm font-bold bg-slate-900 hover:bg-black text-white rounded-xl flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Enregistrer mes connexions réseaux
          </Button>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Connexions enregistrées avec succès !
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
