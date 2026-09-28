'use client';

import { useState, useRef, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Copy, 
  Check, 
  Globe2, 
  Film, 
  Sparkles,
  ArrowRight,
  UploadCloud,
  X,
  Loader2,
  ShoppingBag,
  FileText,
  ChevronDown,
  ChevronUp
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
  
  const [inputText, setInputText] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStepLabel, setGeneratingStepLabel] = useState<string>('');
  
  const [generatedPost, setGeneratedPost] = useState('');
  const [tiktokPost, setTiktokPost] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [detectedClassification, setDetectedClassification] = useState<any>(null);
  const [selectedNetworkView, setSelectedNetworkView] = useState<'linkedin' | 'tiktok'>('linkedin');
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isYearly, setIsYearly] = useState(true);
  const [editorialStyle, setEditorialStyle] = useState('auto');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Intelligent Real-time Detection
  const detection = useMemo(() => {
    if (videoFile) {
      return {
        type: 'video' as const,
        icon: '🎥',
        badge: 'Vidéo détectée',
        subtext: `${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(1)} Mo) — Analyse audio & visuelle prête`,
        highlightColor: 'border-orange-500/50 bg-orange-950/30 text-orange-400',
      };
    }

    const trimmed = inputText.trim();
    if (!trimmed) return null;

    const isUrl = /^https?:\/\//i.test(trimmed) || /^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed);

    if (isUrl) {
      const lower = trimmed.toLowerCase();
      if (
        lower.includes('/product') ||
        lower.includes('/produit') ||
        lower.includes('/parfum') ||
        lower.includes('/item') ||
        lower.includes('/shop') ||
        lower.includes('dubainegoce')
      ) {
        return {
          type: 'url_product' as const,
          icon: '🛍️',
          badge: 'Page Produit détectée',
          subtext: 'Extraction des notes, proposition de valeur & visuel Hero HD',
          highlightColor: 'border-amber-500/50 bg-amber-950/30 text-amber-400',
        };
      }
      if (lower.includes('/blog') || lower.includes('/article') || lower.includes('/news') || lower.includes('/post')) {
        return {
          type: 'url_article' as const,
          icon: '📰',
          badge: 'Article de fond détecté',
          subtext: 'Synthèse des thèses clés, arguments & point de vue éditorial',
          highlightColor: 'border-blue-500/50 bg-blue-950/30 text-blue-400',
        };
      }
      return {
        type: 'url_generic' as const,
        icon: '🔗',
        badge: 'Page Web détectée',
        subtext: 'Scraping automatique de l’offre & visuel principal',
        highlightColor: 'border-blue-500/50 bg-blue-950/30 text-blue-400',
      };
    }

    return {
      type: 'idea' as const,
      icon: '✍️',
      badge: 'Sujet ou Idée détecté',
      subtext: 'Votre Ghostwriter structure l’accroche, le corps et le CTA',
      highlightColor: 'border-purple-500/50 bg-purple-950/30 text-purple-400',
    };
  }, [videoFile, inputText]);

  // Handle Drag & Drop of Video File
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      }
    }
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
    setDetectedClassification(null);

    try {
      let uploadedVideoUrl = '';

      // 1. If video file attached, upload first
      if (videoFile) {
        setGeneratingStepLabel('Envoi et analyse audio/vision de la vidéo...');
        const formData = new FormData();
        formData.append('file', videoFile);

        const uploadRes = await fetch('/api/autopilot/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Erreur lors du traitement de la vidéo.');
        }

        const uploadData = await uploadRes.json();
        uploadedVideoUrl = uploadData.googleFileUri || uploadData.fileUrl || '';
      }

      setGeneratingStepLabel('Compréhension du contenu & Rédaction Ghostwriter...');

      const trimmed = inputText.trim();
      const isUrl = /^https?:\/\//i.test(trimmed) || /^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(trimmed);

      const payload: any = {
        locale,
        editorialStyle: editorialStyle || 'auto',
        tone: 'expert',
        videoUrl: uploadedVideoUrl || undefined,
        videoMeta: videoFile ? { name: videoFile.name, size: videoFile.size } : undefined,
        targetUrl: isUrl ? (trimmed.startsWith('http') ? trimmed : `https://${trimmed}`) : undefined,
        postSubject: !isUrl && trimmed ? trimmed : undefined,
      };

      const response = await fetch('/api/autopilot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération.');
      }

      const data = await response.json();
      setGeneratedPost(data.post);
      setTiktokPost(data.tiktokPost || '');
      setDetectedClassification(data.classification || null);
      setScreenshotUrl(data.screenshotUrl || null);

      localStorage.setItem('linkdnforge_free_trials_count', (trialCount + 1).toString());
    } catch (error: any) {
      console.error(error);
      setGeneratedPost(error.message || t('result.genericError'));
    } finally {
      setIsGenerating(false);
      setGeneratingStepLabel('');
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

  const hasInput = !!videoFile || inputText.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left">
      {/* 1. UNIVERSAL TRANSFORMATION ENGINE (Clean, focused, intelligent) */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Clean Header */}
        <div className="text-center space-y-2 relative z-10">
          <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
            Le Moteur de Transformation
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight">
            Une vidéo. Une URL. Une idée. Votre contenu est forgé.
          </h2>
        </div>

        {/* Hidden File Input for Video */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* The Single Universal Smart Input Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 transition-all duration-200 bg-slate-900/90 p-4 sm:p-5 ${
            isDraggingVideo
              ? 'border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-500/20'
              : 'border-slate-700/80 hover:border-slate-600 focus-within:border-orange-500'
          }`}
        >
          {/* If Video Attached */}
          {videoFile ? (
            <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 mb-3 animate-in fade-in">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{videoFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} Mo · Vidéo prête pour analyse
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVideoFile(null)}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Supprimer la vidéo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Universal Textarea / Input */}
          <textarea
            ref={textareaRef}
            rows={videoFile ? 2 : 3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              videoFile
                ? "Ajoutez une URL de produit ou une consigne optionnelle..."
                : "Collez une URL, déposez une vidéo ou écrivez votre idée..."
            }
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base sm:text-lg resize-none leading-relaxed"
          />

          {/* Bottom Bar inside the Input Container */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {/* Visual Repères (Not forced radio choices, just visual anchors & quick helpers) */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 select-none">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 hover:text-orange-400 transition"
                title="Choisir un fichier vidéo"
              >
                <span>🎥</span>
                <span>Vidéo</span>
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => {
                  if (!inputText) setInputText('https://dubainegoce.fr/parfum/eclair-lattafa-100ml');
                  textareaRef.current?.focus();
                }}
                className="flex items-center gap-1.5 hover:text-blue-400 transition"
                title="Exemple de lien"
              >
                <span>🔗</span>
                <span>URL</span>
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={() => {
                  if (!inputText) setInputText("Pourquoi la plupart des créateurs sur LinkedIn abandonnent après 3 semaines...");
                  textareaRef.current?.focus();
                }}
                className="flex items-center gap-1.5 hover:text-amber-400 transition"
                title="Exemple d'idée"
              >
                <span>✍️</span>
                <span>Idée</span>
              </button>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !hasInput}
              size="lg"
              className="py-3 px-6 text-sm sm:text-base font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Forge en cours...</span>
                </>
              ) : (
                <>
                  <span>Forger mon contenu</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Options Accordion (Style Rédactionnel) */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 sm:px-5 py-3 bg-slate-900/80 hover:bg-slate-800/80 text-left text-xs font-bold text-slate-300 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Options avancées (Style rédactionnel)
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-orange-400 font-medium">
                {showAdvanced
                  ? 'Masquer'
                  : `Style : ${
                      editorialStyle === 'auto'
                        ? '✨ Automatique (Recommandé)'
                        : editorialStyle === 'app'
                        ? '🚀 Application'
                        : editorialStyle === 'product'
                        ? '🛍️ Produit'
                        : editorialStyle === 'editorial'
                        ? '📰 Éditorial'
                        : editorialStyle === 'expert'
                        ? '💼 Expertise'
                        : editorialStyle === 'announcement'
                        ? '📢 Annonce'
                        : '🎓 Éducatif'
                    }`}
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showAdvanced && (
            <div className="p-4 bg-slate-900 space-y-3 border-t border-slate-800 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Style Rédactionnel
                </label>
                <select
                  value={editorialStyle}
                  onChange={(e) => setEditorialStyle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="auto">✨ Automatique (Recommandé - Détecte fidèlement le sujet réel)</option>
                  <option value="app">🚀 Application / Expérience web (Jeu, SaaS, Outil en ligne)</option>
                  <option value="product">🛍️ Produit / E-commerce (Vente & Bénéfices réels)</option>
                  <option value="editorial">📰 Éditorial / Analyse de fond</option>
                  <option value="expert">💼 Expertise & Thèse de fond</option>
                  <option value="announcement">📢 Annonce / Lancement officiel</option>
                  <option value="educational">🎓 Éducatif / Guide & Méthode</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Par défaut, l'IA analyse fidèlement la matière brute et adapte le format éditorial le plus percutant.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Real-time Detection Banner (The Interface Transforms Upon Detection) */}
        {detection && (
          <div
            className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200 ${detection.highlightColor}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">{detection.icon}</span>
              <div>
                <span className="font-bold text-sm text-white block">
                  {detection.badge}
                </span>
                <span className="text-slate-300 text-xs">
                  {detection.subtext}
                </span>
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/10 shrink-0 self-start sm:self-auto">
              ✓ Reconnaissance IA
            </span>
          </div>
        )}
      </div>

      {/* 2. GENERATION LOADER & RESULT DISPLAY */}
      {(isGenerating || generatedPost) && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-200 animate-in zoom-in-95 fade-in duration-300 space-y-6">
          {isGenerating ? (
            <div className="py-12 space-y-8 text-center">
              <ForgeLoader label={generatingStepLabel || "Compréhension du contenu & Rédaction Ghostwriter..."} />
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
                  href="/dashboard"
                  size="lg"
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25"
                >
                  <span>🚀</span> Ouvrir dans le Studio
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
