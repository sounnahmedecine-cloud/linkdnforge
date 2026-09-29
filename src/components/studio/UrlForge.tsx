'use client';

import { useState } from 'react';
import { Globe2, Sparkles, ChevronDown, ChevronUp, ArrowLeft, Loader2, Search, CheckCircle2, Gamepad2, ShoppingBag, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UrlForgeProps {
  onBack: () => void;
  onGenerate: (data: {
    targetUrl: string;
    targetUrlContent?: string;
    postSubject?: string;
    editorialStyle?: string;
    tone?: string;
    postObjective?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  defaultTone?: string;
}

interface ScrapedPreview {
  title: string;
  description: string;
  content: string;
  ogImage: string | null;
  screenshotUrl: string | null;
  detectedCategory: string;
  source?: string;
}

export default function UrlForge({
  onBack,
  onGenerate,
  isGenerating,
  defaultTone = 'expert',
}: UrlForgeProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [postSubject, setPostSubject] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editorialStyle, setEditorialStyle] = useState('auto');
  const [postObjective, setPostObjective] = useState('leads');
  const [tone, setTone] = useState(defaultTone);

  // Live URL inspection state
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedPreview, setScrapedPreview] = useState<ScrapedPreview | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // Quick detection helper based on common URL patterns (informative UI hints)
  const getUrlHint = (url: string) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('/product') || lower.includes('/produit') || lower.includes('/item') || lower.includes('/shop') || lower.includes('/boutique')) {
      return {
        label: '🛍️ Détection : Fiche Produit / E-commerce',
        desc: 'L\'IA extrait les caractéristiques, bénéfices et offre commerciale pour un post orienté désir & découverte.',
      };
    }
    if (lower.includes('/blog') || lower.includes('/article') || lower.includes('/news') || lower.includes('/post/')) {
      return {
        label: '📰 Détection : Article de fond / Éditorial',
        desc: 'L\'IA va synthétiser les thèses clés et arguments pour un post d\'expertise ou de débat.',
      };
    }
    return {
      label: '✨ Analyse Universelle Intelligente',
      desc: 'L\'IA extrait le contenu réel de la page (titres, présentation, offre) et s’adapte rigoureusement à votre univers.',
    };
  };

  const hint = getUrlHint(targetUrl);

  const normalizeUrl = (rawUrl: string): string => {
    let trimmed = rawUrl.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleAnalyzeUrl = async (overrideUrl?: string) => {
    const raw = overrideUrl || targetUrl;
    const urlToTest = normalizeUrl(raw);
    if (!urlToTest) return;

    if (urlToTest !== targetUrl) {
      setTargetUrl(urlToTest);
    }

    setIsScraping(true);
    setScrapeError(null);

    try {
      const res = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la lecture de la page.');
      }

      const data = await res.json();
      if (data.data) {
        setScrapedPreview({
          title: data.title || '',
          description: data.description || '',
          content: data.data || '',
          ogImage: data.ogImage || null,
          screenshotUrl: data.screenshotUrl || null,
          detectedCategory: data.detectedCategory || 'general',
          source: data.source,
        });
      } else {
        setScrapeError(data.warning || 'Impossible de lire le contenu de la page.');
      }
    } catch (err: any) {
      setScrapeError(err.message || 'Impossible d’accéder à l’URL.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = normalizeUrl(targetUrl);
    if (!cleanUrl) return;

    if (cleanUrl !== targetUrl) {
      setTargetUrl(cleanUrl);
    }

    let contentToSend = scrapedPreview?.content;

    // If not scraped yet, perform quick scrape first to ensure rich context
    if (!contentToSend) {
      try {
        setIsScraping(true);
        const res = await fetch('/api/scrape-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            contentToSend = data.data;
          }
        }
      } catch {
        // Fallback to server scraping
      } finally {
        setIsScraping(false);
      }
    }

    await onGenerate({
      targetUrl: cleanUrl,
      targetUrlContent: contentToSend,
      postSubject: postSubject.trim() || undefined,
      editorialStyle,
      tone,
      postObjective,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Studio
        </button>
        <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <Globe2 className="w-3.5 h-3.5" />
          Mode URL & Produit
        </span>
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1.5 flex items-center gap-2">
          <span>🔗</span> Transformez une page web ou un produit
        </h2>
        <p className="text-sm text-slate-500">
          Collez simplement l'adresse de votre page (boutique en ligne, jeu, SaaS, article de blog). LinkedInForge analyse le contenu, récupère le visuel HD et rédige le post parfait.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main URL Input with Action Button */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Adresse URL de la page ou du produit
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="url"
                required
                value={targetUrl}
                onChange={(e) => {
                  setTargetUrl(e.target.value);
                  setScrapedPreview(null);
                  setScrapeError(null);
                }}
                onBlur={() => {
                  const normalized = normalizeUrl(targetUrl);
                  if (normalized && normalized !== targetUrl) {
                    setTargetUrl(normalized);
                  }
                  if (normalized && !scrapedPreview && !isScraping) {
                    handleAnalyzeUrl(normalized);
                  }
                }}
                placeholder="ex: linkedinforge.fr, monsite.com/produit ou https://..."
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-3.5 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white text-base shadow-xs"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={!targetUrl.trim() || isScraping}
              onClick={() => handleAnalyzeUrl()}
              className="px-4 py-3.5 rounded-2xl border-slate-300 text-slate-700 font-bold hover:bg-slate-50 shrink-0 flex items-center gap-1.5"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-xs">Lecture...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                  <span className="text-xs">Analyser</span>
                </>
              )}
            </Button>
          </div>

          {/* Scrape Error Message */}
          {scrapeError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{scrapeError} Vous pouvez quand même forger ou préciser l'angle ci-dessous.</span>
            </div>
          )}

          {/* Rich Preview Card once Scraped */}
          {scrapedPreview && (
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Contenu extrait avec succès
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                  {scrapedPreview.detectedCategory === 'gaming' && '🎮 Jeu / RPG'}
                  {scrapedPreview.detectedCategory === 'ecommerce' && '🛍️ E-commerce'}
                  {scrapedPreview.detectedCategory === 'education' && '🎓 Éducation'}
                  {scrapedPreview.detectedCategory === 'saas' && '💻 SaaS'}
                  {scrapedPreview.detectedCategory === 'general' && '🌐 Page Web'}
                </span>
              </div>

              <div className="flex gap-3 items-start">
                {scrapedPreview.ogImage && (
                  <img
                    src={scrapedPreview.ogImage}
                    alt="Aperçu"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {scrapedPreview.title || 'Page analysée'}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {scrapedPreview.description || scrapedPreview.content.slice(0, 150) + '...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Helpful Hint if no preview yet */}
          {!scrapedPreview && hint && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-blue-900 block font-bold">{hint.label}</strong>
                <p className="text-xs text-blue-700 leading-relaxed mt-0.5">{hint.desc}</p>
              </div>
            </div>
          )}
        </div>

        {/* Optional Specific Angle */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Angle ou consigne spécifique (Optionnel)
          </label>
          <textarea
            value={postSubject}
            onChange={(e) => setPostSubject(e.target.value)}
            rows={2}
            placeholder="Ex: Mettre l'accent sur les nouveautés, une offre spéciale ou les points forts..."
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Advanced Accordion */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/70 text-left text-xs font-bold text-slate-700 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Options avancées (Style forcé & Objectif)
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              <span>{showAdvanced ? 'Masquer' : `Style : ${editorialStyle === 'auto' ? '✨ Automatique (Recommandé)' : editorialStyle === 'app' ? '🚀 Application' : editorialStyle === 'product' ? '🛍️ Produit' : editorialStyle}`}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showAdvanced && (
            <div className="p-5 bg-white space-y-4 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Forcer un Style Rédactionnel
                </label>
                <select
                  value={editorialStyle}
                  onChange={(e) => setEditorialStyle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="auto">✨ Automatique (Recommandé - Détecte fidèlement le sujet réel)</option>
                  <option value="app">🚀 Application / Expérience web (Jeu, SaaS, Outil en ligne)</option>
                  <option value="product">🛍️ Produit / E-commerce (Vente & Bénéfices réels)</option>
                  <option value="editorial">📰 Éditorial / Analyse de fond</option>
                  <option value="expert">💼 Expertise & Thèse de fond</option>
                  <option value="announcement">📢 Annonce / Lancement officiel</option>
                  <option value="educational">🎓 Éducatif / Guide & Méthode</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Objectif de la publication
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'leads', label: '🛍️ Découverte & Clics' },
                    { id: 'traffic', label: '🚀 Clics vers le site' },
                    { id: 'authority', label: '💡 Crédibilité & Impact' },
                    { id: 'engagement', label: '💬 Débat & Partage' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setPostObjective(o.id)}
                      className={`p-2 rounded-lg border text-left font-medium transition ${
                        postObjective === o.id
                          ? 'bg-blue-50 border-blue-500 text-blue-800 font-bold'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          type="submit"
          disabled={!targetUrl.trim() || isGenerating || isScraping}
          size="lg"
          className="w-full py-4 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.01]"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Rédaction du post avec l'IA...
            </span>
          ) : isScraping ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyse du contenu en cours...
            </span>
          ) : (
            '🚀 Analyser l’URL & Forger le Contenu'
          )}
        </Button>
      </form>
    </div>
  );
}
