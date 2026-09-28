'use client';

import { useState } from 'react';
import { Film, Globe2, Sparkles, ChevronDown, ChevronUp, ArrowLeft, Loader2, Link as LinkIcon } from 'lucide-react';
import VideoDropzone from '@/components/autopilot/VideoDropzone';
import { Button } from '@/components/ui/Button';

interface VideoForgeProps {
  onBack: () => void;
  onGenerate: (data: {
    videoUrl: string;
    videoMeta: { name: string; size: number } | null;
    targetUrl?: string;
    postSubject?: string;
    editorialStyle?: string;
    tone?: string;
    postObjective?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  defaultTone?: string;
}

export default function VideoForge({
  onBack,
  onGenerate,
  isGenerating,
  defaultTone = 'expert',
}: VideoForgeProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoMeta, setVideoMeta] = useState<{ name: string; size: number } | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editorialStyle, setEditorialStyle] = useState('auto');
  const [postObjective, setPostObjective] = useState('leads');
  const [tone, setTone] = useState(defaultTone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;
    onGenerate({
      videoUrl,
      videoMeta,
      targetUrl: showUrlField ? targetUrl.trim() : undefined,
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
        <span className="text-xs bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5" />
          Mode Vidéo
        </span>
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1.5 flex items-center gap-2">
          <span>🎥</span> Transformez votre vidéo en contenu
        </h2>
        <p className="text-sm text-slate-500">
          Déposez votre vidéo. L'IA écoute l'audio, inspecte les visuels et rédige automatiquement un post LinkedIn percutant et une version courte TikTok/Reels.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Dropzone */}
        <div>
          <VideoDropzone
            onVideoUploaded={(url, meta) => {
              setVideoUrl(url);
              setVideoMeta(meta);
            }}
            onVideoRemoved={() => {
              setVideoUrl('');
              setVideoMeta(null);
            }}
          />
        </div>

        {/* Optional Add URL */}
        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showUrlField}
              onChange={(e) => setShowUrlField(e.target.checked)}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
            />
            <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
              Ajouter une URL pour enrichir le contexte (page produit, boutique, SaaS)
            </span>
          </label>

          {showUrlField && (
            <div className="mt-3 pl-6 animate-in fade-in duration-200">
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://dubainegoce.fr/parfum/... ou votre site"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                L'IA va croiser les propos de la vidéo avec les informations de votre page web.
              </p>
            </div>
          )}
        </div>

        {/* Advanced Accordion */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/70 text-left text-xs font-bold text-slate-700 flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Options avancées (Style, Objectif & Ton)
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              <span>{showAdvanced ? 'Masquer' : `Style : ${editorialStyle === 'auto' ? '✨ Automatique (Recommandé)' : editorialStyle === 'product' ? '🛍️ Produit' : editorialStyle === 'expert' ? '💼 Expertise' : editorialStyle === 'educational' ? '🎓 Éducatif' : editorialStyle === 'story' ? '📖 Storytelling' : editorialStyle === 'announcement' ? '📢 Annonce' : editorialStyle}`}</span>
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="auto">✨ Automatique (Recommandé - Détecté par l'IA)</option>
                  <option value="product">🛍️ Produit / E-commerce (Parfums, cosmétiques, fiches de vente)</option>
                  <option value="expert">💼 Expertise & Opinion tranchée</option>
                  <option value="educational">🎓 Tutoriel & Conseils actionnables</option>
                  <option value="story">📖 Storytelling & Coulisses</option>
                  <option value="announcement">📢 Annonce & Lancement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Objectif principal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'leads', label: '🎯 Générer des ventes & prospects' },
                    { id: 'authority', label: '👑 Développer l’autorité' },
                    { id: 'engagement', label: '💬 Maximiser les commentaires' },
                    { id: 'traffic', label: '🚀 Trafic vers le site' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setPostObjective(o.id)}
                      className={`p-2 rounded-lg border text-left font-medium transition ${
                        postObjective === o.id
                          ? 'bg-orange-50 border-orange-500 text-orange-800 font-bold'
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
          disabled={!videoUrl || isGenerating}
          size="lg"
          className="w-full py-4 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.01]"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyse de la vidéo & Rédaction en cours...
            </span>
          ) : (
            '🚀 Analyser la Vidéo & Générer le Contenu'
          )}
        </Button>
      </form>
    </div>
  );
}
