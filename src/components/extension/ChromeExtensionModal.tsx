'use client';

import { useState } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChromeExtensionModal({ isOpen, onClose }: ChromeExtensionModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'install'>('overview');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const handleCopyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 text-white overflow-hidden">
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-orange-500/30 text-orange-300 px-3 py-1 rounded-full border border-orange-400/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-400" /> Extension Chrome Gratuite
            </span>
            <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 100% Conforme LinkedIn
            </span>
          </div>

          <div className="flex items-start gap-4 mt-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0 border-2 border-orange-400">
              <span className="text-2xl sm:text-3xl">⚡</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                LinkedInForge Capture
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Transformez n'importe quel article, vidéo ou extrait web en post LinkedIn percutant en 1 clic.
              </p>
            </div>
          </div>

          {/* Navigation Tabs inside Modal */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/10 pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ✨ Fonctionnalités
            </button>
            <button
              onClick={() => setActiveTab('install')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'install'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📥 Guide d'installation (30 sec)
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {activeTab === 'overview' ? (
            <>
              {/* 3 Core Value Props */}
              <div className="grid sm:grid-cols-3 gap-3.5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base">
                    🖱️
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Clic-Droit Magique</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Surlignez une citation ou idée sur le web → Clic droit → Votre post LinkedIn est forgé automatiquement.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-base">
                    ⚡
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Popup & 3 Hooks</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Générez un brouillon et testez 3 accroches instantanées sans quitter votre page de navigation.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-base">
                    🚀
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Passerelle Atelier</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Envoyez vos captures directement dans votre studio LinkedInForge pour les perfectionner.
                  </p>
                </div>
              </div>

              {/* Demo Preview Card */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Comment l'utiliser au quotidien :
                  </span>
                  <span className="text-[10px] bg-orange-200/60 text-orange-900 font-bold px-2 py-0.5 rounded-md">
                    Ultra fluide
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600">1.</span>
                    <span>Vous naviguez sur un article, une newsletter ou YouTube.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600">2.</span>
                    <span>Vous cliquez sur l'icône ⚡ de l'extension ou surlignez une phrase inspirante.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-orange-600">3.</span>
                    <span>L'IA rédige un post percutant dans votre ton. Vous copiez et publiez !</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Install Guide Tab */
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    Téléchargez le fichier ZIP de l'extension
                  </h4>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Téléchargez l'archive puis décompressez-la dans un dossier de votre choix (ex: Téléchargements).
                </p>
                <div className="pl-8">
                  <a
                    href="/extension/linkedinforge-capture.zip"
                    download="linkedinforge-capture.zip"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-400" />
                    Télécharger linkedinforge-capture.zip
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    Ouvrez les extensions dans Google Chrome
                  </h4>
                </div>
                <p className="text-xs text-slate-600 pl-8">
                  Collez cette adresse dans la barre d'adresse de Chrome :
                </p>
                <div className="pl-8 flex items-center gap-2">
                  <code className="bg-white border border-slate-300 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-mono font-bold">
                    chrome://extensions
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyChromeUrl}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {copiedUrl ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    Activez le Mode Développeur & Chargez le dossier
                  </h4>
                </div>
                <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                  En haut à droite de la page des extensions, activez le bouton à bascule <strong>« Mode développeur »</strong>, puis cliquez sur <strong>« Charger l'extension non empaquetée »</strong> et sélectionnez le dossier décompressé. C'est tout !
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-slate-900">
              Prêt à accélérer votre création de contenu ?
            </p>
            <p className="text-[11px] text-slate-500">
              Compatible avec Google Chrome, Brave, Arc, Edge et Opera.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {activeTab === 'overview' ? (
              <>
                <button
                  onClick={() => setActiveTab('install')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold transition"
                >
                  Comment l'installer
                </button>
                <a
                  href="/extension/linkedinforge-capture.zip"
                  download="linkedinforge-capture.zip"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger (.ZIP)</span>
                </a>
              </>
            ) : (
              <a
                href="/extension/linkedinforge-capture.zip"
                download="linkedinforge-capture.zip"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger l'extension (.ZIP)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
