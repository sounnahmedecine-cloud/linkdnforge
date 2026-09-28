'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Download,
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
  MoreHorizontal,
  Globe2,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { SocialConnections } from '@/lib/studio/types';
import ForgeLoader from '@/components/ui/ForgeLoader';

interface StudioResultProps {
  generatedPost: string;
  isGenerating: boolean;
  tiktokPost?: string;
  detectedClassification?: any;
  postExplanation?: any;
  autopilotVideoUrl?: string;
  siteScreenshotUrl?: string | null;
  siteOgImage?: string | null;
  isAdmin?: boolean;
  targetUrl?: string;
  customBufferToken?: string;
  socialConnections?: SocialConnections;
  onReset: () => void;
  onOpenSocialAccounts?: () => void;
}

interface NetworkConfig {
  id: 'linkedin' | 'facebook' | 'x' | 'reddit';
  label: string;
  icon: string;
  color: string;
  badge: string;
  actionText: string;
  getShareUrl: (post: string, targetUrl?: string) => string;
}

const NETWORKS: NetworkConfig[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'in',
    color: 'bg-[#0A66C2]',
    badge: 'Fil d’actualité',
    actionText: 'Ouvrir LinkedIn',
    getShareUrl: () => 'https://www.linkedin.com/feed/?shareActive=true',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'f',
    color: 'bg-[#1877F2]',
    badge: 'Page & Groupe',
    actionText: 'Ouvrir Facebook',
    getShareUrl: (_post, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || 'https://linkedinforge.fr')}`,
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    icon: '𝕏',
    color: 'bg-black',
    badge: 'Tweet pré-rempli',
    actionText: 'Tweeter sur X',
    getShareUrl: (post) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.slice(0, 280))}`,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    icon: '🤖',
    color: 'bg-[#FF4500]',
    badge: 'Post pré-rempli',
    actionText: 'Poster sur Reddit',
    getShareUrl: (post) => {
      const firstLine = post.split('\n')[0].replace(/^[#* \-_]+/, '').slice(0, 90) || 'Mon nouveau post';
      return `https://www.reddit.com/submit?title=${encodeURIComponent(firstLine)}&text=${encodeURIComponent(post)}`;
    },
  },
];

