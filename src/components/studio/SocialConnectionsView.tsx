'use client';

import { useState } from 'react';
import { SocialConnections } from '@/lib/studio/types';
import { saveSocialConnections } from '@/lib/studio/storage';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  ExternalLink,
  Zap,
  Check,
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
}: SocialConnectionsViewProps) {
  const [formData, setFormData] = useState<SocialConnections>(connections);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean URLs
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

  // Test Publish Helpers (Opens native share dialogue with sample text copied)
  const testShareLinkedIn = () => {
    const sampleText = '🚀 Test de connexion réussi depuis mon Studio LinkedInForge ! Mes futurs posts seront forgés et diffusés en 1 clic.';
    navigator.clipboard.writeText(sampleText);
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
  };

  const testShareFacebook = () => {
    const sampleText = '🚀 Test de connexion réussi depuis mon Studio LinkedInForge !';
    navigator.clipboard.writeText(sampleText);
    window.open('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Flinkedinforge.fr', '_blank');
  };

  const testShareX = () => {
    const text = encodeURIComponent('🚀 Test de diffusion réussi depuis LinkedInForge !');
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const testShareReddit = () => {
    const title = encodeURIComponent('Test de diffusion depuis LinkedInForge');
    const text = encodeURIComponent('🚀 Mon premier post forgé avec succès.');
    window.open(`https://www.reddit.com/submit?title=${title}&text=${text}`, '_blank');
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
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Studio
        </button>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
          <Zap className="w-3.5 h-3.5 text-emerald-600 fill-current" />
          Zéro Clé API • 100% Gratuit & Immédiat
        </span>
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1.5 flex items-center gap-2">
          <span>🔗</span> Vos Profils & Réseaux Sociaux
        </h2>
        <p className="text-sm text-slate-500">
          Enregistrez vos coordonnées pour vos 4 canaux majeurs (LinkedIn, Facebook, X et Reddit). Aucune clé API complexe n'est requise.
        </p>
      </div>

      {/* Explication claire sur le fonctionnement */}
      <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-orange-950">
        <HelpCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <strong className="block font-bold text-orange-950 text-sm">Comment fonctionne la diffusion sans API ?</strong>
          <p className="text-orange-900 leading-relaxed">
            Dès qu'un post est généré dans votre Studio, le bouton <strong>« Diffuser »</strong> copie instantanément l'intégralité du texte dans votre presse-papier et ouvre la boîte de publication officielle de votre réseau. Il ne vous reste qu'à faire <strong>Ctrl + V</strong> (Coller) et cliquer sur Publier.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Connected Channels Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span>📡</span> Vos 4 Canaux Directs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. LinkedIn */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-xs ${
              formData.linkedinProfileName ? 'bg-blue-50/30 border-blue-300' : 'bg-slate-50/50 border-slate-200'
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
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Profil Relié
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Prêt
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

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                {formData.linkedinProfileName && (
                  <button
                    type="button"
                    onClick={() => openProfileUrl(formData.linkedinProfileName)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir mon profil
                  </button>
                )}
                <button
                  type="button"
                  onClick={testShareLinkedIn}
                  className="ml-auto px-2.5 py-1 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                >
                  <Send className="w-3 h-3" />
                  Tester le partage
                </button>
              </div>
            </div>

            {/* 2. Facebook */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-xs ${
              formData.facebookPageName ? 'bg-blue-50/20 border-blue-300' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    f
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Facebook</h4>
                    <p className="text-[11px] text-slate-500">Page ou Groupe professionnel</p>
                  </div>
                </div>

                {formData.facebookPageName ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Page Reliée
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Prêt
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  URL de votre Page ou Profil Facebook :
                </label>
                <input
                  type="text"
                  name="facebookPageName"
                  value={formData.facebookPageName || ''}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/votrepage"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                {formData.facebookPageName && (
                  <button
                    type="button"
                    onClick={() => openProfileUrl(formData.facebookPageName)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir ma page
                  </button>
                )}
                <button
                  type="button"
                  onClick={testShareFacebook}
                  className="ml-auto px-2.5 py-1 bg-[#1877F2] hover:bg-[#0c5dc7] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                >
                  <Send className="w-3 h-3" />
                  Tester le partage
                </button>
              </div>
            </div>

            {/* 3. X (Twitter) */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-xs ${
              formData.xHandle ? 'bg-slate-100/60 border-slate-300' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    𝕏
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">X (Twitter)</h4>
                    <p className="text-[11px] text-slate-500">Posts & Fils d'actualité</p>
                  </div>
                </div>

                {formData.xHandle ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Configuré
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Prêt
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom d'utilisateur X (@pseudo) :
                </label>
                <input
                  type="text"
                  name="xHandle"
                  value={formData.xHandle || ''}
                  onChange={handleInputChange}
                  placeholder="@mon_pseudo"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                {formData.xHandle && (
                  <button
                    type="button"
                    onClick={() => window.open(`https://twitter.com/${formData.xHandle?.replace(/^@/, '')}`, '_blank')}
                    className="text-slate-800 hover:text-black font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir mon compte
                  </button>
                )}
                <button
                  type="button"
                  onClick={testShareX}
                  className="ml-auto px-2.5 py-1 bg-black hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                >
                  <Send className="w-3 h-3" />
                  Tester le tweet
                </button>
              </div>
            </div>

            {/* 4. Reddit */}
            <div className={`border rounded-2xl p-5 space-y-3 transition shadow-xs ${
              formData.redditUsername ? 'bg-orange-50/20 border-orange-300' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF4500] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    🤖
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Reddit</h4>
                    <p className="text-[11px] text-slate-500">Communautés & Subreddits</p>
                  </div>
                </div>

                {formData.redditUsername ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Configuré
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Prêt
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom d'utilisateur ou Subreddit favori (ex: r/entrepreneur) :
                </label>
                <input
                  type="text"
                  name="redditUsername"
                  value={formData.redditUsername || ''}
                  onChange={handleInputChange}
                  placeholder="u/pseudo ou r/entrepreneur"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF4500]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <button
                  type="button"
                  onClick={testShareReddit}
                  className="ml-auto px-2.5 py-1 bg-[#FF4500] hover:bg-[#e03d00] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                >
                  <Send className="w-3 h-3" />
                  Tester Reddit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Informations sauvegardées avec succès !
              </span>
            )}
          </div>
          <Button type="submit" size="lg" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20">
            <Save className="w-4 h-4" />
            Enregistrer mes réseaux
          </Button>
        </div>
      </form>
    </div>
  );
}
