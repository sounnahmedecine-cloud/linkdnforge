import { RecentPost } from '@/lib/studio/types';
import { Film, Globe2, Sparkles, Copy, Check, Trash2, ArrowUpRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import { AnvilMark } from '@/components/ui/Logo';

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
        return <Film className="w-3.5 h-3.5 text-stone-600" />;
      case 'url':
        return <Globe2 className="w-3.5 h-3.5 text-stone-600" />;
      case 'idea':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  const getSourceLabel = (type: RecentPost['sourceType']) => {
    switch (type) {
      case 'video':
        return 'Vidéo';
      case 'url':
        return 'URL';
      case 'idea':
      default:
        return 'Idée';
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
      <div className="bg-white border border-stone-200/90 rounded-2xl p-10 text-center space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-center opacity-70 mb-1">
          <AnvilMark className="w-9 h-7" />
        </div>
        <h4 className="font-bold text-iron-950 text-sm">
          Aucun contenu pour le moment
        </h4>
        <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
          Déposez une vidéo, collez un lien ou donnez une idée ci-dessus pour forger votre premier contenu optimisé.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {posts.map((p) => {
          return (
            <div
              key={p.id}
              onClick={() => onSelectPost(p)}
              className="group bg-white hover:border-stone-400 border border-stone-200/90 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-semibold text-stone-700 border border-stone-200/60">
                      {getSourceIcon(p.sourceType)}
                      <span>{getSourceLabel(p.sourceType)}</span>
                    </span>
                    {p.classification?.detectedLabel && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                        {p.classification.detectedLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1 shrink-0 font-mono">
                    <Calendar className="w-3 h-3" />
                    {formatDate(p.createdAt)}
                  </span>
                </div>

                <h4 className="font-semibold text-iron-950 text-sm line-clamp-1 mb-1.5 group-hover:text-ember-600 transition-colors">
                  {p.title || (p.post.slice(0, 60) + '...')}
                </h4>

                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                  {p.post}
                </p>
              </div>

              <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-400 font-mono">
                    {p.post.length} car.
                  </span>
                  {p.tiktokPost && (
                    <span className="text-[10px] bg-iron-900 text-white px-1.5 py-0.5 rounded-md font-bold">
                      TikTok
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, p)}
                    title="Copier le post"
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition cursor-pointer"
                  >
                    {copiedId === p.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="p-1 text-stone-400 group-hover:text-ember-600">
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
