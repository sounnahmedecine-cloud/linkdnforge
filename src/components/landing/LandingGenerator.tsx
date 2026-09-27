'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ThumbsUp, 
  MessageSquare, 
  Repeat, 
  Send, 
  Globe2, 
  Film, 
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ForgeLoader from '@/components/ui/ForgeLoader';

interface LandingGeneratorProps {
  plans: any[];
}

export default function LandingGenerator({ plans }: LandingGeneratorProps) {
  const locale = useLocale();
  const t = useTranslations('onboarding');
  const tLanding = useTranslations('landing');
  
  const [activeMode, setActiveMode] = useState<'url' | 'video' | 'idea'>('url');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [tiktokPost, setTiktokPost] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [detectedClassification, setDetectedClassification] = useState<any>(null);
  const [selectedNetworkView, setSelectedNetworkView] = useState<'linkedin' | 'tiktok'>('linkedin');
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isYearly, setIsYearly] = useState(true);

  // Preset demo values
  const PRESET_URL = 'https://linkedinforge.fr';
  const PRESET_PRODUCT = 'https://dubainegoce.fr/parfum/eclair-lattafa-100ml';
  const PRESET_IDEA = "Pourquoi la plupart des créateurs sur LinkedIn abandonnent après 3 semaines (et la méthode pour durer)";

  const handleSelectPreset = (mode: 'url' | 'idea', value: string) => {
    setActiveMode(mode);
    setInputText(value);
  };

  const handleGenerate = async () => {
    // Check local storage for free trials count
    let trialCount = 0;
    const oldTrial = localStorage.getItem('linkdnforge_free_trial');
    const newTrials = localStorage.getItem('linkdnforge_free_trials_count');
    
    if (newTrials) {
      trialCount = parseInt(newTrials, 10);
    } else if (oldTrial === 'used') {
      trialCount = 1;
    }

    if (trialCount >= 5) {
      setShowPaywall(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedPost('');
    setTiktokPost('');
    setScreenshotUrl(null);
    
    try {
      const isUrl = activeMode === 'url' || inputText.startsWith('http');
      const payload: any = {
        locale,
        tone: 'expert',
        themes: ['Innovation', 'Entrepreneuriat'],
      };

      if (isUrl) {
        payload.targetUrl = inputText || PRESET_URL;
      } else {
        payload.postSubject = inputText || PRESET_IDEA;
      }

      const response = await fetch('/api/autopilot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Fallback to legacy forge-post
        const fallbackRes = await fetch('/api/forge-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: isUrl ? (inputText || PRESET_URL) : undefined,
            postSubject: !isUrl ? (inputText || PRESET_IDEA) : undefined,
            tone: 'expert',
            themes: ['Innovation', 'SaaS'],
            locale,
          })
        });
        if (!fallbackRes.ok) throw new Error('Erreur API');
        const fallbackData = await fallbackRes.json();
        setGeneratedPost(fallbackData.post);
      } else {
        const data = await response.json();
        setGeneratedPost(data.post);
        setTiktokPost(data.tiktokPost || '');
        setDetectedClassification(data.classification || null);
        setScreenshotUrl(data.screenshotUrl || null);
      }

      localStorage.setItem('linkdnforge_free_trials_count', (trialCount + 1).toString());
    } catch (error) {
      console.error(error);
      setGeneratedPost(t('result.genericError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = selectedNetworkView === 'tiktok' && tiktokPost ? tiktokPost : generatedPost;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showPaywall) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl shadow-slate-200/50 max-w-4xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-300">
        <span className="bg-orange-100 text-orange-600 text-sm font-bold px-4 py-1.5 rounded-full inline-block">
          Vos 5 générations gratuites sont prêtes
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-black">
          Passez à la vitesse supérieure avec l'offre Pro
        </h2>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
          Débloquez les posts illimités, le pilote vidéo multimodal, la capture Hero HD automatique et les scripts TikTok & Reels.
        </p>
        
        <div className="flex justify-center items-center gap-4 mt-6">
          <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-black' : 'text-slate-400'}`}>Mensuel</span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-8 w-16 items-center rounded-full bg-orange-500 transition-colors focus:outline-none shadow-inner"
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${isYearly ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-black' : 'text-slate-400'} flex items-center gap-2`}>
            Annuel <span className="text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-sm">PROMO -45%</span>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 mt-8 text-left max-w-3xl mx-auto">
          {plans.filter(p => p.desc.includes('an') === isYearly).map((plan, index) => (
             <div
               key={plan.name + index}
               className={`relative rounded-[1.5rem] p-8 border-2 transition-all duration-300 bg-white ${
                 plan.popular
                   ? 'border-orange-500 shadow-xl shadow-orange-500/10 scale-105 z-10'
                   : 'border-slate-200 hover:border-orange-300'
               }`}
             >
               {plan.popular && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                   {tLanding('pricingTeaser.popular')}
                 </div>
               )}
               <h3 className="text-2xl font-display font-bold mb-2 text-black text-center">{plan.name}</h3>
               <p className="font-mono text-4xl sm:text-5xl font-black mb-1 text-center mt-4">
                 <span className={plan.popular ? 'text-orange-500' : 'text-black'}>{plan.price}</span>
               </p>
               <p className="text-xs text-slate-500 mb-6 font-medium text-center">/mois</p>
               
               <ul className="space-y-4 mb-8">
                 {plan.features.map((f: string) => (
                   <li key={f} className="flex gap-3 text-sm text-slate-700 font-medium">
                     <span className="text-orange-500 font-black flex items-center justify-center w-5">✓</span>
                     <span>{f}</span>
                   </li>
                 ))}
               </ul>

               <Button 
                 href={`/api/stripe/checkout?plan=${plan.name.toLowerCase().includes('pro') ? 'pro' : 'starter'}&billing=${isYearly ? 'yearly' : 'monthly'}`} 
                 className={`w-full py-3 text-sm font-bold rounded-xl transition-transform hover:scale-105 ${
                   plan.popular 
                     ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25' 
                     : 'bg-black hover:bg-slate-800 text-white'
                 }`}
               >
                 {tLanding('pricingTeaser.cta')}
               </Button>
             </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left">
      {/* 1. VISUAL ARCHITECTURE SHOWCASE (The Core Loop: Video + URL + Idea -> AI -> Social Post) */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold">
            Le Moteur de Transformation
          </span>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Une vidéo. Une URL. Une idée. Votre post est forgé.
          </h3>
        </div>

        {/* 3 Source Tabs */}
        <div className="grid md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveMode('video');
              setInputText('');
            }}
            className={`p-4 rounded-2xl border text-left transition duration-200 ${
              activeMode === 'video'
                ? 'bg-slate-900 border-orange-500 shadow-lg shadow-orange-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-1">
              <Film className="w-4 h-4" /> 1. Vidéo Réelle
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              L'IA analyse l'image et la voix pour en extraire les messages clés.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('url');
              setInputText(PRESET_URL);
            }}
            className={`p-4 rounded-2xl border text-left transition duration-200 ${
              activeMode === 'url'
                ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1">
              <Globe2 className="w-4 h-4" /> 2. URL de Page Web
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              Capture la section Hero HD et extrait la proposition de valeur.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('idea');
              setInputText(PRESET_IDEA);
            }}
            className={`p-4 rounded-2xl border text-left transition duration-200 ${
              activeMode === 'idea'
                ? 'bg-slate-900 border-purple-500 shadow-lg shadow-purple-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4" /> 3. Sujet ou Idée
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              Structure votre pensée avec un hook fort et des arguments percutants.
            </p>
          </button>
        </div>

        {/* AI Multimodal Processing Bridge */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-orange-300 py-1.5 px-4 bg-orange-950/40 border border-orange-900/60 rounded-xl text-center">
          <span className="text-orange-400">✦</span>
          <span>ANALYSE MULTIMODALE & GHOSTWRITER ADAPTÉ À VOTRE VOIX</span>
          <span className="text-orange-400">✦</span>
        </div>

        {/* Live Input Field according to active mode */}
        {!generatedPost && !isGenerating && (
          <div className="space-y-3 pt-2">
            {activeMode === 'video' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                <p className="text-sm text-slate-300 font-medium">
                  🎥 Déposez une vidéo (jusqu'à 2 Go) dans votre espace pour générer votre post en mode automatique.
                </p>
                <Button href="/onboarding" size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25">
                  Tester avec ma vidéo (Gratuit)
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    activeMode === 'url'
                      ? "Collez l'URL de votre site ou produit (ex: https://mon-saas.com)..."
                      : "Entrez votre sujet ou idée (ex: Comment j'ai lancé mon projet)..."
                  }
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm sm:text-base font-medium"
                />
                <Button
                  onClick={handleGenerate}
                  size="lg"
                  className="px-7 py-4 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl whitespace-nowrap shadow-lg shadow-orange-500/30 transition-transform hover:scale-[1.02]"
                >
                  Forger mon post
                </Button>
              </div>
            )}

            {/* Quick Demo Click Presets */}
            {activeMode !== 'video' && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
                <span className="font-semibold text-slate-500">Exemples rapides :</span>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('url', PRESET_URL)}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                >
                  🌐 URL SaaS
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('url', PRESET_PRODUCT)}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300 hover:text-white hover:border-amber-500/50 transition font-semibold"
                >
                  🛍️ Produit : Dubaï Négoce (Parfum)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('idea', PRESET_IDEA)}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                >
                  💡 Idée : Création de contenu
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. GENERATION LOADER & RESULT DISPLAY */}
      {(isGenerating || generatedPost) && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-200 animate-in zoom-in-95 fade-in duration-300 space-y-6">
          {isGenerating ? (
            <div className="py-12 space-y-8 text-center">
              <ForgeLoader label="Compréhension du contenu & Rédaction Ghostwriter..." />
              <div className="max-w-xl mx-auto space-y-3 pt-4">
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-full" />
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-5/6 mx-auto" />
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-4/6 mx-auto" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Classification Notification */}
              {detectedClassification && (
                <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">✨</span>
                    <div>
                      <span className="font-bold text-slate-900">
                        Classification IA : {detectedClassification.detectedLabel}
                      </span>
                      <p className="text-slate-600 mt-0.5">
                        {detectedClassification.detectedReason}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto">
                    Architecture 2-Étapes
                  </span>
                </div>
              )}

              {/* Top Bar with Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNetworkView('linkedin')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedNetworkView === 'linkedin'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    💼 Format LinkedIn & FB
                  </button>
                  {tiktokPost && (
                    <button
                      type="button"
                      onClick={() => setSelectedNetworkView('tiktok')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedNetworkView === 'tiktok'
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      🎵 Format TikTok & Reels
                    </button>
                  )}
                </div>

                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>✓</span> Source-Check IA Validé
                </span>
              </div>

              {/* Mockup Card */}
              {selectedNetworkView === 'tiktok' && tiktokPost ? (
                /* TikTok Mockup */
                <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold flex items-center gap-1.5 text-white">
                      <span>🎵</span> Script court TikTok & Reels
                    </span>
                    <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded">0-30s</span>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium border border-slate-800">
                    {tiktokPost}
                  </div>
                </div>
              ) : (
                /* LinkedIn Mockup */
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden font-sans shadow-sm my-4">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-11 h-11 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                      <svg className="w-6 h-6 text-slate-400 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">Vous</h4>
                      <p className="text-slate-500 text-xs">Créateur & Fondateur</p>
                      <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <span>À l'instant</span> • <Globe2 className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Generated Post Text */}
                  <div className="px-4 pb-3 text-[14px] text-slate-900 leading-relaxed whitespace-pre-wrap">
                    {generatedPost}
                  </div>

                  {/* Hero Screenshot Preview if Available */}
                  {screenshotUrl && (
                    <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video max-h-64 relative group">
                      <img
                        src={screenshotUrl}
                        alt="Capture Hero du site web"
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                        📸 Capture Hero du site
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Metrics */}
                  <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="bg-blue-600 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center text-[10px]">👍</span>
                      <span className="bg-rose-500 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center text-[10px] -ml-1">❤️</span>
                      <span className="ml-1 font-medium">Vous et 48 personnes</span>
                    </div>
                    <span>14 commentaires</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition border-2 ${
                    copied
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié dans le presse-papier !' : 'Copier le texte'}
                </button>
                <Button
                  href="/onboarding"
                  size="lg"
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25"
                >
                  <span>🚀</span> Continuer dans l'Atelier
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
