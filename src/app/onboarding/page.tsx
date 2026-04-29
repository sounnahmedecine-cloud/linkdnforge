'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Check, RefreshCw, ImageIcon, Download } from 'lucide-react';

type Step = 1 | 2 | 3;

interface User {
  email: string;
  role: 'admin' | 'user';
  unlimited: boolean;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    linkedinUrl: '',
    linkedinProfile: '',
    facebookProfile: '',
    facebookUrl: '',
    personalExamples: '',
    themes: [] as string[],
    tone: '',
    frequency: '',
    postObjective: '',
    postType: '',
    postSubject: '',
    visualType: '',
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
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        setScrapeStatus(prev => ({ ...prev, [field]: '✓ Profil extrait automatiquement' }));
      } else {
        setScrapeStatus(prev => ({ ...prev, [field]: '⚠ Profil privé — collez le contenu manuellement' }));
      }
    } catch {
      setScrapeStatus(prev => ({ ...prev, [field]: '⚠ Erreur — collez le contenu manuellement' }));
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

  const themes = [
    'Tech', 'SaaS B2B', 'IA et Automatisation', 'Marketing Digital',
    'Freelancing', 'E-commerce', 'Dev Web/Mobile',
    'RH', 'Finance', 'Immobilier',
    'Santé', 'Coaching', 'Dev Personnel',
    'Education', 'Commerce'
  ];

  const tones = [
    { value: 'expert', label: 'Expert' },
    { value: 'peda', label: 'Pedagogique' },
    { value: 'story', label: 'Storytelling' },
    { value: 'humour', label: 'Humour' },
    { value: 'inspirant', label: 'Inspirant' }
  ];

  const frequencies = [
    { value: '1-day', label: '1 post/jour' },
    { value: '3-week', label: '3 posts/semaine' },
    { value: '1-week', label: '1 post/semaine' }
  ];

  const postObjectives = [
    { value: 'leads', label: 'Generation de leads' },
    { value: 'visibility', label: 'Visibilite' },
  ];

  const postTypes = [
    { value: 'ghostwriter', label: '✍️ Ghostwriter' },
    { value: 'story', label: 'Story personnelle' },
    { value: 'advice', label: 'Conseils' },
    { value: 'carousel', label: 'Carrousel' },
  ];

  const visualTypes = [
    { value: 'image', label: 'Image Illustrative' },
    { value: 'quote', label: 'Carte Citation' }
  ];

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handlePrev = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleForgePost = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/forge-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erreur');
      const data = await response.json();
      setGeneratedPost(data.post);
    } catch (error) {
      console.error('Erreur:', error);
      setGeneratedPost('Erreur lors de la génération du post. Vérifiez votre clé API.');
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
        })
      });
      const data = await response.json();
      if (data.image) {
        setGeneratedImage(data.image);
      } else {
        setImageError(data.error || 'Erreur lors de la génération');
      }
    } catch {
      setImageError('Erreur réseau');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12" suppressHydrationWarning>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <span className="text-2xl" suppressHydrationWarning>in</span>
              <h1 className="text-2xl font-bold">LinkedInForge</h1>
              <span className="text-xs bg-blue-600 px-3 py-1 rounded-full">Beta</span>
            </Link>
            {user?.role === 'admin' && (
              <span className="text-xs bg-orange-600/80 px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
                👑 Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user?.email && (
              <span className="text-sm text-slate-400">{user.email}</span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-slate-600 text-slate-300 hover:text-white rounded-lg hover:border-slate-500 transition text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div>
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition text-sm ${
                      step >= num
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {num}
                  </div>
                  {num < 3 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition ${
                        step > num ? 'bg-orange-500' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      1. Vos informations
                    </h2>
                    <p className="text-slate-400">Remplissez vos infos LinkedIn</p>
                  </div>

                  <div className="space-y-6">
                    {/* LinkedIn URL + auto-scrape */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        URL de votre profil LinkedIn
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={handleInputChange}
                          placeholder="https://www.linkedin.com/in/..."
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => scrapeProfile(formData.linkedinUrl, 'linkedin')}
                          disabled={scraping.linkedin || !formData.linkedinUrl}
                          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold text-sm transition whitespace-nowrap"
                        >
                          {scraping.linkedin ? '⏳' : '🔍 Extraire'}
                        </button>
                      </div>
                      {scrapeStatus.linkedin && (
                        <p className={`text-xs mt-1 ${scrapeStatus.linkedin.startsWith('✓') ? 'text-green-400' : 'text-orange-400'}`}>
                          {scrapeStatus.linkedin}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Contenu du profil LinkedIn
                      </label>
                      <textarea
                        name="linkedinProfile"
                        value={formData.linkedinProfile}
                        onChange={handleInputChange}
                        placeholder="Auto-rempli après extraction, ou collez manuellement : titre, bio, expériences..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-28 resize-none"
                      />
                    </div>

                    {/* Facebook URL + auto-scrape */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        URL page Facebook (Optionnel)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="facebookUrl"
                          value={formData.facebookUrl}
                          onChange={handleInputChange}
                          placeholder="https://www.facebook.com/..."
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => scrapeProfile(formData.facebookUrl, 'facebook')}
                          disabled={scraping.facebook || !formData.facebookUrl}
                          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold text-sm transition whitespace-nowrap"
                        >
                          {scraping.facebook ? '⏳' : '🔍 Extraire'}
                        </button>
                      </div>
                      {scrapeStatus.facebook && (
                        <p className={`text-xs mt-1 ${scrapeStatus.facebook.startsWith('✓') ? 'text-green-400' : 'text-orange-400'}`}>
                          {scrapeStatus.facebook}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Contenu page Facebook
                      </label>
                      <textarea
                        name="facebookProfile"
                        value={formData.facebookProfile}
                        onChange={handleInputChange}
                        placeholder="Auto-rempli ou collez manuellement..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-20 resize-none"
                      />
                    </div>

                    {/* Personal examples */}
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Vos posts précédents <span className="text-orange-400">(recommandé pour le mode Ghostwriter)</span>
                      </label>
                      <p className="text-xs text-slate-400 mb-2">Collez 2-3 de vos meilleurs posts LinkedIn — l'IA va copier votre style exact</p>
                      <textarea
                        name="personalExamples"
                        value={formData.personalExamples}
                        onChange={handleInputChange}
                        placeholder="Post 1 : J'ai lancé mon SaaS sans lever de fonds...&#10;&#10;Post 2 : La vérité sur le cold outreach LinkedIn..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 h-36 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      2. Votre strategie de contenu
                    </h2>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thematique</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {themes.map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleMultiSelect('themes', theme)}
                          className={`px-4 py-2 rounded-lg border transition font-medium text-sm ${
                            formData.themes.includes(theme)
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Ton</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {tones.map((tone) => (
                        <button
                          key={tone.value}
                          onClick={() => handleSingleSelect('tone', tone.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.tone === tone.value
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Frequence</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {frequencies.map((freq) => (
                        <button
                          key={freq.value}
                          onClick={() => handleSingleSelect('frequency', freq.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.frequency === freq.value
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-600 text-slate-300 hover:border-slate-500'
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
                    <h2 className="text-3xl font-bold mb-2">
                      3. Choisissez vos options
                    </h2>
                    <p className="text-slate-400">Finalisez votre post</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Objectif du post</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {postObjectives.map((obj) => (
                        <button
                          key={obj.value}
                          onClick={() => handleSingleSelect('postObjective', obj.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.postObjective === obj.value
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {obj.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Type de post</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {postTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleSingleSelect('postType', type.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.postType === type.value
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Sujet du post (Optionnel)
                    </label>
                    <textarea
                      name="postSubject"
                      value={formData.postSubject}
                      onChange={handleInputChange}
                      placeholder="Decrivez votre idee..."
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-20 resize-none"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Type de visuel</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {visualTypes.map((visual) => (
                        <button
                          key={visual.value}
                          onClick={() => handleSingleSelect('visualType', visual.value)}
                          className={`px-4 py-3 rounded-lg border transition font-medium text-center text-sm ${
                            formData.visualType === visual.value
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {visual.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleForgePost}
                    disabled={isGenerating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-4 rounded-lg transition"
                  >
                    {isGenerating ? '⚡ Forgeage en cours...' : 'Forger le post'}
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={step === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  step === 1
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'border border-slate-600 text-white hover:bg-slate-700'
                }`}
              >
                Precedent
              </button>

              <span className="text-slate-400 text-sm">
                Etape {step} sur 3
              </span>

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Suivant
                </button>
              ) : null}
            </div>
          </div>

          {/* Right: Generated Post */}
          {generatedPost && (
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:rounded-2xl">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 space-y-6">
                <h2 className="text-2xl font-bold">Votre post LinkedIn</h2>

                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{generatedPost}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-[#0A66C2] hover:bg-[#004182] text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Publier
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-[#1877F2] hover:bg-[#0c5fc7] text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Partager
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition border ${
                      copied
                        ? 'border-green-500 text-green-400 bg-green-500/10'
                        : 'border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                  <button
                    onClick={() => { setGeneratedPost(''); setGeneratedImage(''); setStep(3); }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Régénérer
                  </button>
                </div>

                {/* Visual generation */}
                <div className="border-t border-slate-700 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-300">Visuel LinkedIn</p>
                    <span className="text-xs text-slate-500">
                      {formData.visualType === 'quote' ? 'Carte Citation' : formData.visualType === 'image' ? 'Image Illustrative' : 'Sélectionnez un type en étape 3'}
                    </span>
                  </div>

                  {!generatedImage ? (
                    <>
                      <button
                        onClick={handleGenerateVisual}
                        disabled={isGeneratingImage || !formData.visualType}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {isGeneratingImage ? 'Génération en cours...' : 'Générer le visuel'}
                      </button>
                      {imageError && (
                        <p className="text-xs text-red-400">{imageError}</p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <img
                        src={generatedImage}
                        alt="Visuel LinkedIn généré"
                        className="w-full rounded-lg border border-slate-600"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleDownloadImage}
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white transition"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                        <button
                          onClick={handleGenerateVisual}
                          disabled={isGeneratingImage}
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Nouveau
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legal disclaimer */}
                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-700/50 pt-4">
                  Cet outil peut afficher des contenus inexacts. Vous êtes seul responsable de l'utilisation du contenu généré, y compris sa conformité aux lois applicables et aux droits des tiers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
