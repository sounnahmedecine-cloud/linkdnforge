'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    linkedinUrl: '',
    linkedinProfile: '',
    facebookProfile: '',
    themes: [] as string[],
    tone: '',
    frequency: '',
    postObjective: '',
    postType: '',
    postSubject: '',
    visualType: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <span className="text-2xl" suppressHydrationWarning>in</span>
            <h1 className="text-2xl font-bold">LinkedInForge</h1>
            <span className="text-xs bg-blue-600 px-3 py-1 rounded-full">Beta</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-slate-600 text-slate-300 hover:text-white rounded-lg hover:border-slate-500 transition text-sm"
          >
            Déconnexion
          </button>
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
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        URL de votre profil LinkedIn public
                      </label>
                      <input
                        type="text"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="https://www.linkedin.com/in/..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Profil LinkedIn
                      </label>
                      <textarea
                        name="linkedinProfile"
                        value={formData.linkedinProfile}
                        onChange={handleInputChange}
                        placeholder="Copiez-collez le contenu de votre profil LinkedIn..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-32 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Profil Facebook (Optionnel)
                      </label>
                      <textarea
                        name="facebookProfile"
                        value={formData.facebookProfile}
                        onChange={handleInputChange}
                        placeholder="Infos de votre page Facebook..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-24 resize-none"
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
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 space-y-6">
                <h2 className="text-2xl font-bold">📝 Votre post LinkedIn</h2>

                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600 max-h-96 overflow-y-auto">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{generatedPost}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleShareLinkedIn}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    💼 Publier sur LinkedIn
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    👥 Publier sur Facebook
                  </button>
                  <button
                    onClick={handleCopy}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    {copied ? '✓ Copié!' : '📋 Copier'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setGeneratedPost('');
                    setStep(3);
                  }}
                  className="w-full border border-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition"
                >
                  ✨ Régénérer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
