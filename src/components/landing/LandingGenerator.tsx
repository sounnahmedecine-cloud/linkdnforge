'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Copy, Check, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ForgeLoader from '@/components/ui/ForgeLoader';
import {
  THEME_SLUGS,
  TONE_VALUES,
  VISUAL_TYPE_VALUES,
} from '@/lib/onboardingOptions';

interface LandingGeneratorProps {
  plans: any[];
}

export default function LandingGenerator({ plans }: LandingGeneratorProps) {
  const locale = useLocale();
  const t = useTranslations('onboarding');
  const tLanding = useTranslations('landing');
  
  const [url, setUrl] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [formData, setFormData] = useState({
    targetUrl: '',
    tone: '',
    themes: [] as string[],
    visualType: '',
    postObjective: '',
    postType: '',
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, targetUrl: url }));
  }, [url]);

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const current = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      };
    });
  };

  const handleSingleSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    // Check local storage for free trial
    const hasUsedTrial = localStorage.getItem('linkdnforge_free_trial');
    if (hasUsedTrial) {
      setShowPaywall(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedPost('');
    
    try {
      let targetUrlContent = undefined;
      if (formData.targetUrl) {
        try {
          const scrapeRes = await fetch('/api/scrape-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: formData.targetUrl })
          });
          if (scrapeRes.ok) {
            const data = await scrapeRes.json();
            targetUrlContent = data.data;
          }
        } catch (e) {
          console.error('Erreur scraping URL:', e);
        }
      }

      const response = await fetch('/api/forge-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, locale, targetUrlContent })
      });

      if (!response.ok) throw new Error('Erreur API');
      const data = await response.json();
      
      setGeneratedPost(data.post);
      localStorage.setItem('linkdnforge_free_trial', 'used');
    } catch (error) {
      console.error(error);
      setGeneratedPost(t('result.genericError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showPaywall) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl shadow-slate-200/50 max-w-4xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-black">
          Vous avez épuisé votre essai gratuit !
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Pour continuer à générer des posts viraux avec toutes les options avancées (Ton, Style, Visuels...), passez à la vitesse supérieure.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-6 mt-8 text-left">
          {plans.map((plan, index) => (
             <div
               key={plan.name + index}
               className={`relative rounded-[1.5rem] p-6 border-2 transition-all duration-300 bg-white ${
                 plan.popular
                   ? 'border-orange-500 shadow-xl shadow-orange-500/10'
                   : 'border-slate-200 hover:border-orange-300'
               }`}
             >
               {plan.popular && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                   {tLanding('pricingTeaser.popular')}
                 </div>
               )}
               <h3 className="text-xl font-display font-bold mb-1 text-black">{plan.name}</h3>
               <p className="font-mono text-3xl font-black mb-1">
                 <span className={plan.popular ? 'text-orange-500' : 'text-black'}>{plan.price}</span>
               </p>
               <p className="text-xs text-slate-500 mb-6 font-medium">/mois</p>
               <Button 
                 href={`/api/stripe/checkout?plan=${plan.name.toLowerCase()}&billing=${plan.desc.includes('an') || plan.desc.includes('year') ? 'yearly' : 'monthly'}`} 
                 className={`w-full py-3 text-sm font-bold rounded-xl transition-transform hover:scale-105 ${
                   plan.popular 
                     ? 'bg-orange-500 hover:bg-orange-600 text-white' 
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
    <div className="w-full max-w-4xl mx-auto mt-12 space-y-6">
      {!generatedPost && !isGenerating && (
        <div className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Collez l'URL de votre site ou article ici..."
            className="flex-1 w-full bg-slate-50 border-none rounded-xl px-6 py-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-medium"
          />
          <Button onClick={handleGenerate} size="lg" className="w-full sm:w-auto px-8 py-5 text-lg font-bold bg-orange-500 hover:bg-orange-600 rounded-xl whitespace-nowrap shadow-lg shadow-orange-500/30">
            Essayer gratuitement
          </Button>
        </div>
      )}

      {!generatedPost && !isGenerating && (
        <div className="text-center">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
          >
            Affiner votre post (Options)
            {showOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {!generatedPost && !isGenerating && showOptions && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 animate-in slide-in-from-top-4 fade-in duration-200 text-left space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">{t('step2.themesTitle')}</h3>
            <div className="flex flex-wrap gap-2">
              {THEME_SLUGS.map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleMultiSelect('themes', theme)}
                  className={`px-4 py-2 rounded-lg border transition font-medium text-sm ${
                    formData.themes.includes(theme)
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t(`step2.themes.${theme}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">{t('step2.toneTitle')}</h3>
            <div className="flex flex-wrap gap-2">
              {TONE_VALUES.map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleSingleSelect('tone', tone)}
                  className={`px-4 py-2 rounded-lg border transition font-medium text-sm ${
                    formData.tone === tone
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t(`step2.tones.${tone}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">{t('step3.visualTypeTitle')}</h3>
            <div className="flex flex-wrap gap-2">
              {VISUAL_TYPE_VALUES.map((visual) => (
                <button
                  key={visual}
                  onClick={() => handleSingleSelect('visualType', visual)}
                  className={`px-4 py-2 rounded-lg border transition font-medium text-sm ${
                    formData.visualType === visual
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {t(`step3.visualTypes.${visual}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(isGenerating || generatedPost) && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 text-left animate-in zoom-in-95 fade-in duration-300">
          {isGenerating ? (
            <div className="py-12 space-y-8">
              <ForgeLoader label={t('result.generatingLabel')} />
              <div className="max-w-2xl mx-auto space-y-3 pt-4">
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-full" />
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-5/6" />
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-4/6" />
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-full mt-6" />
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-3/4" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-display font-bold text-2xl text-black">Votre post LinkedIn</h2>
                <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Généré avec succès</span>
              </div>
              <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                {generatedPost}
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <button
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition border-2 ${
                    copied
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? t('result.copiedBtn') : t('result.copyBtn')}
                </button>
                <button
                  onClick={() => setShowPaywall(true)}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm bg-black text-white hover:bg-slate-800 transition shadow-lg shadow-black/10"
                >
                  <RefreshCw className="w-5 h-5" />
                  Générer des visuels / Régénérer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
