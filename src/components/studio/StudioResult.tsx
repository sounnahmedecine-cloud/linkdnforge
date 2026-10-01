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
import { formatTweetSafe, SocialNetworkType, NETWORK_LIMITS } from '@/lib/prompts/network-adaptation';
import ForgeLoader from '@/components/ui/ForgeLoader';
import { trackPostCopied, trackDirectPublish } from '@/lib/analytics';

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
    getShareUrl: (post) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(formatTweetSafe(post, 275))}`,
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
    actionUrl?: string;
    actionLabel?: string;
  } | null>(null);
  const [lastSharedNetwork, setLastSharedNetwork] = useState<string | null>(null);
  const [publishedPostUrl, setPublishedPostUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [linkedInAuth, setLinkedInAuth] = useState<{
    connected: boolean;
    hasAppConfigured: boolean;
    profile?: { name: string };
  } | null>(null);
  const [facebookAuth, setFacebookAuth] = useState<{
    connected: boolean;
    hasAppConfigured: boolean;
    page?: { id: string; name: string };
  } | null>(null);
  const [twitterAuth, setTwitterAuth] = useState<{
    connected: boolean;
    hasAppConfigured: boolean;
    user?: { id: string; username: string; name: string };
  } | null>(null);
  const [redditAuth, setRedditAuth] = useState<{
    connected: boolean;
    hasAppConfigured: boolean;
    user?: { id: string; name: string };
  } | null>(null);
  const [isPublishingLinkedInDirect, setIsPublishingLinkedInDirect] = useState(false);
  const [isPublishingFacebookDirect, setIsPublishingFacebookDirect] = useState(false);
  const [isPublishingTwitterDirect, setIsPublishingTwitterDirect] = useState(false);
  const [isPublishingRedditDirect, setIsPublishingRedditDirect] = useState(false);
  const [publishedFacebookUrl, setPublishedFacebookUrl] = useState<string | null>(null);
  const [publishedTwitterUrl, setPublishedTwitterUrl] = useState<string | null>(null);
  const [publishedRedditUrl, setPublishedRedditUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/linkedin/status')
      .then((res) => res.json())
      .then((data) => setLinkedInAuth(data))
      .catch((e) => console.error('Error checking LinkedIn auth status:', e));

    fetch('/api/auth/facebook/status')
      .then((res) => res.json())
      .then((data) => setFacebookAuth(data))
      .catch((e) => console.error('Error checking Facebook auth status:', e));

    fetch('/api/auth/twitter/status')
      .then((res) => res.json())
      .then((data) => setTwitterAuth(data))
      .catch((e) => console.error('Error checking Twitter auth status:', e));

    fetch('/api/auth/reddit/status')
      .then((res) => res.json())
      .then((data) => setRedditAuth(data))
      .catch((e) => console.error('Error checking Reddit auth status:', e));
  }, []);

  const handlePublishLinkedInDirect = async () => {
    if (!linkedInAuth?.connected) {
      if (onOpenSocialAccounts) {
        onOpenSocialAccounts();
      } else {
        window.location.href = '/api/auth/linkedin';
      }
      return;
    }

    setIsPublishingLinkedInDirect(true);
    setActiveNotification(null);
    try {
      const res = await fetch('/api/publish/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postText,
          targetUrl: targetUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la publication directe sur LinkedIn');
      }

      const postViewUrl = data.feedUrl || 'https://www.linkedin.com/feed/';
      setPublishedPostUrl(postViewUrl);
      trackDirectPublish('linkedin', true, postText.length);

      setActiveNotification({
        title: '🎉 Publication réussie sur votre profil LinkedIn !',
        message: `Votre post est en ligne sur le profil de ${data.authorName || linkedInAuth.profile?.name || 'LinkedIn'}.`,
        actionUrl: postViewUrl,
        actionLabel: '👁️ Voir mon post sur LinkedIn',
      });
    } catch (e: any) {
      trackDirectPublish('linkedin', false, postText.length);
      alert(`Erreur LinkedIn : ${e.message}`);
    } finally {
      setIsPublishingLinkedInDirect(false);
    }
  };

  const handlePublishFacebookDirect = async () => {
    if (!facebookAuth?.connected) {
      if (onOpenSocialAccounts) {
        onOpenSocialAccounts();
      } else {
        window.location.href = '/api/auth/facebook';
      }
      return;
    }

    setIsPublishingFacebookDirect(true);
    setActiveNotification(null);
    try {
      const res = await fetch('/api/publish/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postText,
          targetUrl: targetUrl || undefined,
          mediaUrl: mediaUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la publication directe sur Facebook');
      }

      const postViewUrl = data.feedUrl || 'https://www.facebook.com';
      setPublishedFacebookUrl(postViewUrl);
      trackDirectPublish('facebook', true, postText.length);

      setActiveNotification({
        title: '🎉 Publication réussie sur votre Page Facebook !',
        message: `Votre post est en ligne sur votre Page Facebook « ${data.pageName || facebookAuth.page?.name || 'Facebook'} ».`,
        actionUrl: postViewUrl,
        actionLabel: '👁️ Voir mon post Facebook',
      });
    } catch (e: any) {
      trackDirectPublish('facebook', false, postText.length);
      alert(`Erreur Facebook : ${e.message}`);
    } finally {
      setIsPublishingFacebookDirect(false);
    }
  };

  const handlePublishTwitterDirect = async () => {
    if (!twitterAuth?.connected) {
      if (onOpenSocialAccounts) {
        onOpenSocialAccounts();
      } else {
        window.location.href = '/api/auth/twitter';
      }
      return;
    }

    setIsPublishingTwitterDirect(true);
    setActiveNotification(null);
    try {
      const tweetContent = activeFormat === 'x' ? postText : (networkTexts.x || formatTweetSafe(postText, 275));
      const res = await fetch('/api/publish/twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: tweetContent,
          targetUrl: targetUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la publication directe sur X (Twitter)');
      }

      const tweetViewUrl = data.tweetUrl || 'https://twitter.com';
      setPublishedTwitterUrl(tweetViewUrl);
      trackDirectPublish('twitter', true, tweetContent.length);

      setActiveNotification({
        title: '🎉 Tweet publié avec succès sur votre compte X !',
        message: `Votre publication est en ligne sur @${data.username || twitterAuth.user?.username || 'votre compte'}.`,
        actionUrl: tweetViewUrl,
        actionLabel: '👁️ Voir mon Tweet sur X',
      });
    } catch (e: any) {
      trackDirectPublish('twitter', false, postText.length);
      alert(`Erreur X (Twitter) : ${e.message}`);
    } finally {
      setIsPublishingTwitterDirect(false);
    }
  };

  const handlePublishRedditDirect = async () => {
    if (!redditAuth?.connected) {
      if (onOpenSocialAccounts) {
        onOpenSocialAccounts();
      } else {
        window.location.href = '/api/auth/reddit';
      }
      return;
    }

    setIsPublishingRedditDirect(true);
    setActiveNotification(null);
    try {
      const redditContent = activeFormat === 'reddit' ? postText : (networkTexts.reddit || postText);
      const res = await fetch('/api/publish/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: redditContent,
          subreddit: socialConnections?.redditUsername?.replace(/^[ru]\//, '').trim() || undefined,
          targetUrl: targetUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la publication directe sur Reddit');
      }

      const postViewUrl = data.postUrl || 'https://www.reddit.com';
      setPublishedRedditUrl(postViewUrl);
      trackDirectPublish('reddit', true, redditContent.length);

      setActiveNotification({
        title: '🎉 Post publié avec succès sur Reddit !',
        message: `Votre publication est en ligne (${data.subreddit?.startsWith('u_') ? 'sur votre profil' : 'dans r/' + data.subreddit}).`,
        actionUrl: postViewUrl,
        actionLabel: '👁️ Voir mon post sur Reddit',
      });
    } catch (e: any) {
      trackDirectPublish('reddit', false, postText.length);
      alert(`Erreur Reddit : ${e.message}`);
    } finally {
      setIsPublishingRedditDirect(false);
    }
  };



  const [activeFormat, setActiveFormat] = useState<SocialNetworkType>('linkedin');
  const [networkTexts, setNetworkTexts] = useState<Record<SocialNetworkType, string>>({
    linkedin: generatedPost,
    x: '',
    facebook: '',
    reddit: '',
  });
  const [isAdapting, setIsAdapting] = useState(false);

  useEffect(() => {
    setPostText(generatedPost);
    setNetworkTexts({
      linkedin: generatedPost,
      x: '',
      facebook: '',
      reddit: '',
    });
    setActiveFormat('linkedin');
  }, [generatedPost]);

  const handleSwitchFormat = async (targetFmt: SocialNetworkType) => {
    setActiveFormat(targetFmt);
    if (networkTexts[targetFmt]) {
      setPostText(networkTexts[targetFmt]);
      return;
    }

    if (targetFmt === 'linkedin') {
      const txt = networkTexts.linkedin || generatedPost;
      setPostText(txt);
      return;
    }

    // Adapt with API
    setIsAdapting(true);
    try {
      const basePost = networkTexts.linkedin || generatedPost || postText;
      const res = await fetch('/api/adapt-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: basePost,
          network: targetFmt,
        }),
      });
      const data = await res.json();
      if (data.post) {
        const finalTxt = targetFmt === 'x' ? formatTweetSafe(data.post, 275) : data.post;
        setNetworkTexts((prev) => ({ ...prev, [targetFmt]: finalTxt }));
        setPostText(finalTxt);
      } else {
        const fallback = targetFmt === 'x' ? formatTweetSafe(basePost, 275) : basePost;
        setNetworkTexts((prev) => ({ ...prev, [targetFmt]: fallback }));
        setPostText(fallback);
      }
    } catch (err) {
      const basePost = networkTexts.linkedin || generatedPost || postText;
      const fallback = targetFmt === 'x' ? formatTweetSafe(basePost, 275) : basePost;
      setNetworkTexts((prev) => ({ ...prev, [targetFmt]: fallback }));
      setPostText(fallback);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleCondenseForX = async () => {
    setIsAdapting(true);
    try {
      const res = await fetch('/api/adapt-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postText,
          network: 'x',
        }),
      });
      const data = await res.json();
      const newText = data.post ? formatTweetSafe(data.post, 275) : formatTweetSafe(postText, 275);
      setPostText(newText);
      setNetworkTexts((prev) => ({ ...prev, x: newText }));
    } catch {
      const newText = formatTweetSafe(postText, 275);
      setPostText(newText);
      setNetworkTexts((prev) => ({ ...prev, x: newText }));
    } finally {
      setIsAdapting(false);
    }
  };

  const handleTextChange = (val: string) => {
    setPostText(val);
    setNetworkTexts((prev) => ({
      ...prev,
      [activeFormat]: val,
    }));
  };

  const hasMedia = !!(autopilotVideoUrl || siteScreenshotUrl || siteOgImage);
  const mediaUrl = autopilotVideoUrl ? null : (siteScreenshotUrl || siteOgImage);

  const handleCopy = () => {
    const textToCopy = activeFormat === 'x' ? formatTweetSafe(postText, 280) : postText;
    navigator.clipboard.writeText(textToCopy);
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
    const textToShare = netId === 'x'
      ? (activeFormat === 'x' ? formatTweetSafe(postText, 275) : (networkTexts.x || formatTweetSafe(postText, 275)))
      : (activeFormat === netId ? postText : (networkTexts[netId] || postText));

    try {
      navigator.clipboard.writeText(textToShare);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
    setCopied(true);
    setLastSharedNetwork(netId);
    setTimeout(() => {
      setCopied(false);
      setLastSharedNetwork(null);
    }, 4500);

    const net = NETWORKS.find((n) => n.id === netId);
    if (!net) return;

    const formatUrl = (raw?: string, fallback = '') => {
      if (!raw) return fallback;
      const trimmed = raw.trim();
      if (!trimmed) return fallback;
      return trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
    };

    const url = net.getShareUrl(textToShare, targetUrl, {
      redditSubreddit: socialConnections?.redditUsername,
    });

    const directTargetUrl = (() => {
      if (netId === 'facebook') {
        if (socialConnections?.facebookPageName) {
          return formatUrl(socialConnections.facebookPageName);
        }
        if (targetUrl) {
          return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}`;
        }
        return 'https://www.facebook.com';
      }
      return url;
    })();

    if (typeof window !== 'undefined') {
      window.open(directTargetUrl, '_blank', 'noopener,noreferrer');
    }

    const profileOrFeedUrl = netId === 'linkedin'
      ? formatUrl(socialConnections?.linkedinProfileName, 'https://www.linkedin.com/feed/?shareActive=true')
      : netId === 'facebook'
      ? formatUrl(socialConnections?.facebookPageName, 'https://www.facebook.com')
      : netId === 'x'
      ? (socialConnections?.xHandle ? `https://twitter.com/${socialConnections.xHandle.replace(/^@/, '')}` : 'https://twitter.com')
      : (socialConnections?.redditUsername ? `https://www.reddit.com/r/${socialConnections.redditUsername.replace(/^[ru]\//, '')}` : 'https://www.reddit.com');

    setActiveNotification({
      title: `🎉 Fenêtre ${net.label} ouverte & Texte copié !`,
      message: `Votre publication est prête dans votre presse-papier. Rendez-vous sur l'onglet ${net.label} qui vient de s'ouvrir, faites simplement "Ctrl + V" (Coller) et cliquez sur Publier.`,
      network: netId,
      actionUrl: profileOrFeedUrl,
      actionLabel: `Voir mon compte ${net.label}`,
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
          {publishedPostUrl ? (
            <a
              href={publishedPostUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir mon post LinkedIn</span>
            </a>
          ) : (
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
          )}

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

      {/* 2. DIRECT LINKEDIN PUBLISH (0 Clic, 100% Officiel via OAuth) */}
      {linkedInAuth?.connected && (
        <div className="bg-gradient-to-r from-[#0A66C2] via-[#084e96] to-[#004182] text-white rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-[#0A66C2]/20 border border-blue-400/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white text-[#0A66C2] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              in
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>🚀</span> Publication Directe LinkedIn
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-blue-300/30 text-blue-100 font-bold">
                  0 Clic
                </span>
              </span>
              <span className="text-[11px] text-blue-100/80 block truncate">
                Connecté en tant que {linkedInAuth.profile?.name}
              </span>
            </div>
          </div>

          {publishedPostUrl ? (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={publishedPostUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Voir mon post sur LinkedIn</span>
              </a>
              <button
                type="button"
                onClick={handlePublishLinkedInDirect}
                disabled={isPublishingLinkedInDirect}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition cursor-pointer"
                title="Republier"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPublishingLinkedInDirect ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePublishLinkedInDirect}
              disabled={isPublishingLinkedInDirect}
              className="px-4 py-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-[#0A66C2] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
            >
              {isPublishingLinkedInDirect ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0A66C2]" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-[#0A66C2]" />
                  <span>Publier sur mon LinkedIn</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 2bis. DIRECT FACEBOOK PUBLISH (0 Clic, 100% Officiel via Meta Graph API) */}
      {facebookAuth?.connected && (
        <div className="bg-gradient-to-r from-[#1877F2] via-[#1565C0] to-[#0D47A1] text-white rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-[#1877F2]/20 border border-blue-400/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white text-[#1877F2] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              f
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>🚀</span> Publication Directe Page Facebook
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-blue-300/30 text-blue-100 font-bold">
                  0 Clic
                </span>
              </span>
              <span className="text-[11px] text-blue-100/80 block truncate">
                Page : {facebookAuth.page?.name}
              </span>
            </div>
          </div>

          {publishedFacebookUrl ? (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={publishedFacebookUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Voir mon post Facebook</span>
              </a>
              <button
                type="button"
                onClick={handlePublishFacebookDirect}
                disabled={isPublishingFacebookDirect}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition cursor-pointer"
                title="Republier"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPublishingFacebookDirect ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePublishFacebookDirect}
              disabled={isPublishingFacebookDirect}
              className="px-4 py-2 bg-white hover:bg-blue-50 disabled:opacity-50 text-[#1877F2] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
            >
              {isPublishingFacebookDirect ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1877F2]" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-[#1877F2]" />
                  <span>Publier sur ma Page Facebook</span>
                </>
              )}
            </button>
          )}
        </div>
      )}



      {/* 2ter. DIRECT X (TWITTER) PUBLISH (0 Clic, 100% Officiel via Twitter API v2) */}
      {twitterAuth?.connected && (
        <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-black text-white rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-black/20 border border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              𝕏
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>🚀</span> Publication Directe Tweet X
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-white/20 text-slate-100 font-bold">
                  0 Clic
                </span>
              </span>
              <span className="text-[11px] text-slate-300 block truncate">
                Connecté en tant que @{twitterAuth.user?.username || 'Votre Compte X'}
              </span>
            </div>
          </div>

          {publishedTwitterUrl ? (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={publishedTwitterUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Voir mon tweet sur X</span>
              </a>
              <button
                type="button"
                onClick={handlePublishTwitterDirect}
                disabled={isPublishingTwitterDirect}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition cursor-pointer"
                title="Republier"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPublishingTwitterDirect ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePublishTwitterDirect}
              disabled={isPublishingTwitterDirect}
              className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
            >
              {isPublishingTwitterDirect ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-slate-900" />
                  <span>Publier sur mon compte X</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 2quat. DIRECT REDDIT PUBLISH (0 Clic, 100% Officiel via Reddit API) */}
      {redditAuth?.connected && (
        <div className="bg-gradient-to-r from-[#FF4500] via-[#E03D00] to-[#C03500] text-white rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-[#FF4500]/20 border border-orange-400/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white text-[#FF4500] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              🤖
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>🚀</span> Publication Directe Reddit
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-white/20 text-white font-bold">
                  0 Clic
                </span>
              </span>
              <span className="text-[11px] text-orange-100 block truncate">
                Connecté en tant que u/{redditAuth.user?.name || 'Votre Compte'} {socialConnections?.redditUsername ? `• Cible: r/${socialConnections.redditUsername.replace(/^[ru]\//, '')}` : ''}
              </span>
            </div>
          </div>

          {publishedRedditUrl ? (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={publishedRedditUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Voir sur Reddit</span>
              </a>
              <button
                type="button"
                onClick={handlePublishRedditDirect}
                disabled={isPublishingRedditDirect}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition cursor-pointer"
                title="Republier"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPublishingRedditDirect ? 'animate-spin' : ''}`} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePublishRedditDirect}
              disabled={isPublishingRedditDirect}
              className="px-4 py-2 bg-white hover:bg-orange-50 disabled:opacity-50 text-[#FF4500] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
            >
              {isPublishingRedditDirect ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF4500]" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-[#FF4500]" />
                  <span>Poster sur Reddit</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 4. INSTANT 1-CLICK SHARE BAR (Manual fallback) */}
      <div className="space-y-1.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] px-1">
          <span className="font-bold text-slate-500 uppercase tracking-wider">
            Ouverture manuelle par réseau :
          </span>
          {(!linkedInAuth?.connected || !facebookAuth?.connected || !twitterAuth?.connected || !redditAuth?.connected) && (
            <button
              type="button"
              onClick={() => {
                if (onOpenSocialAccounts) onOpenSocialAccounts();
              }}
              className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 transition"
            >
              <span>🔗 Lier mes réseaux (0 Clic)</span>
            </button>
          )}
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
            {activeNotification.actionUrl ? (
              <a
                href={activeNotification.actionUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{activeNotification.actionLabel || 'Voir mon post sur LinkedIn'}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Recopier le texte</span>
              </button>
            )}
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
        {/* Network Format Switcher Tabs */}
        <div className="bg-slate-100/80 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">Format Réseau :</span>
            
            <button
              type="button"
              onClick={() => handleSwitchFormat('linkedin')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
                activeFormat === 'linkedin'
                  ? 'bg-[#0A66C2] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <span className="font-mono text-[10px]">in</span>
              <span>LinkedIn</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchFormat('x')}
              disabled={isAdapting}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
                activeFormat === 'x'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <span>𝕏</span>
              <span>X (280 car.)</span>
              {isAdapting && activeFormat === 'x' && <Loader2 className="w-3 h-3 animate-spin text-white" />}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchFormat('facebook')}
              disabled={isAdapting}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
                activeFormat === 'facebook'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <span className="font-mono text-[10px]">f</span>
              <span>Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchFormat('reddit')}
              disabled={isAdapting}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition text-xs cursor-pointer ${
                activeFormat === 'reddit'
                  ? 'bg-[#FF4500] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <span>🤖</span>
              <span>Reddit</span>
            </button>
          </div>

          {/* Real-time character limit gauge for X (Twitter) */}
          {activeFormat === 'x' && (
            <div className="flex items-center gap-2 ml-auto">
              {postText.length <= 280 ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ✓ {postText.length}/280 car. (Parfait pour X)
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full animate-pulse">
                    ⚠️ {postText.length}/280 (+{postText.length - 280} car.)
                  </span>
                  <button
                    type="button"
                    onClick={handleCondenseForX}
                    disabled={isAdapting}
                    className="px-2.5 py-1 bg-black hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer"
                  >
                    ⚡ Ajuster à 280 car.
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Meta */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs border border-slate-300">
              Vous
            </div>
            <div>
              <span className="font-bold text-slate-900 block leading-tight">
                {activeFormat === 'x' ? 'Tweet X' : activeFormat === 'facebook' ? 'Post Facebook' : activeFormat === 'reddit' ? 'Post Reddit' : 'Publication LinkedIn'}
              </span>
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
              onChange={(e) => handleTextChange(e.target.value)}
              rows={activeFormat === 'x' ? 6 : 12}
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
