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
  Share2,
  Send,
  HelpCircle,
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

    // Clean URLs (ensure https:// if user pasted without protocol)
    const cleaned = { ...formData };
    if (cleaned.linkedinProfileName && !cleaned.linkedinProfileName.startsWith('http')) {
      cleaned.linkedinProfileName = `https://${cleaned.linkedinProfileName}`;
    }
    if (cleaned.facebookPageName && !cleaned.facebookPageName.startsWith('http')) {
      cleaned.facebookPageName = `https://${cleaned.facebookPageName}`;
    }

    setFormData(cleaned);
    saveSocialConnections(cleaned);
    onUpdateConnections(cleaned);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const isBufferConfigured = !!formData.bufferToken || isAdmin;

  // Test Publish Helpers (Opens native share dialogue with sample text)
  const testShareLinkedIn = () => {
    const text = encodeURIComponent('🚀 Test de connexion réussi depuis mon Studio LinkedInForge ! Mes futurs posts seront forgés et diffusés en 1 clic.');
    window.open(`https://www.linkedin.com/feed/?text=${text}`, '_blank');
  };

  const testShareFacebook = () => {
    const text = encodeURIComponent('🚀 Test de connexion réussi depuis mon Studio LinkedInForge !');
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
  };

  const testShareX = () => {
    const text = encodeURIComponent('🚀 Test de connexion réussi depuis LinkedInForge !');
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const openProfileUrl = (rawUrl?: string) => {
    if (!rawUrl) return;
    const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    window.open(url, '_blank');
  };

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
          Enregistrez vos comptes pour activer la diffusion 1-clic. Dès qu'un post est forgé dans votre Studio, vous pouvez le publier instantanément sans copier-coller manuel.
        </p>
      </div>

      {/* Explication claire sur le fonctionnement */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-blue-900">
        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold text-blue-950 text-sm">Comment fonctionne la diffusion sur vos réseaux ?</strong>
          <ul className="list-disc pl-4 space-y-1 text-blue-800 leading-relaxed">
            <li>
              <strong>LinkedIn & Facebook :</strong> Dès que votre post est forgé dans le Studio, le bouton « Publier » ouvre directement la fenêtre officielle pré-remplie sur votre compte connecté.
            </li>
            <li>
              <strong>TikTok & Instagram :</strong> Si vous activez la passerelle Buffer ci-dessous, la publication est 100% automatique en arrière-plan sans ouvrir d'application.
            </li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Connected Channels Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span>📡</span> Vos Profils & Pages Sociaux
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LinkedIn */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-2xs ${
              formData.linkedinProfileName ? 'bg-blue-50/20 border-blue-300' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    in
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">LinkedIn</h4>
                    <p className="text-[11px] text-slate-500">Profil personnel ou Page Entreprise</p>
                  </div>
                </div>

                {formData.linkedinProfileName ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Check className="w-3 h-3 text-emerald-600" /> Profil Relié
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Non configuré
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  URL de votre profil ou page LinkedIn :
                </label>
                <input
                  type="text"
                  name="linkedinProfileName"
                  value={formData.linkedinProfileName || ''}
                  onChange={handleInputChange}
                  placeholder="https://www.linkedin.com/in/votre-nom"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {formData.linkedinProfileName && (
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openProfileUrl(formData.linkedinProfileName)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir mon profil
                  </button>
                  <button
                    type="button"
                    onClick={testShareLinkedIn}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                  >
                    <Send className="w-3 h-3" />
                    Tester le partage 1-clic
                  </button>
                </div>
              )}
            </div>

            {/* Facebook */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-2xs ${
              formData.facebookPageName ? 'bg-blue-50/20 border-blue-300' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    f
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Facebook</h4>
                    <p className="text-[11px] text-slate-500">Page pro ou Profil personnel</p>
                  </div>
                </div>

                {formData.facebookPageName ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <Check className="w-3 h-3 text-emerald-600" /> Profil Relié
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Non configuré
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  URL de votre profil ou Page Facebook :
                </label>
                <input
                  type="text"
                  name="facebookPageName"
                  value={formData.facebookPageName || ''}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/votre-page ou profil"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              {formData.facebookPageName && (
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openProfileUrl(formData.facebookPageName)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir mon compte
                  </button>
                  <button
                    type="button"
                    onClick={testShareFacebook}
                    className="px-2.5 py-1 bg-[#1877F2] hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                  >
                    <Send className="w-3 h-3" />
                    Tester le partage 1-clic
                  </button>
                </div>
              )}
            </div>

            {/* TikTok */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-2xs ${
              formData.tiktokAccountName ? 'bg-slate-100/50 border-slate-300' : 'bg-slate-50/50 border-slate-200'
            }`}>
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
                    : 'text-slate-500 bg-slate-100'
                }`}>
                  {isBufferConfigured ? '✓ Prêt via Buffer' : 'Passerelle requise'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom d'utilisateur TikTok :
                </label>
                <input
                  type="text"
                  name="tiktokAccountName"
                  value={formData.tiktokAccountName || ''}
                  onChange={handleInputChange}
                  placeholder="@abbi.muslim ou votre pseudo"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
                />
              </div>

              {formData.tiktokAccountName && (
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => window.open(`https://www.tiktok.com/${formData.tiktokAccountName?.startsWith('@') ? formData.tiktokAccountName : `@${formData.tiktokAccountName}`}`, '_blank')}
                    className="text-slate-700 hover:text-black font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir sur TikTok
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open('https://www.tiktok.com/upload', '_blank')}
                    className="px-2.5 py-1 bg-black hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    Ouvrir TikTok Studio
                  </button>
                </div>
              )}
            </div>

            {/* Instagram */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-2xs ${
              formData.instagramAccountName ? 'bg-pink-50/20 border-pink-300' : 'bg-slate-50/50 border-slate-200'
            }`}>
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
                    : 'text-slate-500 bg-slate-100'
                }`}>
                  {isBufferConfigured ? '✓ Prêt via Buffer' : 'Passerelle requise'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom d'utilisateur Instagram :
                </label>
                <input
                  type="text"
                  name="instagramAccountName"
                  value={formData.instagramAccountName || ''}
                  onChange={handleInputChange}
                  placeholder="@aa.mina212 ou votre compte"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              {formData.instagramAccountName && (
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => window.open(`https://www.instagram.com/${formData.instagramAccountName?.replace(/^@/, '')}`, '_blank')}
                    className="text-pink-600 hover:text-pink-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir sur Instagram
                  </button>
                </div>
              )}
            </div>

            {/* X / Twitter */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-2xs ${
              formData.xHandle ? 'bg-slate-100/50 border-slate-300' : 'bg-slate-50/50 border-slate-200'
            }`}>
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

                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  formData.xHandle ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-400 bg-slate-100'
                }`}>
                  {formData.xHandle ? '✓ Prêt' : 'Non configuré'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom d'utilisateur X :
                </label>
                <input
                  type="text"
                  name="xHandle"
                  value={formData.xHandle || ''}
                  onChange={handleInputChange}
                  placeholder="@votre_handle_x"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
                />
              </div>

              {formData.xHandle && (
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <button
                    type="button"
                    onClick={testShareX}
                    className="px-2.5 py-1 bg-black hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <Send className="w-3 h-3" />
                    Tester le partage sur X
                  </button>
                </div>
              )}
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
                    Automatisation Totale
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Reliez TikTok et Instagram pour publier en arrière-plan sans ouvrir l'application mobile.
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
                      ? 'Compte Fondateur : Token par défaut actif (@abbi.muslim / @aa.mina212)'
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
                Votre token reste chiffré localement et n'est utilisé que pour diffuser vos propres publications.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto py-3 px-6 text-sm font-bold bg-slate-900 hover:bg-black text-white rounded-xl flex items-center justify-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            Enregistrer mes connexions réseaux
          </Button>

          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Vos comptes sont enregistrés et reliés à votre Studio !</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
