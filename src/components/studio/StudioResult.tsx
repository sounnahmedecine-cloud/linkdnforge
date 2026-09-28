'use client';

import { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Download,
  Globe2,
  Sparkles,
  ExternalLink,
  Edit3,
  Loader2,
  X,
} from 'lucide-react';
import { SocialConnections } from '@/lib/studio/types';
import ForgeLoader from '@/components/ui/ForgeLoader';

interface StudioResultProps {
  generatedPost: string;
  isGenerating: boolean;
  detectedClassification?: any;
  postExplanation?: any;
  autopilotVideoUrl?: string;
  siteScreenshotUrl?: string | null;
  siteOgImage?: string | null;
  isAdmin?: boolean;
  targetUrl?: string;
  socialConnections?: SocialConnections;
  onReset: () => void;
  onOpenSocialAccounts?: () => void;
}

interface NetworkConfig {
  id: 'linkedin' | 'facebook' | 'x' | 'reddit';
  label: string;
  icon: string;
  color: string;
  hoverColor: string;
  actionText: string;
  getShareUrl: (post: string, targetUrl?: string, customMeta?: { redditSubreddit?: string }) => string;
}

const NETWORKS: NetworkConfig[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'in',
    color: 'bg-[#0A66C2]',
    hoverColor: 'hover:bg-[#084e96]',
    actionText: 'Partager sur LinkedIn',
    getShareUrl: () => 'https://www.linkedin.com/feed/?shareActive=true',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'f',
    color: 'bg-[#1877F2]',
    hoverColor: 'hover:bg-[#0f60c7]',
    actionText: 'Partager sur Facebook',
    getShareUrl: (post, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || 'https://linkedinforge.fr')}&quote=${encodeURIComponent(post)}`,
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    icon: '𝕏',
    color: 'bg-black',
    hoverColor: 'hover:bg-slate-800',
    actionText: 'Tweeter sur X',
    getShareUrl: (post) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.slice(0, 280))}`,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    icon: '🤖',
    color: 'bg-[#FF4500]',
    hoverColor: 'hover:bg-[#d43800]',
    actionText: 'Poster sur Reddit',
    getShareUrl: (post, _url, customMeta) => {
      const firstLine = post.split('\n')[0].replace(/^[#* \-_]+/, '').slice(0, 90) || 'Mon nouveau post';
      const cleanSub = customMeta?.redditSubreddit?.replace(/^[ru]\//, '').trim();
      if (cleanSub) {
        return `https://www.reddit.com/r/${encodeURIComponent(cleanSub)}/submit?title=${encodeURIComponent(firstLine)}&text=${encodeURIComponent(post)}`;
      }
      return `https://www.reddit.com/submit?title=${encodeURIComponent(firstLine)}&text=${encodeURIComponent(post)}`;
    },
  },
];

export default function StudioResult({
  generatedPost,
  isGenerating,
  detectedClassification,
  autopilotVideoUrl,
  siteScreenshotUrl,
  siteOgImage,
  targetUrl,
  socialConnections,
  onReset,
  onOpenSocialAccounts,
}: StudioResultProps) {
  const [postText, setPostText] = useState(generatedPost);
  const [copied, setCopied] = useState(false);
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    message: string;
    network?: string;
  } | null>(null);
  const [lastSharedNetwork, setLastSharedNetwork] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isBroadcastingMake, setIsBroadcastingMake] = useState(false);

  const effectiveMakeWebhook = socialConnections?.makeWebhookUrl?.trim();

  const handleBroadcastMake = async () => {
    if (!effectiveMakeWebhook) {
      const wantToSetup = window.confirm(
        'Vous n’avez pas encore relié votre Webhook Make.com dans vos réglages.\n\nSouhaitez-vous ouvrir vos réglages pour coller l’URL de votre Webhook ?'
      );
      if (wantToSetup && onOpenSocialAccounts) {
        onOpenSocialAccounts();
      }
      return;
    }

    setIsBroadcastingMake(true);
    setActiveNotification(null);
    try {
      const res = await fetch('/api/broadcast/make', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postText,
          mediaUrl: mediaUrl || undefined,
          targetUrl: targetUrl || undefined,
          networks: ['linkedin', 'facebook', 'x', 'reddit'],
          customWebhookUrl: effectiveMakeWebhook || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’envoi à Make.com');
      }
      setActiveNotification({
        title: '🚀 Post transmis à Make.com avec succès !',
        message: 'Votre webhook exécute actuellement la diffusion en arrière-plan sur l\'ensemble de vos réseaux reliés.',
      });
    } catch (e: any) {
      alert(`Erreur Make : ${e.message}`);
    } finally {
      setIsBroadcastingMake(false);
    }
  };

  useEffect(() => {
    setPostText(generatedPost);
  }, [generatedPost]);

  const hasMedia = !!(autopilotVideoUrl || siteScreenshotUrl || siteOgImage);
  const mediaUrl = autopilotVideoUrl ? null : (siteScreenshotUrl || siteOgImage);

  const handleCopy = () => {
    navigator.clipboard.writeText(postText);
    setCopied(true);
    setActiveNotification({
      title: '📋 Texte copié dans votre presse-papier !',
      message: 'Vous pouvez le coller n\'importe où d\'un simple Ctrl + V (ou clic droit > Coller).',
    });
    setTimeout(() => {
      setCopied(false);
    }, 4000);
  };

  const handleShareDirect = (netId: 'linkedin' | 'facebook' | 'x' | 'reddit') => {
    navigator.clipboard.writeText(postText);
    setCopied(true);
    setLastSharedNetwork(netId);
    setTimeout(() => {
      setCopied(false);
      setLastSharedNetwork(null);
    }, 4500);

    const net = NETWORKS.find((n) => n.id === netId);
    if (!net) return;

    const url = net.getShareUrl(postText, targetUrl, {
      redditSubreddit: socialConnections?.redditUsername,
    });
    window.open(url, '_blank');

    setActiveNotification({
      title: `🎉 Fenêtre ${net.label} ouverte & Texte copié !`,
      message: `Votre publication est prête dans votre presse-papier. Rendez-vous sur l'onglet ${net.label} qui vient de s'ouvrir, faites simplement "Ctrl + V" (Coller) et cliquez sur Publier.`,
      network: netId,
    });
  };

  const handleDownloadScreenshot = () => {
    if (!mediaUrl) return;
    const filename = `visuel-${Date.now()}.jpg`;
    const downloadUrl = `/api/download-media?url=${encodeURIComponent(mediaUrl)}&filename=${filename}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isGenerating) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
        <ForgeLoader label="Compréhension du contenu & rédaction de votre post..." />
        <div className="space-y-3 pt-2">
          <div className="h-3 bg-slate-100 rounded-full animate-pulse w-full" />
          <div className="h-3 bg-slate-100 rounded-full animate-pulse w-5/6" />
          <div className="h-3 bg-slate-100 rounded-full animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  const charCount = postText.length;
  const wordCount = postText.trim() ? postText.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in duration-300">
      {/* 1. TOP BAR : Title + Quick Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <h3 className="font-display font-bold text-lg text-slate-900">
            Post Prêt à Diffuser
          </h3>
          {detectedClassification?.detectedLabel && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              {detectedClassification.detectedLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>

          {hasMedia && mediaUrl && (
            <button
              type="button"
              onClick={handleDownloadScreenshot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
              title="Télécharger l'image pour l'attacher à votre post"
            >
              <Download className="w-3.5 h-3.5 text-orange-500" />
              <span>Visuel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            title="Nouveau post"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAKE.COM 1-CLIC BROADCAST (100% Automatique sans copier-coller) */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-purple-500/30 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-purple-500/20">
            M
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              <span>⚡</span> Diffusion 1-Clic via Make.com
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-purple-500/30 text-purple-300 font-bold">
                API Directe
              </span>
            </span>
            <span className="text-[11px] text-purple-200/70 block truncate">
              Publie automatiquement sur LinkedIn, Facebook, X et Reddit
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBroadcastMake}
          disabled={isBroadcastingMake}
          className="px-3.5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-md shadow-purple-500/20 shrink-0 cursor-pointer"
        >
          {isBroadcastingMake ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Envoi à Make...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Diffuser sur tout (Make)</span>
            </>
          )}
        </button>
      </div>

      {/* 3. INSTANT 1-CLICK SHARE BAR (Manual fallback) */}
      <div className="space-y-1.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
          <span>Ou ouverture manuelle par réseau :</span>
          <span className="text-slate-400 font-normal lowercase">copie le texte &amp; ouvre la boîte (Ctrl+V)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {NETWORKS.map((net) => {
            const isJustShared = lastSharedNetwork === net.id;
            return (
              <button
                key={net.id}
                type="button"
                onClick={() => handleShareDirect(net.id)}
                className={`${isJustShared ? 'bg-emerald-600' : `${net.color} ${net.hoverColor}`} text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95`}
              >
                <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">
                  {isJustShared ? '✓' : net.icon}
                </span>
                <span className="truncate">{isJustShared ? 'Ouvert !' : net.label}</span>
                <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PROMINENT INLINE NOTIFICATION (Ctrl + V helper) */}
      {activeNotification && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              ✓
            </div>
            <div>
              <div className="font-extrabold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                <span>{activeNotification.title}</span>
              </div>
              <p className="text-emerald-900 text-[11px] sm:text-xs mt-0.5 leading-relaxed font-medium">
                {activeNotification.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Recopier le texte</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveNotification(null)}
              className="p-1.5 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-100/60 transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. POST CONTENT & PREVIEW */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
        {/* Post Meta */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs border border-slate-300">
              Vous
            </div>
            <div>
              <span className="font-bold text-slate-900 block leading-tight">Votre Publication</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Public</span> • <Globe2 className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              {wordCount} mots • {charCount} car.
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                isEditing ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title={isEditing ? 'Terminer la modification' : 'Modifier le texte'}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Terminé' : 'Ajuster'}</span>
            </button>
          </div>
        </div>

        {/* Text Body */}
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={12}
              className="w-full text-[14px] text-slate-900 leading-relaxed font-sans border border-orange-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-y"
              placeholder="Modifiez votre post ici..."
            />
          ) : (
            <div className="text-[14px] text-slate-900 leading-[1.6] whitespace-pre-wrap font-sans selection:bg-orange-100">
              {postText}
            </div>
          )}
        </div>

        {/* Media Attachment if available */}
        {autopilotVideoUrl && (
          <div className="mx-4 mb-4 rounded-xl overflow-hidden bg-black aspect-video max-h-60 border border-slate-200">
            <video src={autopilotVideoUrl} controls className="w-full h-full object-contain" />
          </div>
        )}

        {mediaUrl && (
          <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group aspect-video max-h-56">
            <img
              src={mediaUrl}
              alt="Visuel à attacher"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleDownloadScreenshot}
                className="bg-white text-slate-900 font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 hover:bg-orange-500 hover:text-white transition"
              >
                <Download className="w-4 h-4" />
                Télécharger le visuel HD
              </button>
            </div>
            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              📸 Visuel HD
            </div>
          </div>
        )}
      </div>

      {/* 5. FOOTER HELPER : Simple 3-step reminder */}
      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          Astuce : cliquez sur le réseau, puis faites <strong>Ctrl + V</strong> dans la boîte de publication.
        </span>
        {onOpenSocialAccounts && (
          <button
            type="button"
            onClick={onOpenSocialAccounts}
            className="text-blue-600 hover:underline font-semibold"
          >
            Configurer mes profils
          </button>
        )}
      </div>
    </div>
  );
}
