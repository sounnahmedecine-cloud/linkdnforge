'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, ImageIcon, Download, ThumbsUp, MessageSquare, Repeat, Send, MoreHorizontal, Globe2, Sparkles, Film, Zap, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import StampNumber from '@/components/ui/StampNumber';
import ForgeLoader from '@/components/ui/ForgeLoader';
import Header from '@/components/layout/Header';
import VideoDropzone from '@/components/autopilot/VideoDropzone';
import {
  THEME_SLUGS,
  TONE_VALUES,
  FREQUENCY_VALUES,
  POST_OBJECTIVE_VALUES,
  POST_TYPE_VALUES,
  VISUAL_TYPE_VALUES,
} from '@/lib/onboardingOptions';

type Step = 1 | 2 | 3;

interface User {
  email: string;
  role: 'admin' | 'user';
  unlimited: boolean;
}

const ADMIN_EMAILS = [
  'sounnahmedecine@gmail.com',
  'abderelmalki@gmail.com',
  'contact@woosenteur.fr',
  'baba@woosenteur.fr',
];

export default function OnboardingPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('onboarding');
  const tNav = useTranslations('nav');
  const [activeTab, setActiveTab] = useState<'autopilot' | 'standard'>('autopilot');
  const [step, setStep] = useState<Step>(2);
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.role === 'admin' || (!!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  // Autopilot Video & Visual state
  const [autopilotVideoUrl, setAutopilotVideoUrl] = useState<string>('');
  const [autopilotVideoMeta, setAutopilotVideoMeta] = useState<{ name: string; size: number } | null>(null);
  const [postExplanation, setPostExplanation] = useState<any>(null);
  const [detectedClassification, setDetectedClassification] = useState<any>(null);
  const [tiktokPost, setTiktokPost] = useState<string>('');
  const [selectedNetworkView, setSelectedNetworkView] = useState<'linkedin' | 'tiktok'>('linkedin');
  const [siteScreenshotUrl, setSiteScreenshotUrl] = useState<string | null>(null);
  const [siteOgImage, setSiteOgImage] = useState<string | null>(null);
  const [activeVisualMode, setActiveVisualMode] = useState<'screenshot' | 'og'>('screenshot');
  const [mockupMediaView, setMockupMediaView] = useState<'video' | 'screenshot' | 'og'>('video');

  const [formData, setFormData] = useState({
    linkedinUrl: '',
    linkedinProfile: '',
    facebookProfile: '',
    facebookUrl: '',
    personalExamples: '',
    themes: [] as string[],
    editorialStyle: 'auto',
    tone: 'expert',
    frequency: '',
    postObjective: 'leads',
    postType: 'ghostwriter',
    postSubject: '',
    visualType: '',
    targetUrl: '',
  });
  const [scraping, setScraping] = useState<{ linkedin: boolean; facebook: boolean }>({ linkedin: false, facebook: false });
  const [scrapeStatus, setScrapeStatus] = useState<{ linkedin: string; facebook: string }>({ linkedin: '', facebook: '' });

  useEffect(() => {
    // Get user info from cookie
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    if (authCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
        setUser(userData);
      } catch (e) {
        // Cookie parsing failed
      }
    }

    // Load saved setup profile if available
    try {
      const savedProfile = localStorage.getItem('user_setup_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setFormData(prev => ({
          ...prev,
          linkedinUrl: parsed.linkedinUrl || prev.linkedinUrl,
          linkedinProfile: parsed.linkedinProfile || prev.linkedinProfile,
          personalExamples: parsed.personalExamples || prev.personalExamples,
        }));
      }
    } catch (e) {
      console.warn('Could not read user_setup_profile:', e);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const scrapeProfile = async (url: string, field: 'linkedin' | 'facebook') => {
    if (!url.startsWith('http')) return;
    setScraping(prev => ({ ...prev, [field]: true }));
    setScrapeStatus(prev => ({ ...prev, [field]: '' }));
    try {
      const res = await fetch('/api/scrape-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.data) {
        const profileField = field === 'linkedin' ? 'linkedinProfile' : 'facebookProfile';
        setFormData(prev => ({ ...prev, [profileField]: data.data }));
        setScrapeStatus(prev => ({ ...prev, [field]: t('step1.scrapeSuccess') }));
      } else {
        setScrapeStatus(prev => ({ ...prev, [field]: t('step1.scrapePrivate') }));
      }
    } catch {
      setScrapeStatus(prev => ({ ...prev, [field]: t('step1.scrapeError') }));
    } finally {
      setScraping(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const current = prev[field as keyof typeof prev];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [field]: current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value]
        };
      }
      return prev;
    });
  };

  const handleSingleSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const themes = THEME_SLUGS.map((slug) => ({ value: slug, label: t(`step2.themes.${slug}`) }));
  const tones = TONE_VALUES.map((value) => ({ value, label: t(`step2.tones.${value}`) }));
  const frequencies = FREQUENCY_VALUES.map((value) => ({ value, label: t(`step2.frequencies.${value}`) }));
  const postObjectives = POST_OBJECTIVE_VALUES.map((value) => ({ value, label: t(`step3.objectives.${value}`) }));
  const postTypes = POST_TYPE_VALUES.map((value) => ({ value, label: t(`step3.postTypes.${value}`) }));
  const visualTypes = VISUAL_TYPE_VALUES.map((value) => ({ value, label: t(`step3.visualTypes.${value}`) }));

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handlePrev = () => {
    if (step > 2) setStep((step - 1) as Step);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleForgePost = async () => {
    setIsGenerating(true);
    try {
      if (activeTab === 'autopilot') {
        const response = await fetch('/api/autopilot/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: autopilotVideoUrl,
            targetUrl: formData.targetUrl,
            videoMeta: autopilotVideoMeta,
            postSubject: formData.postSubject,
            editorialStyle: formData.editorialStyle || 'auto',
            tone: formData.tone,
            themes: formData.themes,
            postObjective: formData.postObjective,
            personalExamples: formData.personalExamples,
            linkedinProfile: formData.linkedinProfile,
            locale,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Erreur lors de la génération automatique');
        }

        const data = await response.json();
        setGeneratedPost(data.post);
        setTiktokPost(data.tiktokPost || '');
        setPostExplanation(data.explanation || null);
        setDetectedClassification(data.classification || null);
        setSiteScreenshotUrl(data.screenshotUrl || null);
        setSiteOgImage(data.ogImage || null);
        
        if (data.ogImage) {
          setActiveVisualMode('og');
        } else if (data.screenshotUrl) {
          setActiveVisualMode('screenshot');
        }

        if (autopilotVideoUrl) {
          setMockupMediaView('video');
        } else if (data.ogImage) {
          setMockupMediaView('og');
        } else if (data.screenshotUrl) {
          setMockupMediaView('screenshot');
        }
        return;
      }

      let targetUrlContent = undefined;
      if (formData.targetUrl) {
        try {
          const scrapeRes = await fetch('/api/scrape-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: formData.targetUrl })
          });
          if (scrapeRes.ok) {
            const data = await scrapeRes.json();
            targetUrlContent = data.data;
          }
        } catch (e) {
          console.error('Erreur scraping URL:', e);
        }
      }

      const response = await fetch('/api/forge-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, locale, targetUrlContent })
      });

      if (!response.ok) throw new Error('Erreur');
      const data = await response.json();
      setGeneratedPost(data.post);
    } catch (error: any) {
      console.error('Erreur:', error);
      setGeneratedPost(error.message || t('result.genericError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateVisual = async () => {
    setIsGeneratingImage(true);
    setImageError('');
    setGeneratedImage('');
    try {
      const response = await fetch('/api/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: generatedPost,
          visualType: formData.visualType,
          themes: formData.themes,
          locale,
        })
      });
      const data = await response.json();
      if (data.image) {
        setGeneratedImage(data.image);
      } else {
        setImageError(data.error || t('result.imageGenericError'));
      }
    } catch {
      setImageError(t('result.imageNetworkError'));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadImage = () => {
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `linkedin-visuel-${Date.now()}.png`;
    a.click();
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

  const [copiedTikTok, setCopiedTikTok] = useState(false);
  const handleCopyTikTok = () => {
    navigator.clipboard.writeText(tiktokPost);
    setCopiedTikTok(true);
    setTimeout(() => setCopiedTikTok(false), 2000);
  };

  const handleShareTikTokMobile = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: 'Mon Post TikTok / Reels',
          text: tiktokPost,
          url: formData.targetUrl || undefined,
        });
        return;
      } catch (e) {
        // Fallback to desktop web
      }
    }
    navigator.clipboard.writeText(tiktokPost);
    window.open('https://www.tiktok.com/upload', '_blank');
  };

  const handleShareInstagram = () => {
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

  const [isPublishingBuffer, setIsPublishingBuffer] = useState(false);
  const [bufferStatusMessage, setBufferStatusMessage] = useState<string | null>(null);

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
    <div className="min-h-screen bg-white text-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Header variant="app" user={user} onLogout={handleLogout} logoutLabel={tNav('logout')} />

        <div
          className={
            generatedPost || isGenerating
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-8'
              : 'max-w-2xl mx-auto'
          }
        >
          {/* Left: Form */}
          <div>
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('autopilot')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'autopilot'
                    ? 'bg-white text-orange-600 shadow-md shadow-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-orange-500" />
                Pilote Automatique (Vidéo + URL)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('standard')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'standard'
                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-4 h-4 text-slate-400" />
                Mode Standard (Texte)
              </button>
            </div>

            {activeTab === 'autopilot' ? (
              <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 space-y-6">
                <div>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                    Pilote Automatique Vidéo & URL
                  </h2>
                  <p className="text-sm text-slate-500">
                    Déposez une vidéo et une URL cible. L'IA écoute l'audio, analyse les images et rédige le post parfait avec votre Ghostwriter.
                  </p>
                </div>

                {/* Video Dropzone */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Film className="w-4 h-4 text-orange-500" />
                      1. Votre Vidéo (Optionnel)
                    </label>
                    <span className="text-xs text-slate-500">Priorité 1 (Analyse Audio & Vision)</span>
                  </div>
                  <VideoDropzone
                    onVideoUploaded={(url, meta) => {
                      setAutopilotVideoUrl(url);
                      setAutopilotVideoMeta(meta);
                    }}
                    onVideoRemoved={() => {
                      setAutopilotVideoUrl('');
                      setAutopilotVideoMeta(null);
                    }}
                  />
                </div>

                {/* Target URL */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-blue-500" />
                      2. URL du site ou produit (Optionnel)
                    </label>
                    <span className="text-xs text-slate-500">Priorité 2 (Scraping offre & proposition)</span>
                  </div>
                  <input
                    type="url"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleInputChange}
                    placeholder="https://woosenteur.fr/ ou votre site..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm shadow-sm"
                  />
                </div>

                {/* Free Subject / Angle */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      3. Sujet libre ou angle particulier (Optionnel)
                    </label>
                    <span className="text-xs text-slate-500">Priorité 3 (Si pas de vidéo ni d'URL)</span>
                  </div>
                  <textarea
                    name="postSubject"
                    value={formData.postSubject}
                    onChange={handleInputChange}
                    placeholder="Ex: Pourquoi déléguer la rédaction LinkedIn est la clé pour doubler ses leads en 2026..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm shadow-sm h-20 resize-none"
                  />
                </div>

                {/* 4. Style Rédactionnel (Format & Intention) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>📐</span> 4. Style rédactionnel (Format & Intention)
                    </label>
                    <span className="text-[11px] text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      Structure IA
                    </span>
                  </div>
                  
                  <select
                    name="editorialStyle"
                    value={formData.editorialStyle || 'auto'}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 shadow-sm"
                  >
                    <option value="auto">✨ Automatique — Recommandé (Analyse IA de la source)</option>
                    <option value="product">🛍️ Produit / E-commerce (Parfums, cosmétiques, fiches vente)</option>
                    <option value="expert">💼 Expertise / Thought Leadership</option>
                    <option value="editorial">📰 Éditorial / Analyse de fond</option>
                    <option value="educational">🎓 Éducatif / How-to & Conseils</option>
                    <option value="announcement">📢 Annonce / Nouveauté & Lancement</option>
                    <option value="story">📖 Storytelling & Coulisses</option>
                    <option value="news">📰 Actualité & Tendances factuelles</option>
                    <option value="testimonial">⭐ Avis client & Témoignage</option>
                  </select>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                    {formData.editorialStyle === 'product' ? (
                      <span><strong>Mode Produit :</strong> Présente le produit, ses notes/caractéristiques concrètes, l'univers sensoriel et invite directement à commander.</span>
                    ) : formData.editorialStyle === 'expert' ? (
                      <span><strong>Mode Expertise :</strong> Développe une thèse professionnelle : constat terrain → analyse → conviction forte → débat.</span>
                    ) : formData.editorialStyle === 'educational' ? (
                      <span><strong>Mode Éducatif :</strong> Guide l'audience étape par étape avec conseils concrets et erreurs à éviter.</span>
                    ) : formData.editorialStyle === 'announcement' ? (
                      <span><strong>Mode Annonce :</strong> Met l'accent sur la nouveauté, ce qui change et le bénéfice immédiat.</span>
                    ) : (
                      <span><strong>✨ Mode Automatique :</strong> LinkedInForge détecte automatiquement si votre contenu est un produit e-commerce, un article d'expertise ou une vidéo et adapte la structure idéale.</span>
                    )}
                  </div>
                </div>

                {/* 5. Ton Ghostwriter (Voix & Personnalité) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>🎭</span> 5. Ton de la voix (Ghostwriter)
                    </label>
                    <span className="text-[11px] text-slate-500">Personnalité & Vocabulaire</span>
                  </div>
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
                        onClick={() => handleSingleSelect('tone', tItem.value)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                          formData.tone === tItem.value
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                        }`}
                      >
                        {tItem.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Objective */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    6. Objectif de la publication
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {postObjectives.map((obj) => (
                      <button
                        key={obj.value}
                        type="button"
                        onClick={() => handleSingleSelect('postObjective', obj.value)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                          formData.postObjective === obj.value
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300'
                        }`}
                      >
                        {obj.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleForgePost}
                  disabled={isGenerating || (!autopilotVideoUrl && !formData.targetUrl && !formData.postSubject && formData.themes.length === 0)}
                  size="lg"
                  className="w-full py-4 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/25 transition-transform hover:scale-[1.01]"
                >
                  {isGenerating ? (
                    'Génération en cours...'
                  ) : autopilotVideoUrl ? (
                    '🚀 Analyser la Vidéo & Générer le Post'
                  ) : formData.targetUrl ? (
                    '🚀 Analyser l’URL & Générer le Post'
                  ) : (
                    '🚀 Rédiger avec le Ghostwriter'
                  )}
                </Button>
              </div>
            ) : (
            <>
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {[2, 3].map((num) => (
                <div key={num} className="flex items-center flex-1">
                  <StampNumber n={num} active={step >= num} />
                  {num < 3 && (
                    <div
                      className={`h-px flex-1 mx-2 transition ${
                        step > num ? 'bg-orange-500' : 'bg-slate-100'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-8 mb-8">
              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display font-bold text-3xl mb-2">
                      {t('step2.title')}
                    </h2>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('step2.themesTitle')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {themes.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => handleMultiSelect('themes', theme.value)}
                          className={`px-4 py-2 rounded-lg border transition font-medium text-sm ${
                            formData.themes.includes(theme.value)
                              ? 'bg-orange-500 border-orange-500 text-iron-950'
                              : 'border-slate-300 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('step2.toneTitle')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {tones.map((tone) => (
                        <button
                          key={tone.value}
                          onClick={() => handleSingleSelect('tone', tone.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.tone === tone.value
                              ? 'bg-orange-500 border-orange-500 text-iron-950'
                              : 'border-slate-300 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('step2.frequencyTitle')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {frequencies.map((freq) => (
                        <button
                          key={freq.value}
                          onClick={() => handleSingleSelect('frequency', freq.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.frequency === freq.value
                              ? 'bg-orange-500 border-orange-500 text-iron-950'
                              : 'border-slate-300 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display font-bold text-3xl mb-2">
                      {t('step3.title')}
                    </h2>
                    <p className="text-slate-500">{t('step3.subtitle')}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('step3.objectiveTitle')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {postObjectives.map((obj) => (
                        <button
                          key={obj.value}
                          onClick={() => handleSingleSelect('postObjective', obj.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.postObjective === obj.value
                              ? 'bg-orange-500 border-orange-500 text-iron-950'
                              : 'border-slate-300 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {obj.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('step3.postTypeTitle')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {postTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleSingleSelect('postType', type.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.postType === type.value
                              ? 'bg-orange-500 border-orange-500 text-iron-950'
                              : 'border-slate-300 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      URL du site ou article à promouvoir (Optionnel)
                    </label>
                    <p className="text-xs text-slate-500 mb-2">Collez un lien (SaaS, blog) que l'IA va lire pour générer votre post.</p>
                    <input
                      type="text"
                      name="targetUrl"
                      value={formData.targetUrl}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="w-full bg-slate-100/60 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-smoke-500/60 focus:outline-none focus:border-orange-500 mb-6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700">
                      {t('step3.subjectLabel')}
                    </label>
                    <textarea
                      name="postSubject"
                      value={formData.postSubject}
                      onChange={handleInputChange}
                      placeholder={t('step3.subjectPlaceholder')}
                      className="w-full bg-slate-100/60 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-smoke-500/60 focus:outline-none focus:border-orange-500 h-20 resize-none"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t('step3.visualTypeTitle')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {visualTypes.map((visual) => (
                        <button
                          key={visual.value}
                          onClick={() => handleSingleSelect('visualType', visual.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.visualType === visual.value
                              ? 'bg-orange-500 border-orange-500 text-iron-950'
                              : 'border-slate-300 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {visual.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleForgePost}
                    disabled={isGenerating}
                    size="lg"
                    className="w-full"
                  >
                    {isGenerating ? t('step3.forgingBtn') : t('step3.forgeBtn')}
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-3">
                <Button onClick={handlePrev} disabled={step === 2} variant="outline">
                  {t('prev')}
                </Button>
                {step < 3 ? <Button onClick={handleNext}>{t('next')}</Button> : <span />}
              </div>
              <p className="text-center font-mono text-slate-500 text-xs uppercase tracking-widest">
                {t('stepLabel', { step })}
              </p>
            </div>
            </>
            )}
          </div>

          {/* Right: Generated Post */}
          {(generatedPost || isGenerating) && (
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:rounded-2xl">
              <div className="bg-slate-50/50 backdrop-blur border border-slate-200 rounded-2xl p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="font-display font-bold text-2xl">{t('result.title')}</h2>

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
                  <div className="bg-slate-100/50 rounded-lg p-6 border border-slate-300 space-y-4">
                    <ForgeLoader label={t('result.generatingLabel')} />
                    <div className="space-y-3 pt-2">
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-4/6" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-full mt-4" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6" />
                    </div>
                  </div>
                ) : selectedNetworkView === 'tiktok' && tiktokPost ? (
                  /* Dedicated TikTok & Reels View */
                  <div className="bg-slate-950 text-white rounded-2xl p-6 my-6 shadow-2xl border border-slate-800 space-y-4 font-sans animate-in fade-in duration-300">
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
                          copiedTikTok
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-slate-950 hover:bg-slate-200'
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

                    {isAdmin ? (
                      /* Founder Buffer Direct MCP (Only visible to admin/founder) */
                      <div className="pt-3 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                            👑 Espace Fondateur (Buffer MCP)
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                            ✓ Vos Comptes Connectés
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
                            Publier sur TikTok (@abbi.muslim)
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePublishBuffer('instagram')}
                            disabled={isPublishingBuffer}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white transition shadow-md shadow-pink-500/10"
                          >
                            {isPublishingBuffer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>📸</span>}
                            Publier sur Insta (@aa.mina212)
                          </button>
                        </div>
                        {bufferStatusMessage && (
                          <p className="text-xs text-center font-semibold text-emerald-400 mt-1 animate-in fade-in">
                            {bufferStatusMessage}
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Regular Client Users: 1-Click Universal Posting & Tips */
                      <div className="pt-3 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                            ⚡ Publier sur vos Réseaux Sociaux
                          </span>
                          <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-800 px-2 py-0.5 rounded-full">
                            1-Clic Presse-Papier
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleShareTikTokMobile}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-slate-900 text-white border border-slate-700 transition"
                          >
                            <span>🎵</span>
                            Ouvrir & Poster sur TikTok
                          </button>
                          <button
                            type="button"
                            onClick={handleShareInstagram}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white transition shadow-md shadow-pink-500/10"
                          >
                            <span>📸</span>
                            Ouvrir & Poster sur Instagram
                          </button>
                        </div>
                        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                          <span className="text-amber-400 text-sm mt-0.5">💡</span>
                          <div>
                            <strong className="text-slate-300">Prêt à poster en 5 secondes :</strong> La légende avec les crochets viraux et les hashtags est copiée dans votre presse-papier dès le clic. Téléchargez votre média et collez votre texte directement sur l'application !
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                <>
                {/* 2-Step AI Classification Card */}
                {detectedClassification && (
                  <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white border border-orange-200/90 rounded-2xl p-4 my-4 space-y-2.5 shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                            Style Détecté : {detectedClassification.detectedLabel}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Intention : {detectedClassification.primaryIntent} · Audience : {detectedClassification.audience}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                        IA 2-Étapes
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {detectedClassification.detectedReason}
                    </p>

                    {detectedClassification.recommendedStructure && detectedClassification.recommendedStructure.length > 0 && (
                      <div className="pt-2 border-t border-orange-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-slate-800">Structure appliquée :</span>
                        {detectedClassification.recommendedStructure.map((step: string, sIdx: number) => (
                          <span key={sIdx} className="inline-flex items-center gap-1 bg-white border border-slate-200/90 px-2 py-0.5 rounded-md text-slate-700 font-medium shadow-2xs">
                            <span className="text-orange-500 font-bold">{sIdx + 1}.</span> {step}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* LinkedIn & Facebook Mockup */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden font-sans shadow-sm my-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                      <svg className="w-6 h-6 text-slate-400 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-[15px] truncate hover:text-blue-600 hover:underline cursor-pointer leading-tight">
                        Vous
                      </h3>
                      <p className="text-slate-500 text-xs truncate leading-snug">Créateur(rice) & Expert(e) de votre domaine</p>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <span>À l'instant</span>
                        <span>•</span>
                        <Globe2 className="w-3 h-3" />
                      </div>
                    </div>
                    <button className="text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition self-start">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Body */}
                  <div className="px-4 pb-2 text-[14px] text-slate-900 leading-[1.5] whitespace-pre-wrap break-words">
                    {generatedPost}
                  </div>

                  {/* Media Switcher in Mockup when multiple media exist */}
                  {(autopilotVideoUrl && (siteScreenshotUrl || siteOgImage)) && (
                    <div className="mx-4 mb-2.5 flex items-center justify-between p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-600 pl-2">Média affiché :</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setMockupMediaView('video')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition ${
                            mockupMediaView === 'video'
                              ? 'bg-white shadow text-slate-900 font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          🎥 Vidéo
                        </button>
                        {siteScreenshotUrl && (
                          <button
                            type="button"
                            onClick={() => setMockupMediaView('screenshot')}
                            className={`px-2.5 py-1 rounded-lg font-medium transition ${
                              mockupMediaView === 'screenshot'
                                ? 'bg-white shadow text-orange-600 font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            📸 Capture Hero du site
                          </button>
                        )}
                        {siteOgImage && (
                          <button
                            type="button"
                            onClick={() => setMockupMediaView('og')}
                            className={`px-2.5 py-1 rounded-lg font-medium transition ${
                              mockupMediaView === 'og'
                                ? 'bg-white shadow text-blue-600 font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            🖼️ Image Produit
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Video Attachment in Mockup */}
                  {autopilotVideoUrl && (mockupMediaView === 'video' || (!siteScreenshotUrl && !siteOgImage)) && (
                    <div className="mx-4 mb-3 rounded-xl overflow-hidden bg-black aspect-video max-h-72 border border-slate-200 shadow-inner flex items-center justify-center">
                      <video src={autopilotVideoUrl} controls className="w-full h-full object-contain" />
                    </div>
                  )}

                  {/* Website Hero Screenshot or OG Image in Mockup */}
                  {(siteScreenshotUrl || siteOgImage) && (mockupMediaView === 'screenshot' || mockupMediaView === 'og' || !autopilotVideoUrl) && (
                    <div className="mx-4 mb-3 space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-video max-h-72 group">
                        <img
                          src={mockupMediaView === 'og' && siteOgImage ? siteOgImage : (siteScreenshotUrl || siteOgImage || '')}
                          alt="Capture du site ou produit"
                          className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                          <span>{mockupMediaView === 'og' ? '🖼️ Image Produit' : '📸 Capture Hero du site'}</span>
                        </div>
                        <button
                          onClick={handleDownloadScreenshot}
                          className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition"
                          title="Télécharger l'image pour votre post"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Télécharger l'image
                        </button>
                      </div>
                      {siteScreenshotUrl && siteOgImage && (
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => { setMockupMediaView('screenshot'); setActiveVisualMode('screenshot'); }}
                            className={`px-2.5 py-1 rounded-md font-medium transition ${
                              mockupMediaView === 'screenshot'
                                ? 'bg-orange-100 text-orange-700 font-bold'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Capture Hero
                          </button>
                          <button
                            type="button"
                            onClick={() => { setMockupMediaView('og'); setActiveVisualMode('og'); }}
                            className={`px-2.5 py-1 rounded-md font-medium transition ${
                              mockupMediaView === 'og'
                                ? 'bg-orange-100 text-orange-700 font-bold'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Image Produit (OG)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Metrics */}
                  <div className="px-4 py-2 mt-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-200">
                    <div className="flex items-center gap-1">
                      <span className="bg-blue-600 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center text-[10px]">👍</span>
                      <span className="bg-rose-500 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center text-[10px] -ml-1">❤️</span>
                      <span className="ml-1">Vous et 42 autres personnes</span>
                    </div>
                    <div>
                      <span className="hover:text-blue-600 hover:underline cursor-pointer">12 commentaires</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="px-2 py-1 flex items-center justify-between">
                    <button className="flex-1 flex items-center justify-center gap-2 text-slate-500 font-semibold text-[14px] py-3 rounded hover:bg-slate-100 transition">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="hidden sm:inline">J'aime</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 text-slate-500 font-semibold text-[14px] py-3 rounded hover:bg-slate-100 transition">
                      <MessageSquare className="w-5 h-5" />
                      <span className="hidden sm:inline">Commenter</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 text-slate-500 font-semibold text-[14px] py-3 rounded hover:bg-slate-100 transition">
                      <Repeat className="w-5 h-5" />
                      <span className="hidden sm:inline">Republier</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 text-slate-500 font-semibold text-[14px] py-3 rounded hover:bg-slate-100 transition">
                      <Send className="w-5 h-5" />
                      <span className="hidden sm:inline">Envoyer</span>
                    </button>
                  </div>
                </div>
                </>
                )}

                {postExplanation && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        Pourquoi ce post ? (Transparence & Qualité)
                      </div>
                      {postExplanation.qualityCheck && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>✓</span> Source-Check IA Validé
                        </span>
                      )}
                    </div>

                    {((postExplanation.sources?.videoFindings && postExplanation.sources.videoFindings.length > 0) || (postExplanation.videoInsights && postExplanation.videoInsights.length > 0)) && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-orange-500" /> Faits et messages extraits de la vidéo :
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                          {(postExplanation.sources?.videoFindings || postExplanation.videoInsights).map((pt: string, idx: number) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {postExplanation.analysis?.visualElements && postExplanation.analysis.visualElements.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <span>👁️</span> Éléments visuels identifiés à l'écran :
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                          {postExplanation.analysis.visualElements.map((pt: string, idx: number) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {((postExplanation.sources?.webpageFindings && postExplanation.sources.webpageFindings.length > 0) || (postExplanation.urlInsights && postExplanation.urlInsights.length > 0)) && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Globe2 className="w-3.5 h-3.5 text-blue-500" /> Proposition de valeur extraite du site web :
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                          {(postExplanation.sources?.webpageFindings || postExplanation.urlInsights).map((pt: string, idx: number) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {postExplanation.ghostwriterStyle && (
                      <div className="text-xs text-slate-600 border-t border-slate-100 pt-2.5 flex items-start gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Style Ghostwriter appliqué :</strong> {postExplanation.ghostwriterStyle}</span>
                      </div>
                    )}
                  </div>
                )}

                {!isGenerating && (<>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-[#0A66C2] hover:bg-[#004182] text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    {t('result.publishBtn')}
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-[#1877F2] hover:bg-[#0c5fc7] text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    {t('result.shareBtn')}
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-black hover:bg-slate-800 text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Publier sur X
                  </button>
                  <button
                    onClick={handleShareReddit}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-[#FF4500] hover:bg-[#cc3700] text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-6.07-1.72.08-1.1.4-3.05 1.52-3.7.72-.4 1.73-.24 3 .5C17.2 6.3 18.46 7.5 20 7.5c1.65 0 3-1.35 3-3s-1.35-3-3-3c-1.38 0-2.54.94-2.88 2.22-1.43-.72-2.64-.8-3.6-.25-1.64.94-1.95 3.47-2 4.55-2.33.08-4.45.7-6.1 1.72C4.86 8.98 3.96 8.5 3 8.5c-1.65 0-3 1.35-3 3 0 1.32.84 2.44 2.05 2.84-.03.22-.05.44-.05.66 0 3.86 4.5 7 10 7s10-3.14 10-7c0-.22-.02-.44-.05-.66 1.21-.4 2.05-1.52 2.05-2.84zM2.3 11.5c0-1.1.9-2 2-2 .6 0 1.15.28 1.52.7-1.65.65-3.03 1.58-4.14 2.7.27-1.07 1-2.26 2.62-3.4zM12 21c-4.45 0-8.5-2.68-8.5-5.5C3.5 12.68 7.55 10 12 10s8.5 2.68 8.5 5.5c0 2.82-4.05 5.5-8.5 5.5zm5.12-6.55c.82 0 1.5-.68 1.5-1.5s-.68-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5zM7.88 14.45c0-.83.68-1.5 1.5-1.5s1.5.67 1.5 1.5-.68 1.5-1.5 1.5-1.5-.67-1.5-1.5zm6.86 2.58c-.37.38-1.4.74-2.74.74s-2.36-.36-2.73-.74c-.18-.18-.18-.46 0-.64.18-.18.47-.18.65 0 .2.2 1.05.5 2.08.5 1.04 0 1.88-.3 2.08-.5.18-.18.47-.18.65 0 .18.18.18.46 0 .64z"/></svg>
                    Publier sur Reddit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition border ${
                      copied
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                        : 'border-slate-300 text-slate-700 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? t('result.copiedBtn') : t('result.copyBtn')}
                  </button>
                  <button
                    onClick={() => { setGeneratedPost(''); setGeneratedImage(''); setStep(3); }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm border border-slate-300 text-slate-700 hover:border-slate-300 hover:text-slate-900 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('result.regenerateBtn')}
                  </button>
                </div>

                {/* Captured Webpage or Product Hero Visual */}
                {(siteScreenshotUrl || siteOgImage) && (
                  <div className="border-t border-slate-200 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <span>📸</span> Visuel capturé de la page
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>✓</span> Haute Définition
                      </span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video max-h-56 bg-slate-100 group shadow-sm">
                      <img
                        src={activeVisualMode === 'screenshot' && siteScreenshotUrl ? siteScreenshotUrl : (siteOgImage || siteScreenshotUrl || '')}
                        alt="Capture Hero de la page"
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                        {activeVisualMode === 'og' && siteOgImage ? '🖼️ Photo Produit' : '📸 Capture Hero du site'}
                      </div>
                      <button
                        onClick={handleDownloadScreenshot}
                        className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Télécharger le visuel (HD)
                      </button>
                    </div>

                    {siteScreenshotUrl && siteOgImage && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setActiveVisualMode('screenshot'); setMockupMediaView('screenshot'); }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                            activeVisualMode === 'screenshot'
                              ? 'bg-orange-50 border-orange-300 text-orange-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          📸 Capture Hero du site
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveVisualMode('og'); setMockupMediaView('og'); }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                            activeVisualMode === 'og'
                              ? 'bg-orange-50 border-orange-300 text-orange-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          🖼️ Photo Produit (OG)
                        </button>
                      </div>
                    )}
                  </div>
                )}
                </>)}
                {/* Legal disclaimer */}
                <p className="text-xs text-slate-500/70 leading-relaxed border-t border-slate-200/60 pt-4">
                  {t('result.disclaimer')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
