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
  socialConnections,
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
  const [showPublishAssistant, setShowPublishAssistant] = useState(false);

  // Buffer Auto-Publish Toggle State
  const effectiveBufferToken = customBufferToken || socialConnections?.bufferToken || (isAdmin ? '5I7pCkpokAIuLqJX-Mn6o4AK0g41_yq5xBbEjy0EpTS' : '');
  const isBufferAvailable = !!effectiveBufferToken;
  const [useBufferAutoPublish, setUseBufferAutoPublish] = useState<boolean>(true);

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
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }

    const broadcastLog: string[] = [];
    const canUseBuffer = isBufferAvailable && useBufferAutoPublish;
    let anyBufferPublished = false;
    let needsWebAssistance = false;

    // 1. TikTok
    if (selectedBroadcastNetworks.includes('tiktok')) {
      if (canUseBuffer) {
        const ok = await handlePublishBuffer('tiktok');
        if (ok) broadcastLog.push('TikTok (@abbi.muslim)');
        anyBufferPublished = true;
      } else {
        window.open('https://www.tiktok.com/upload', '_blank');
        broadcastLog.push('TikTok');
        needsWebAssistance = true;
      }
    }

    // 2. Instagram
    if (selectedBroadcastNetworks.includes('instagram')) {
      if (canUseBuffer) {
        const ok = await handlePublishBuffer('instagram');
        if (ok) broadcastLog.push('Instagram (@aa.mina212)');
        anyBufferPublished = true;
      } else {
        window.open('https://www.instagram.com/', '_blank');
        broadcastLog.push('Instagram');
        needsWebAssistance = true;
      }
    }

    // 3. LinkedIn
    if (selectedBroadcastNetworks.includes('linkedin')) {
      if (canUseBuffer) {
        const ok = await handlePublishBuffer('linkedin');
        if (ok) broadcastLog.push('LinkedIn (Abderrahman Elmalki)');
        anyBufferPublished = true;
      } else {
        window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
        broadcastLog.push('LinkedIn');
        needsWebAssistance = true;
      }
    }

    // 4. Facebook
    if (selectedBroadcastNetworks.includes('facebook')) {
      if (canUseBuffer) {
        const ok = await handlePublishBuffer('facebook');
        if (ok) broadcastLog.push('Facebook (Dubainegoce.fr)');
        anyBufferPublished = true;
      } else {
        const fbUrl = encodeURIComponent(targetUrl || 'https://linkedinforge.fr');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`, '_blank');
        broadcastLog.push('Facebook');
        needsWebAssistance = true;
      }
    }

    // 5. X (Twitter)
    if (selectedBroadcastNetworks.includes('x')) {
      const text = encodeURIComponent(generatedPost.slice(0, 280));
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
      broadcastLog.push('X (Twitter)');
      // If manual fallback is needed because LinkedIn/Facebook were in manual mode
      if (!canUseBuffer) {
        needsWebAssistance = true;
      }
    }

    setIsBroadcasting(false);

    if (needsWebAssistance) {
      setShowPublishAssistant(true);
      setBroadcastSuccessMessage(`🎉 Post copié ! Assistant de diffusion ouvert (${broadcastLog.join(', ')}).`);
    } else {
      setBroadcastSuccessMessage(`🚀 Succès total ! Post propulsé sur ${broadcastLog.join(', ')} via Buffer.`);
    }
    setTimeout(() => setBroadcastSuccessMessage(null), 10000);
  };

  const handleCopy = () => {
    const textToCopy = selectedNetworkView === 'tiktok' && tiktokPost ? tiktokPost : generatedPost;
    navigator.clipboard.writeText(textToCopy);
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
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
    setShowPublishAssistant(true);
  };

  const handleShareFacebook = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    const fbUrl = encodeURIComponent(targetUrl || 'https://linkedinforge.fr');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`, '_blank');
    setShowPublishAssistant(true);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(generatedPost.slice(0, 280));
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

  const handlePublishBuffer = async (channel: 'tiktok' | 'instagram' | 'linkedin' | 'facebook' | 'x') => {
    setIsPublishingBuffer(true);
    setBufferStatusMessage(null);
    try {
      const textToSend = channel === 'tiktok' && tiktokPost ? tiktokPost : generatedPost;
      const res = await fetch('/api/autopilot/publish-buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          text: textToSend,
          mediaUrl: autopilotVideoUrl || (activeVisualMode === 'screenshot' ? siteScreenshotUrl : siteOgImage) || undefined,
          mediaType: autopilotVideoUrl ? 'video' : 'image',
          customBufferToken: effectiveBufferToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la publication');

      const labels: Record<string, string> = {
        linkedin: 'LinkedIn',
        facebook: 'Facebook',
        tiktok: 'TikTok',
        instagram: 'Instagram',
        x: 'X (Twitter)',
      };

      setBufferStatusMessage(`✓ Post propulsé sur ${labels[channel] || channel} via Buffer !`);
      setTimeout(() => setBufferStatusMessage(null), 8000);
      return true;
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Erreur lors de la publication Buffer.');
      return false;
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

          {/* Passerelle Buffer Auto Toggle ("Bouton Buffer à cocher") */}
          {isBufferAvailable && (
            <div className="bg-slate-950/80 border border-orange-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-orange-500/20">
                  B
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">Mode Passerelle Buffer</span>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      100% Automatique
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Publication directe sur vos comptes sans copier-coller ni ouvrir d'onglet.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={useBufferAutoPublish}
                  onChange={(e) => setUseBufferAutoPublish(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                <span className="ml-2.5 text-xs font-bold text-orange-400">
                  {useBufferAutoPublish ? 'Buffer Actif (Zéro Clic)' : 'Mode Manuel'}
                </span>
              </label>
            </div>
          )}

          {/* Network Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'linkedin',
                label: 'LinkedIn',
                icon: 'in',
                color: 'bg-[#0A66C2]',
                sub: isBufferAvailable && useBufferAutoPublish ? 'Abderrahman' : 'Manuel',
              },
              {
                id: 'facebook',
                label: 'Facebook',
                icon: 'f',
                color: 'bg-[#1877F2]',
                sub: isBufferAvailable && useBufferAutoPublish ? 'Dubainegoce.fr' : 'Manuel',
              },
              {
                id: 'x',
                label: 'X (Twitter)',
                icon: '𝕏',
                color: 'bg-black',
                sub: 'Tweet Web',
              },
              {
                id: 'tiktok',
                label: 'TikTok',
                icon: '🎵',
                color: 'bg-black',
                sub: isBufferAvailable && useBufferAutoPublish ? 'abbi.muslim' : 'Manuel',
              },
              {
                id: 'instagram',
                label: 'Instagram',
                icon: '📸',
                color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
                sub: isBufferAvailable && useBufferAutoPublish ? 'aa.mina212' : 'Manuel',
              },
            ].map((net) => {
              const isChecked = selectedBroadcastNetworks.includes(net.id);
              return (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => handleToggleBroadcastNetwork(net.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition text-left select-none cursor-pointer ${
                    isChecked
                      ? 'bg-slate-800 border-orange-500 text-white shadow-xs'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                      isChecked ? 'bg-orange-500 text-white' : 'border border-slate-600'
                    }`}
                  >
                    {isChecked ? '✓' : ''}
                  </div>
                  <span
                    className={`w-6 h-6 rounded-lg ${net.color} text-white flex items-center justify-center text-[11px] font-bold shrink-0`}
                  >
                    {net.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate leading-tight">{net.label}</span>
                    <span
                      className={`text-[9px] font-mono leading-tight ${
                        net.sub.startsWith('Tweet')
                          ? 'text-slate-400'
                          : 'text-emerald-400 font-semibold'
                      }`}
                    >
                      {net.sub}
                    </span>
                  </div>
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
              {isBroadcasting
                ? 'Publication en cours via Buffer...'
                : isBufferAvailable && useBufferAutoPublish
                ? `🚀 Propulser sur ${selectedBroadcastNetworks.length} réseau(x) via Buffer`
                : `🚀 Diffuser sur tout (${selectedBroadcastNetworks.length} canaux) en 1 Clic`}
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

      {/* Assistant de Publication 1-Clic Modal */}
      {showPublishAssistant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-7 text-white space-y-6 shadow-2xl relative">
            {/* Header with checkmark */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/20 shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                    Post Copié & Prêt à Publier !
                  </h3>
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Prêt dans votre presse-papier
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
                <span>Comment publier en 2 secondes :</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p>Votre texte a été <strong>automatiquement copié</strong> dans votre presse-papier.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p>Dans la boîte de publication (LinkedIn ou Facebook) qui vient de s'ouvrir, faites :</p>
                </div>
                <div className="ml-7 bg-slate-950/90 border border-amber-500/50 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-300 font-bold text-sm">
                    👉 Touche Ctrl + V (ou Coller)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Recopié !' : 'Recopier'}
                  </button>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p>Cliquez sur <strong>Publier</strong> sur le réseau social. Votre post est en ligne !</p>
                </div>
              </div>
            </div>

            {/* Direct Open Buttons for selected channels */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ouvrir directement vos fenêtres de publication :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="https://www.linkedin.com/feed/?shareActive=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white flex items-center justify-between text-xs font-bold transition shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-white text-[#0A66C2] flex items-center justify-center font-bold text-xs">in</span>
                    Boîte LinkedIn
                  </span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl || 'https://linkedinforge.fr')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#1877F2] hover:bg-[#0c5dc7] text-white flex items-center justify-between text-xs font-bold transition shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-white text-[#1877F2] flex items-center justify-center font-bold text-xs">f</span>
                    Boîte Facebook
                  </span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>

                {selectedBroadcastNetworks.includes('x') && (
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedPost.slice(0, 280))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-black border border-slate-700 hover:border-slate-500 text-white flex items-center justify-between text-xs font-bold transition shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center font-bold text-xs">𝕏</span>
                      Poster sur X
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-80" />
                  </a>
                )}
              </div>
            </div>

            {/* Note on Buffer API 100% automated */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>⚡ Option 100% en tâche de fond (sans toucher au clavier) :</span>
              <span className="font-bold text-orange-400">Passerelle Buffer disponible</span>
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