export default function StudioResult({
  generatedPost,
  isGenerating,
  detectedClassification,
  postExplanation,
  autopilotVideoUrl,
  siteScreenshotUrl,
  siteOgImage,
  targetUrl,
  onReset,
  onOpenSocialAccounts,
}: StudioResultProps) {
  const [copied, setCopied] = useState(false);
  const [mockupMediaView, setMockupMediaView] = useState<'video' | 'screenshot' | 'og'>(
    autopilotVideoUrl ? 'video' : siteOgImage ? 'og' : 'screenshot'
  );
  const [activeVisualMode, setActiveVisualMode] = useState<'screenshot' | 'og'>(
    siteOgImage ? 'og' : 'screenshot'
  );

  // Selected networks for multi-broadcast
  const [selectedBroadcastNetworks, setSelectedBroadcastNetworks] = useState<string[]>([
    'linkedin',
    'facebook',
    'x',
    'reddit',
  ]);
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState<string | null>(null);
  const [showPublishAssistant, setShowPublishAssistant] = useState(false);

  const handleToggleBroadcastNetwork = (netId: string) => {
    setSelectedBroadcastNetworks((prev) =>
      prev.includes(netId) ? prev.filter((id) => id !== netId) : [...prev, netId]
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct share to one network (always synchronous window.open to prevent popup blocking)
  const handleShareDirect = (netId: 'linkedin' | 'facebook' | 'x' | 'reddit') => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const net = NETWORKS.find((n) => n.id === netId);
    if (!net) return;

    const url = net.getShareUrl(generatedPost, targetUrl);
    window.open(url, '_blank');

    setBroadcastSuccessMessage(`🎉 Post copié ! Fenêtre ${net.label} ouverte. Faites Ctrl + V pour coller et publier.`);
    setTimeout(() => setBroadcastSuccessMessage(null), 7000);
  };

  // Broadcast button:
  // - If 1 network selected: opens that network directly
  // - If multiple networks selected: copies text & opens Assistant modal (prevents browser popup block)
  const handleBroadcastAll = () => {
    if (selectedBroadcastNetworks.length === 0) return;

    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (selectedBroadcastNetworks.length === 1) {
      const netId = selectedBroadcastNetworks[0] as 'linkedin' | 'facebook' | 'x' | 'reddit';
      handleShareDirect(netId);
    } else {
      setShowPublishAssistant(true);
    }
  };

  const handleDownloadScreenshot = () => {
    const url = activeVisualMode === 'screenshot' && siteScreenshotUrl ? siteScreenshotUrl : (siteOgImage || siteScreenshotUrl);
    if (!url) return;
    const filename = `visuel-${activeVisualMode === 'og' ? 'produit' : 'capture'}-${Date.now()}.jpg`;
    const downloadUrl = `/api/download-media?url=${encodeURIComponent(url)}&filename=${filename}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-50/70 backdrop-blur border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
          <span>✨</span> Contenu Généré
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Prêt pour LinkedIn, Facebook, X & Reddit</span>
        </div>
      </div>

      {isGenerating ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-5">
          <ForgeLoader label="Compréhension du contenu & rédaction avec votre Ghostwriter..." />
          <div className="space-y-3 pt-2">
            <div className="h-3 bg-slate-100 rounded-full animate-pulse w-full" />
            <div className="h-3 bg-slate-100 rounded-full animate-pulse w-5/6" />
            <div className="h-3 bg-slate-100 rounded-full animate-pulse w-4/6" />
            <div className="h-3 bg-slate-100 rounded-full animate-pulse w-full mt-4" />
            <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      ) : (
        <>
          {/* Classification Badge Card */}
          {detectedClassification && (
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white border border-orange-200/90 rounded-2xl p-4 space-y-2 shadow-xs animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Format Détecté : {detectedClassification.detectedLabel}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Intention : {detectedClassification.primaryIntent} · Audience : {detectedClassification.audience}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  IA Éditoriale
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {detectedClassification.detectedReason}
              </p>

              {detectedClassification.recommendedStructure && detectedClassification.recommendedStructure.length > 0 && (
                <div className="pt-2 border-t border-orange-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-slate-800">Structure :</span>
                  {detectedClassification.recommendedStructure.map((step: string, sIdx: number) => (
                    <span key={sIdx} className="inline-flex items-center gap-1 bg-white border border-slate-200/90 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                      <span className="text-orange-500 font-bold">{sIdx + 1}.</span> {step}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LinkedIn Mockup */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden font-sans shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                <svg className="w-6 h-6 text-slate-400 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-[15px] truncate leading-tight">
                  Vous
                </h4>
                <p className="text-slate-500 text-xs truncate leading-snug">Créateur & Expert</p>
                <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                  <span>À l'instant</span>
                  <span>•</span>
                  <Globe2 className="w-3 h-3" />
                </div>
              </div>
              <button className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition self-start">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Body */}
            <div className="px-4 pb-2 text-[14px] text-slate-900 leading-[1.5] whitespace-pre-wrap break-words">
              {generatedPost}
            </div>

            {/* Media in Mockup */}
            {autopilotVideoUrl && (mockupMediaView === 'video' || (!siteScreenshotUrl && !siteOgImage)) && (
              <div className="mx-4 mb-3 rounded-xl overflow-hidden bg-black aspect-video max-h-72 border border-slate-200 shadow-inner flex items-center justify-center">
                <video src={autopilotVideoUrl} controls className="w-full h-full object-contain" />
              </div>
            )}

            {(siteScreenshotUrl || siteOgImage) && (mockupMediaView === 'screenshot' || mockupMediaView === 'og' || !autopilotVideoUrl) && (
              <div className="mx-4 mb-3 space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-video max-h-72 group">
                  <img
                    src={mockupMediaView === 'og' && siteOgImage ? siteOgImage : (siteScreenshotUrl || siteOgImage || '')}
                    alt="Visuel capturé"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                    {mockupMediaView === 'og' ? '🖼️ Photo Produit' : '📸 Capture Hero'}
                  </div>
                  <button
                    onClick={handleDownloadScreenshot}
                    className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger
                  </button>
                </div>
              </div>
            )}

            {/* LinkedIn Metrics */}
            <div className="px-4 py-2 mt-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-200">
              <div className="flex items-center gap-1">
                <span className="bg-blue-600 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center text-[10px]">👍</span>
                <span className="bg-rose-500 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center text-[10px] -ml-1">❤️</span>
                <span className="ml-1">Vous et 48 autres personnes</span>
              </div>
              <span className="text-slate-400">14 commentaires</span>
            </div>

            {/* LinkedIn Action Buttons */}
            <div className="px-2 py-1 flex items-center justify-between text-slate-500">
              <button className="flex-1 flex items-center justify-center gap-2 font-semibold text-[13px] py-2.5 rounded hover:bg-slate-100 transition">
                <ThumbsUp className="w-4 h-4" />
                <span className="hidden sm:inline">J'aime</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 font-semibold text-[13px] py-2.5 rounded hover:bg-slate-100 transition">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Commenter</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 font-semibold text-[13px] py-2.5 rounded hover:bg-slate-100 transition">
                <Repeat className="w-4 h-4" />
                <span className="hidden sm:inline">Republier</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 font-semibold text-[13px] py-2.5 rounded hover:bg-slate-100 transition">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Explanation Box */}
      {postExplanation && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Pourquoi ce post ? (Transparence & Qualité)
            </div>
            {postExplanation.qualityCheck && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>✓</span> Source-Check IA Validé
              </span>
            )}
          </div>

          {postExplanation.ghostwriterStyle && (
            <p className="text-xs text-slate-600">
              <strong>Style Ghostwriter :</strong> {postExplanation.ghostwriterStyle}
            </p>
          )}
        </div>
      )}

      {/* 🚀 CONSOLE DE DIFFUSION SANS API (LinkedIn, Facebook, X, Reddit) */}
      {!isGenerating && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-700/80 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <h4 className="font-bold text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-orange-400 fill-current" />
                Diffusion Rapide 1-Clic
              </h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-bold">
              Zéro API requise
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Publiez directement sans configuration technique. Choisissez vos réseaux ou lancez la diffusion groupée :
          </p>

          {/* Network Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NETWORKS.map((net) => {
              const isChecked = selectedBroadcastNetworks.includes(net.id);
              return (
                <div
                  key={net.id}
                  className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-2 select-none ${
                    isChecked
                      ? 'bg-slate-800/90 border-orange-500/80 shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleBroadcastNetwork(net.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-orange-400 transition"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                          isChecked ? 'bg-orange-500 text-white font-bold' : 'border border-slate-600'
                        }`}
                      >
                        {isChecked ? '✓' : ''}
                      </div>
                      <span className={`w-5 h-5 rounded-md ${net.color} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                        {net.icon}
                      </span>
                      <span className="truncate">{net.label}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleShareDirect(net.id)}
                    className="w-full text-center text-[11px] font-bold py-1.5 px-2 rounded-lg bg-slate-700/60 hover:bg-orange-500 text-slate-200 hover:text-white transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Ouvrir</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Main Action Button */}
          <button
            type="button"
            onClick={handleBroadcastAll}
            disabled={selectedBroadcastNetworks.length === 0}
            className="w-full py-4 px-6 text-sm sm:text-base font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-95 disabled:opacity-50 text-white rounded-2xl shadow-xl shadow-orange-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>
              {selectedBroadcastNetworks.length === 1
                ? `🚀 Ouvrir et publier sur ${NETWORKS.find((n) => n.id === selectedBroadcastNetworks[0])?.label}`
                : `🚀 Diffuser sur ma sélection (${selectedBroadcastNetworks.length} canaux)`}
            </span>
          </button>

          {/* Success Banner */}
          {broadcastSuccessMessage && (
            <div className="bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{broadcastSuccessMessage}</span>
            </div>
          )}

          {/* Bottom Actions: Copy text & New Post */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={handleCopy}
              className="hover:text-white flex items-center gap-1.5 transition py-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Texte copié dans le presse-papier !' : 'Copier le texte seul'}</span>
            </button>

            {onOpenSocialAccounts && (
              <button
                type="button"
                onClick={onOpenSocialAccounts}
                className="hover:text-orange-400 flex items-center gap-1 transition py-1 underline font-medium"
              >
                Gérer mes profils sociaux
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="hover:text-white flex items-center gap-1.5 transition py-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nouveau post</span>
            </button>
          </div>
        </div>
      )}

      {/* Assistant de Diffusion Modal (Zero Popup Blocking) */}
      {showPublishAssistant && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-7 text-white space-y-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/20 shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                    Post Copié & Prêt à Diffuser !
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Votre texte est prêt dans le presse-papier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishAssistant(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <span>💡</span>
                <span>Comment publier en 2 secondes sans blocage :</span>
              </div>
              <div className="space-y-2 text-xs text-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Cliquez ci-dessous sur le réseau de votre choix pour ouvrir la page.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Faites simplement <strong>Ctrl + V</strong> (ou Coller) dans la boîte de publication (déjà pré-rempli pour X et Reddit).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>Cliquez sur <strong>Publier</strong>. Votre post est en ligne !</p>
                </div>
              </div>
            </div>

            {/* Direct Open Buttons for selected channels */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ouvrir vos pages de publication :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedBroadcastNetworks.map((netId) => {
                  const net = NETWORKS.find((n) => n.id === netId);
                  if (!net) return null;
                  const shareUrl = net.getShareUrl(generatedPost, targetUrl);

                  return (
                    <a
                      key={net.id}
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-xl ${net.color} hover:opacity-90 text-white flex items-center justify-between text-xs font-bold transition shadow-sm`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-white/20 flex items-center justify-center font-bold text-xs">
                          {net.icon}
                        </span>
                        {net.actionText}
                      </span>
                      <ExternalLink className="w-4 h-4 opacity-80" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPublishAssistant(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Fermer l'assistant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
