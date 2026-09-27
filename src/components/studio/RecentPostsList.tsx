'use client';

import { RecentPost } from '@/lib/studio/types';
import { Film, Globe2, Sparkles, Copy, Check, Trash2, ArrowUpRight, Calendar } from 'lucide-react';
import { useState } from 'react';

interface RecentPostsListProps {
  posts: RecentPost[];
  onSelectPost: (post: RecentPost) => void;
  onDeletePost: (id: string) => void;
  onNewCreation: () => void;
}

export default function RecentPostsList({
  posts,
  onSelectPost,
  onDeletePost,
  onNewCreation,
}: RecentPostsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, post: RecentPost) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.post);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSourceIcon = (type: RecentPost['sourceType']) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4 text-orange-500" />;
      case 'url':
        return <Globe2 className="w-4 h-4 text-blue-500" />;
      case 'idea':
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  const getSourceLabel = (type: RecentPost['sourceType']) => {
    switch (type) {
      case 'video':
        return 'Vidéo';
      case 'url':
        return 'URL / Produit';
      case 'idea':
      default:
        return 'Idée Ghostwriter';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'Récemment';
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 text-base mb-1">Aucun contenu récent pour le moment</h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
          Déposez une vidéo, collez un lien ou donnez une idée ci-dessus pour forger votre premier contenu optimisé.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📚</span> Vos Contenus Récents
          <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full border border-slate-200">
            {posts.length}
          </span>
        </h3>
        <span className="text-xs text-slate-400">Cliquez pour afficher et republier</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {posts.map((p) => {
          const classificationLabel = p.classification?.detectedLabel || (p.sourceType === 'video' ? '🎥 Vidéo' : p.sourceType === 'url' ? '🔗 URL' : '✍️ Idée');

          return (
            <div
              key={p.id}
              onClick={() => onSelectPost(p)}
              className="group bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-300 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                      {getSourceIcon(p.sourceType)}
                      {getSourceLabel(p.sourceType)}
                    </span>
                    {p.classification?.detectedLabel && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[11px] font-bold">
                        {p.classification.detectedLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3" />
                    {formatDate(p.createdAt)}
                  </span>
                </div>

                <h4 className="font-semibold text-slate-900 text-sm line-clamp-1 mb-1.5 group-hover:text-orange-600 transition-colors">
                  {p.title || (p.post.slice(0, 60) + '...')}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {p.post}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {p.post.length} caractères
                  </span>
                  {p.tiktokPost && (
                    <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-bold">
                      + TikTok
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, p)}
                    title="Copier le post"
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                  >
                    {copiedId === p.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePost(p.id);
                    }}
                    title="Supprimer"
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="p-1 text-slate-400 group-hover:text-orange-500">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
