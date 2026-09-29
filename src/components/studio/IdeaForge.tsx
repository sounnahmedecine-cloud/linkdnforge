'use client';

import { useState } from 'react';
import { Sparkles, ArrowLeft, Loader2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface IdeaForgeProps {
  onBack: () => void;
  onGenerate: (data: {
    postSubject: string;
    editorialStyle?: string;
    tone?: string;
    postObjective?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  defaultTone?: string;
}

const IDEA_CHIPS = [
  'Une leçon apprise après une erreur',
  'Mon avis à contre-courant sur mon secteur',
  'Comment nous avons résolu le problème de notre client',
  '3 outils que j’utilise au quotidien pour gagner du temps',
  'Retour sur les chiffres du mois et ce qui a fonctionné',
];

export default function IdeaForge({
  onBack,
  onGenerate,
  isGenerating,
  defaultTone = 'expert',
}: IdeaForgeProps) {
  const [postSubject, setPostSubject] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editorialStyle, setEditorialStyle] = useState('auto');
  const [postObjective, setPostObjective] = useState('authority');
  const [tone, setTone] = useState(defaultTone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postSubject.trim()) return;
    onGenerate({
      postSubject: postSubject.trim(),
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
        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Mode Idée
        </span>
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1.5 flex items-center gap-2">
          <span>✍️</span> De quoi voulez-vous parler ?
        </h2>
        <p className="text-sm text-slate-500">
          Écrivez votre idée, une anecdote ou quelques mots clés. L'IA se charge de la structuration, du hook accrocheur et de la mise en valeur.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Votre sujet, idée ou anecdote
          </label>
          <textarea
            required
            rows={5}
            value={postSubject}
            onChange={(e) => setPostSubject(e.target.value)}
            placeholder="Ex: J'ai remarqué que 90% des freelances sous-estiment leur valeur. La semaine dernière, un client a accepté mon devis sans négocier parce que j'ai changé ma manière de présenter les bénéfices..."
            className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white text-base shadow-xs resize-none"
          />

          {/* Quick Idea Starters */}
          <div className="pt-2">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Angles inspirants en 1 clic :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {IDEA_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPostSubject(chip + ' : ')}
                  className="text-[11px] bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Accordion */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/70 text-left text-xs font-bold text-slate-700 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Options avancées (Ton de la voix & Style)
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              <span>{showAdvanced ? 'Masquer' : `Style : ${editorialStyle === 'auto' ? '✨ Automatique (Recommandé)' : editorialStyle} • Ton : ${tone}`}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showAdvanced && (
            <div className="p-5 bg-white space-y-4 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Style Rédactionnel
                </label>
                <select
                  value={editorialStyle}
                  onChange={(e) => setEditorialStyle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="auto">✨ Automatique (Recommandé - Détecté par l'IA)</option>
                  <option value="expert">💼 Expertise & Opinion tranchée</option>
                  <option value="story">📖 Storytelling & Coulisses</option>
                  <option value="educational">🎓 Tutoriel & Conseils actionnables</option>
                  <option value="announcement">📢 Annonce & Nouveauté</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Ton de la voix Ghostwriter
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'expert', label: '🎯 Expert' },
                    { value: 'pedagogique', label: '📚 Pédagogique' },
                    { value: 'inspirant', label: '✨ Inspirant' },
                    { value: 'chaleureux', label: '🤝 Chaleureux' },
                    { value: 'direct', label: '⚡ Direct' },
                    { value: 'premium', label: '💎 Premium' },
                    { value: 'humour', label: '😄 Humour' },
                    { value: 'professionnel', label: '👔 Pro' },
                  ].map((tItem) => (
                    <button
                      key={tItem.value}
                      type="button"
                      onClick={() => setTone(tItem.value)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold transition text-center ${
                        tone === tItem.value
                          ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                      }`}
                    >
                      {tItem.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Objectif de la publication
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'authority', label: '👑 Développer mon autorité' },
                    { id: 'engagement', label: '💬 Susciter les commentaires' },
                    { id: 'leads', label: '🎯 Attirer des clients & prospects' },
                    { id: 'story', label: '📖 Inspirer et fédérer' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setPostObjective(o.id)}
                      className={`p-2 rounded-lg border text-left font-medium transition ${
                        postObjective === o.id
                          ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold'
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
          disabled={!postSubject.trim() || isGenerating}
          size="lg"
          className="w-full py-4 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.01]"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Rédaction par votre Ghostwriter en cours...
            </span>
          ) : (
            '🚀 Forger mon post avec le Ghostwriter'
          )}
        </Button>
      </form>
    </div>
  );
}
