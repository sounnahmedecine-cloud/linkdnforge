'use client';

import { useState } from 'react';
import { Globe2, Sparkles, ChevronDown, ChevronUp, ArrowLeft, Loader2, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UrlForgeProps {
  onBack: () => void;
  onGenerate: (data: {
    targetUrl: string;
    postSubject?: string;
    editorialStyle?: string;
    tone?: string;
    postObjective?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  defaultTone?: string;
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

  // Quick detection helper based on common URL patterns (informative UI hints)
  const getUrlHint = (url: string) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('/product') || lower.includes('/produit') || lower.includes('/parfum') || lower.includes('/item') || lower.includes('/shop')) {
      return {
        label: '🛍️ Détection : Fiche Produit / E-commerce',
        desc: 'L\'IA va extraire les notes, bénéfices et offre commerciale pour rédiger un post axé désir & découverte.',
      };
    }
    if (lower.includes('/blog') || lower.includes('/article') || lower.includes('/news') || lower.includes('/post/')) {
      return {
        label: '📰 Détection : Article de fond / Éditorial',
        desc: 'L\'IA va synthétiser les thèses clés et arguments pour un post d\'expertise ou de débat.',
      };
    }
    return {
      label: '✨ Détection Intelligente Active',
      desc: 'L\'IA lit la page complète (balises OpenGraph, hero, offre) et applique la classification idéale.',
    };
  };

  const hint = getUrlHint(targetUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;
    onGenerate({
      targetUrl: targetUrl.trim(),
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
          Collez simplement l'adresse de votre page (boutique en ligne, SaaS, article de blog). LinkedInForge analyse le contenu, récupère le visuel HD et rédige le post parfait.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main URL Input */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Adresse URL de la page ou du produit
          </label>
          <div className="relative">
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://dubainegoce.fr/parfum/eclair-lattafa... ou https://monsite.com"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-4 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white text-base shadow-xs"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          {hint && (
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
            placeholder="Ex: Mettre l'accent sur les notes de tête et proposer un code promo, ou insister sur le gain de productivité..."
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
              <span>{showAdvanced ? 'Masquer' : 'Style : ✨ Automatique'}</span>
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
                  <option value="auto">✨ Automatique (Recommandé - Détecte Produit / Article / SaaS)</option>
                  <option value="product">🛍️ Produit / E-commerce (Vente & Notes sensorielles)</option>
                  <option value="editorial">📰 Éditorial / Analyse de fond</option>
                  <option value="expert">💼 Expertise & Thèse de fond</option>
                  <option value="announcement">📢 Annonce / Lancement officiel</option>
                  <option value="educational">🎓 Éducatif / How-to</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Objectif de la publication
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'leads', label: '🛍️ Ventes & Conversion' },
                    { id: 'traffic', label: '🚀 Clics vers le site' },
                    { id: 'authority', label: '💡 Crédibilité & Expertise' },
                    { id: 'engagement', label: '💬 Débat & Commentaires' },
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
          disabled={!targetUrl.trim() || isGenerating}
          size="lg"
          className="w-full py-4 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.01]"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Scraping de la page & Rédaction du post...
            </span>
          ) : (
            '🚀 Analyser l’URL & Forger le Contenu'
          )}
        </Button>
      </form>
    </div>
  );
}
