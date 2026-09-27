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
  Film,
  Zap,
  Loader2,
  Share2,
  CheckCircle2,
} from 'lucide-react';
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
  onReset: () => void;
}

export default function StudioResult({
  generatedPost,
  isGenerating,
  tiktokPost,
  detectedClassification,
  postExplanation,
  autopilotVideoUrl,
  siteScreenshotUrl,
  siteOgImage,
  isAdmin = false,
  targetUrl,
  customBufferToken,
  onReset,
}: StudioResultProps) {
  const [selectedNetworkView, setSelectedNetworkView] = useState<'linkedin' | 'tiktok'>('linkedin');
  const [copied, setCopied] = useState(false);
  const [copiedTikTok, setCopiedTikTok] = useState(false);
  const [mockupMediaView, setMockupMediaView] = useState<'video' | 'screenshot' | 'og'>(
    autopilotVideoUrl ? 'video' : siteOgImage ? 'og' : 'screenshot'
  );
  const [activeVisualMode, setActiveVisualMode] = useState<'screenshot' | 'og'>(
    siteOgImage ? 'og' : 'screenshot'
  );

  // Buffer state
  const [isPublishingBuffer, setIsPublishingBuffer] = useState(false);
  const [bufferStatusMessage, setBufferStatusMessage] = useState<string | null>(null);

  // Multi-network 1-click broadcast state
  const [selectedBroadcastNetworks, setSelectedBroadcastNetworks] = useState<string[]>([
    'linkedin',
    'facebook',
    ...(tiktokPost ? ['tiktok'] : []),
  ]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState<string | null>(null);

  const handleToggleBroadcastNetwork = (netId: string) => {
    setSelectedBroadcastNetworks((prev) =>
      prev.includes(netId) ? prev.filter((id) => id !== netId) : [...prev, netId]
    );
  };

  const handleBroadcastAll = async () => {
    if (selectedBroadcastNetworks.length === 0) return;
    setIsBroadcasting(true);
    setBroadcastSuccessMessage(null);

    // 1. Copy text to clipboard immediately
    const textToCopy = selectedNetworkView === 'tiktok' && tiktokPost ? tiktokPost : generatedPost;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }

    const broadcastLog: string[] = [];

    // 2. Buffer Direct Publishing (if token configured or admin)
    const canUseBuffer = isAdmin || !!customBufferToken;

    if (selectedBroadcastNetworks.includes('tiktok')) {
      if (canUseBuffer) {
        handlePublishBuffer('tiktok');
        broadcastLog.push('TikTok (via Buffer)');
      } else {
        window.open('https://www.tiktok.com/upload', '_blank');
        broadcastLog.push('TikTok');
      }
    }

    if (selectedBroadcastNetworks.includes('instagram')) {
      if (canUseBuffer) {
        handlePublishBuffer('instagram');
        broadcastLog.push('Instagram (via Buffer)');
      } else {
        window.open('https://www.instagram.com/', '_blank');
        broadcastLog.push('Instagram');
      }
    }

    // 3. Web share native windows (LinkedIn, Facebook, X)
    if (selectedBroadcastNetworks.includes('linkedin')) {
      const text = encodeURIComponent(generatedPost);
      window.open(`https://www.linkedin.com/feed/?text=${text}`, '_blank');
      broadcastLog.push('LinkedIn');
    }

    if (selectedBroadcastNetworks.includes('facebook')) {
      const text = encodeURIComponent(generatedPost);
      window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
      broadcastLog.push('Facebook');
    }

    if (selectedBroadcastNetworks.includes('x')) {
      const text = encodeURIComponent(generatedPost.slice(0, 280));
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
      broadcastLog.push('X');
    }

    setIsBroadcasting(false);
    setBroadcastSuccessMessage(`🎉 Diffusion lancée sur ${broadcastLog.join(', ')} ! Le texte est copié.`);
    setTimeout(() => setBroadcastSuccessMessage(null), 8000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTikTok = () => {
    if (!tiktokPost) return;
    navigator.clipboard.writeText(tiktokPost);
    setCopiedTikTok(true);
    setTimeout(() => setCopiedTikTok(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(generatedPost);
    window.open(`https://www.linkedin.com/feed/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const text = encodeURIComponent(generatedPost);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(generatedPost);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareReddit = () => {
    const text = encodeURIComponent(generatedPost);
    window.open(`https://www.reddit.com/submit?title=Mon%20Post&text=${text}`, '_blank');
  };

  const handleShareTikTokMobile = async () => {
    if (!tiktokPost) return;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'Mon Post TikTok / Reels',
          text: tiktokPost,
          url: targetUrl || undefined,
        });
        return;
      } catch (e) {
        // Fallback
      }
    }
    navigator.clipboard.writeText(tiktokPost);
    window.open('https://www.tiktok.com/upload', '_blank');
  };

  const handleShareInstagram = () => {
    if (!tiktokPost) return;
    navigator.clipboard.writeText(tiktokPost);
    alert('Légende et hashtags copiés dans le presse-papier ! Vous allez être redirigé vers Instagram.');
    window.open('https://www.instagram.com/', '_blank');
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

  const handlePublishBuffer = async (channel: 'tiktok' | 'instagram') => {
    setIsPublishingBuffer(true);
    setBufferStatusMessage(null);
    try {
      const res = await fetch('/api/autopilot/publish-buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          text: tiktokPost || generatedPost,
          mediaUrl: autopilotVideoUrl || (activeVisualMode === 'screenshot' ? siteScreenshotUrl : siteOgImage) || undefined,
          mediaType: autopilotVideoUrl ? 'video' : 'image',
          customBufferToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la publication');

      setBufferStatusMessage(`✓ Post envoyé avec succès sur ${channel === 'tiktok' ? 'TikTok (@abbi.muslim)' : 'Instagram (@aa.mina212)'} via Buffer !`);
      setTimeout(() => setBufferStatusMessage(null), 6000);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Erreur lors de la publication Buffer.');
    } finally {
      setIsPublishingBuffer(false);
    }
  };

  return (
    <div className="bg-slate-50/70 backdrop-blur border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
          <span>✨</span> Contenu Généré
        </h3>

        {tiktokPost && (
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedNetworkView('linkedin')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedNetworkView === 'linkedin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💼 LinkedIn & FB
            </button>
            <button
              type="button"
              onClick={() => setSelectedNetworkView('tiktok')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                selectedNetworkView === 'tiktok'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎵</span> TikTok / Reels
            </button>
          </div>
        )}
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
      ) : selectedNetworkView === 'tiktok' && tiktokPost ? (
        /* Dedicated TikTok & Reels View */
        <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-4 font-sans animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold text-sm tracking-wide">Format Vidéo Court (TikTok & Reels)</span>
            </div>
            <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded font-mono">Accroche 3s</span>
          </div>

          {autopilotVideoUrl && (
            <div className="rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-80 mx-auto flex items-center justify-center border border-slate-800 shadow-inner">
              <video src={autopilotVideoUrl} controls className="w-full h-full object-contain" />
            </div>
          )}

          <div className="bg-slate-900/90 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium border border-slate-800/80">
            {tiktokPost}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCopyTikTok}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition ${
                copiedTikTok ? 'bg-emerald-500 text-white' : 'bg-white text-slate-950 hover:bg-slate-200'
              }`}
            >
              {copiedTikTok ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedTikTok ? 'Légende copiée !' : 'Copier la légende'}
            </button>
            <button
              onClick={handleShareTikTokMobile}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-rose-500/25"
            >
              <span>📱</span> Partager sur TikTok
            </button>
          </div>

          {isAdmin || !!customBufferToken ? (
            /* Buffer Direct Publishing */
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  {isAdmin ? '👑 Espace Fondateur (Buffer MCP)' : '⚡ Diffusion 1-Clic Active (Buffer)'}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                  ✓ Comptes Connectés
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePublishBuffer('tiktok')}
                  disabled={isPublishingBuffer}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-slate-900 text-white border border-slate-700 transition"
                >
                  {isPublishingBuffer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>🎵</span>}
                  Publier sur TikTok
                </button>
                <button
                  type="button"
                  onClick={() => handlePublishBuffer('instagram')}
                  disabled={isPublishingBuffer}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white transition shadow-md shadow-pink-500/10"
                >
                  {isPublishingBuffer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>📸</span>}
                  Publier sur Instagram
                </button>
              </div>
              {bufferStatusMessage && (
                <p className="text-xs text-center font-semibold text-emerald-400 mt-1 animate-in fade-in">
                  {bufferStatusMessage}
                </p>
              )}
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShareTikTokMobile}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-slate-900 text-white border border-slate-700 transition"
                >
                  <span>🎵</span> Ouvrir & Poster sur TikTok
                </button>
                <button
                  type="button"
                  onClick={handleShareInstagram}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white transition shadow-md shadow-pink-500/10"
                >
                  <span>📸</span> Ouvrir & Poster sur Instagram
                </button>
              </div>
            </div>
          )}
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

      {/* 🚀 CONSOLE DE MULTI-DIFFUSION 1-CLIC */}
      {!isGenerating && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-700/80 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <h4 className="font-bold text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-orange-400 fill-current" />
                Multi-Diffusion 1-Clic
              </h4>
            </div>
            <span className="text-[11px] font-mono text-orange-400 bg-orange-950/60 border border-orange-800/80 px-2.5 py-0.5 rounded-full font-bold">
              {selectedBroadcastNetworks.length} réseau{selectedBroadcastNetworks.length > 1 ? 'x' : ''} coché{selectedBroadcastNetworks.length > 1 ? 's' : ''}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Cochez les réseaux sur lesquels propulser votre post, puis cliquez sur le bouton pour tout envoyer d'un coup :
          </p>

          {/* Network Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'linkedin', label: 'LinkedIn', icon: 'in', color: 'bg-[#0A66C2]' },
              { id: 'facebook', label: 'Facebook', icon: 'f', color: 'bg-[#1877F2]' },
              { id: 'x', label: 'X (Twitter)', icon: '𝕏', color: 'bg-black' },
              { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-black' },
              { id: 'instagram', label: 'Instagram', icon: '📸', color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600' },
            ].map((net) => {
              const isChecked = selectedBroadcastNetworks.includes(net.id);
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => handleToggleBroadcastNetwork(net.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition text-left select-none ${
                    isChecked
                      ? 'bg-slate-800 border-orange-500 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isChecked ? 'bg-orange-500 text-white' : 'border border-slate-600'}`}>
                    {isChecked ? '✓' : ''}
                  </div>
                  <span className={`w-5 h-5 rounded-md ${net.color} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                    {net.icon}
                  </span>
                  <span className="truncate">{net.label}</span>
                </button>
              );
            })}
          </div>

          {/* Big Wow Broadcast Button */}
          <button
            type="button"
            onClick={handleBroadcastAll}
            disabled={isBroadcasting || selectedBroadcastNetworks.length === 0}
            className="w-full py-4 px-6 text-sm sm:text-base font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-95 disabled:opacity-50 text-white rounded-2xl shadow-xl shadow-orange-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isBroadcasting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 fill-current animate-bounce" />
            )}
            <span>
              🚀 Diffuser sur tout ({selectedBroadcastNetworks.length} canaux) en 1 Clic
            </span>
          </button>

          {/* Success Banner */}
          {broadcastSuccessMessage && (
            <div className="bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{broadcastSuccessMessage}</span>
            </div>
          )}

          {/* Individual Share Quick Actions & Reset */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={handleCopy}
              className="hover:text-white flex items-center gap-1.5 transition py-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Texte copié !' : 'Copier le texte seul'}</span>
            </button>
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
    </div>
  );
}
