'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Loader2,
  Film,
  Globe2,
  Lightbulb,
  Check,
  Copy,
  Share2,
  Zap,
  TrendingUp,
  PenLine,
  MailCheck,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { trackAuth, trackCtaClick, trackLandingStep } from '@/lib/analytics';
import { getClientProfile, sendMagicLink, signInWithGoogle } from '@/lib/auth/client';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import {
  btnGhost,
  btnPrimary,
  Chip,
  FLOW_AUTOSTART_KEY,
  IDEA_STARTERS,
  normalizeUrl,
  TONES,
  URL_PATTERN,
  type FlowAutostart,
} from '@/components/ui/flow';

const PREVIEW_DEMOS = [
  {
    id: 'video',
    label: '🎥 Vidéo brute',
    sourceTitle: 'YouTube / MP4 (04:12)',
    sourceDesc: 'Analyse audio, moments clés & synthèse thématique',
    inputPreview: '🎙️ "3 erreurs qui nous ont coûté 45 000€ au lancement de notre SaaS..."',
    postHook: 'On a perdu 45 000€ en pensant que notre produit se vendrait tout seul.',
    postBody: [
      'Voici les 3 leçons brutales qu\'aucun livre de business ne vous apprendra :',
      '1. Un bon produit sans distribution n\'existe pas.',
      '2. Vos premiers clients n\'achètent pas des fonctionnalités, mais du temps.',
      '3. Vendez toujours l\'offre avant d\'écrire la première ligne de code.',
      'Et vous, quelle a été votre plus grosse erreur de lancement ?'
    ],
    tags: '#entrepreneuriat #saas #business',
    aiAnalysis: 'Compréhension audio · Détection des 3 leçons · Hook à fort arrêt sur scroll'
  },
  {
    id: 'url',
    label: '🔗 URL / Page Web',
    sourceTitle: 'https://monsite.com/produit',
    sourceDesc: 'Scraping complet, capture Hero & extraction de la proposition de valeur',
    inputPreview: '🌐 "Page d\'accueil : Logiciel de facturation automatisée pour freelances"',
    postHook: 'Pourquoi 80% des freelances passent leurs dimanches à faire des devis ?',
    postBody: [
      'Parce qu\'ils utilisent encore des tableurs de 2012.',
      'En automatisant la relance et l\'émission en 1 clic :',
      '→ 4 heures récupérées par semaine',
      '→ 0 impayé oublié',
      '→ Une trésorerie prévisible.',
      'Le temps est votre seule ressource non renouvelable. Ne le gaspillez plus.'
    ],
    tags: '#freelance #productivite #gestion',
    aiAnalysis: 'Scraping de l\'offre · Extraction des bénéfices · Structure persuasive'
  },
  {
    id: 'idea',
    label: '💡 Idée brute',
    sourceTitle: 'Mémo ou 2 lignes de texte',
    sourceDesc: 'Ghostwriter IA : application de votre voix et mise en page magnétique',
    inputPreview: '📝 "Arrêter de poster pour faire du bruit. Vaut mieux 1 vrai post utile que 5 textes génériques."',
    postHook: 'Poster tous les jours ne sert à rien si vous n\'avez rien à dire.',
    postBody: [
      'Le plus grand piège sur LinkedIn en 2026 :',
      'Confondre visibilité superficielle et autorité réelle.',
      'Un seul post documenté, basé sur une vraie expérience vécue, génère 10x plus d\'opportunités en message privé que 5 posts creux rédigés par un robot.',
      'Moins de bruit, plus d\'impact.'
    ],
    tags: '#branding #createurs #linkedin',
    aiAnalysis: 'Ghostwriter appliqué · Phrases courtes et percutantes · Structure conversationnelle'
  }
];

export default function LandingLeadCapture() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [signedInEmail, setSignedInEmail] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // Mini-parcours : 1 source → 2 ton → 3 e-mail, puis génération automatique dans le studio
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sourceText, setSourceText] = useState('');
  const [tone, setTone] = useState('expert');

  const trimmedSource = sourceText.trim();
  const isUrl = URL_PATTERN.test(trimmedSource);

  const handleSourceContinue = () => {
    if (trimmedSource.length < 3) return;
    if (isUrl) setSourceText(normalizeUrl(trimmedSource));
    trackLandingStep(1, 'source', { source_type: isUrl ? 'url' : 'idea' });
    setStep(2);
  };

  const handleToneContinue = () => {
    trackLandingStep(2, 'tone', { tone });
    setStep(3);
    setTimeout(() => document.getElementById('landing-signup-email')?.focus({ preventScroll: true }), 50);
  };

  const demo = PREVIEW_DEMOS[activeTab];

  const handleCopy = () => {
    const textToCopy = `${demo.postHook}\n\n${demo.postBody.join('\n\n')}\n\n${demo.tags}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Déjà connecté : l'étape 3 mène directement au studio (la session est revérifiée côté serveur)
  useEffect(() => {
    setSignedInEmail(getClientProfile()?.email || '');
  }, []);

  // Le studio reprend cette saisie et génère le post dès l'arrivée (après Google ou le lien magique)
  const storeAutostart = () => {
    try {
      const preset: FlowAutostart = {
        sourceText: isUrl ? normalizeUrl(trimmedSource) : trimmedSource,
        tone,
        objective: isUrl ? 'leads' : 'authority',
      };
      if (preset.sourceText) localStorage.setItem(FLOW_AUTOSTART_KEY, JSON.stringify(preset));
    } catch {
      // stockage indisponible : l'utilisateur ressaisira dans le studio
    }
  };

  const handleGoogle = async () => {
    if (isLoading || isGoogleLoading) return;
    setError('');
    setIsGoogleLoading(true);
    try {
      trackCtaClick('lead_capture_hero', 'landing_hero', '/dashboard');
      trackLandingStep(3, 'email', { source_type: isUrl ? 'url' : 'idea', tone, method: 'google' });
      storeAutostart();
      const { isNewUser } = await signInWithGoogle();
      try {
        trackAuth('google', isNewUser);
      } catch (trackErr) {
        console.warn('Analytics tracking error:', trackErr);
      }
      window.location.assign(`/${locale}/dashboard`);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(code === 'auth/popup-blocked'
          ? 'La fenêtre Google a été bloquée. Autorisez les popups puis réessayez.'
          : 'La connexion Google a échoué. Réessayez.');
      }
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      trackCtaClick('lead_capture_hero', 'landing_hero', '/dashboard');
      trackLandingStep(3, 'email', { source_type: isUrl ? 'url' : 'idea', tone, method: 'email_link' });
      storeAutostart();
      // Pas de mot de passe : lien magique Firebase, qui ramène au studio une fois ouvert
      await sendMagicLink(trimmed.toLowerCase(), locale);
      setSentTo(trimmed.toLowerCase());
    } catch (err: any) {
      console.warn('Magic link error:', err);
      setError('Impossible d’envoyer le lien. Vérifiez l’adresse et réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueSignedIn = () => {
    trackCtaClick('lead_capture_hero', 'landing_hero', '/dashboard');
    trackLandingStep(3, 'email', { source_type: isUrl ? 'url' : 'idea', tone, method: 'session' });
    storeAutostart();
    window.location.assign(`/${locale}/dashboard`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      {/* 1. Mini-parcours : source → ton → e-mail */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_-28px_rgba(249,115,22,0.35)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative space-y-6 p-6 sm:p-8">
          {/* En-tête + progression */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
              <Sparkles className="h-3.5 w-3.5" />
              Essai gratuit · 5 posts offerts
            </span>
            <ol className="flex items-center gap-2" aria-label="Progression">
              {[1, 2, 3].map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <span
                    className={twMerge(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                      n === step && 'bg-orange-500 text-white',
                      n < step && 'bg-orange-100 text-orange-600',
                      n > step && 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {n < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
                  </span>
                  {n < 3 && (
                    <span className="h-0.5 w-6 overflow-hidden rounded-full bg-slate-100 sm:w-10">
                      <span
                        className={twMerge(
                          'block h-full rounded-full bg-orange-500 transition-all duration-500',
                          step > n ? 'w-full' : 'w-0'
                        )}
                      />
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Récapitulatif des étapes franchies, cliquable pour revenir en arrière */}
          {step > 1 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-slate-600 ring-1 ring-slate-200 transition hover:ring-orange-300"
              >
                {isUrl ? <Globe2 className="h-3.5 w-3.5 text-orange-500" /> : <Lightbulb className="h-3.5 w-3.5 text-orange-500" />}
                <span className="max-w-[16rem] truncate sm:max-w-md">{trimmedSource.replace(/^https?:\/\//, '')}</span>
                <PenLine className="h-3 w-3 text-slate-400" />
              </button>
              {step > 2 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-slate-600 ring-1 ring-slate-200 transition hover:ring-orange-300"
                >
                  Ton : {TONES.find((t) => t.value === tone)?.label}
                  <PenLine className="h-3 w-3 text-slate-400" />
                </button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="animate-rise space-y-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  De quoi voulez-vous parler ?
                </h3>
                <p className="mt-1 text-sm text-slate-500">Collez un lien ou écrivez votre idée en quelques mots.</p>
              </div>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10">
                <textarea
                  id="landing-source-input"
                  rows={3}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSourceContinue();
                    }
                  }}
                  placeholder="https://votre-article.com  —  ou  —  « La semaine dernière, un client m’a dit… »"
                  className="block w-full resize-none bg-transparent px-5 pt-4 pb-11 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {trimmedSource && (
                  <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    {isUrl ? <Globe2 className="h-3.5 w-3.5 text-orange-500" /> : <Lightbulb className="h-3.5 w-3.5 text-orange-500" />}
                    {isUrl ? 'Lien détecté' : 'Idée'}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {IDEA_STARTERS.slice(0, 2).map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setSourceText(`${idea} : `)}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition hover:text-orange-700 hover:ring-orange-300"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSourceContinue}
                  disabled={trimmedSource.length < 3}
                  className={twMerge(btnPrimary, 'shrink-0')}
                >
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Film className="h-3.5 w-3.5" />
                Vous partez d’une vidéo ? Vous pourrez l’importer dans le studio.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-rise space-y-5">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Quel ton pour votre post ?</h3>
                <p className="mt-1 text-sm text-slate-500">Vous pourrez le changer à tout moment.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <Chip key={t.value} selected={tone === t.value} onClick={() => setTone(t.value)}>
                    {t.label}
                  </Chip>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => setStep(1)} className={twMerge(btnGhost, '-ml-3')}>
                  Retour
                </button>
                <button type="button" onClick={handleToneContinue} className={btnPrimary}>
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && sentTo && (
            <div className="animate-rise space-y-3">
              <div className="flex items-start gap-3">
                <MailCheck className="mt-0.5 h-6 w-6 shrink-0 text-orange-500" />
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    Vérifiez votre boîte mail
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Lien de connexion envoyé à <strong className="text-slate-700">{sentTo}</strong>. Ouvrez-le sur cet appareil : votre post s’écrit dès votre arrivée dans le studio.
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setSentTo('')} className={btnGhost}>
                Utiliser une autre adresse
              </button>
            </div>
          )}

          {step === 3 && !sentTo && signedInEmail && (
            <div className="animate-rise space-y-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  Votre post est prêt à être rédigé
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Connecté en tant que {signedInEmail} : le post s’écrit dès votre arrivée dans le studio.
                </p>
              </div>
              <button type="button" onClick={handleContinueSignedIn} className={btnPrimary}>
                Générer mon post
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 3 && !sentTo && !signedInEmail && (
            <form onSubmit={handleSubmit} className="animate-rise space-y-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  Votre post est prêt à être rédigé
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Créez votre accès gratuit, sans mot de passe : le post s’écrit dès votre arrivée.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isLoading || isGoogleLoading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-[15px] font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Continuer avec Google
              </button>
              <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span>ou par e-mail</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="landing-signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                />
                <button type="submit" disabled={isLoading || isGoogleLoading} className={twMerge(btnPrimary, 'shrink-0')}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi du lien…
                    </>
                  ) : (
                    <>
                      Recevoir mon lien
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-rose-200">{error}</p>
              )}
            </form>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              5 posts offerts
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              Sans engagement
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visual Live Demonstration: "Source brute ➔ Post LinkedIn Forgé" */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Démonstration en direct
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
              Voyez comment LinkedInForge transforme votre matière brute
            </h3>
          </div>

          {/* Interactive Source Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
            {PREVIEW_DEMOS.map((tab, idx) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === idx
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transformation Pipeline View */}
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* Left: Raw Input */}
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono uppercase font-bold text-orange-400">Matière brute</span>
              <span className="bg-slate-800 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-300">
                {demo.sourceTitle}
              </span>
            </div>
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 font-mono italic leading-relaxed">
              {demo.inputPreview}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{demo.sourceDesc}</span>
            </div>
          </div>

          {/* Middle: AI Process badge */}
          <div className="lg:col-span-2 flex lg:flex-col items-center justify-center gap-2 text-center py-2">
            <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-500/20">
              <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
            </div>
            <span className="text-[11px] font-bold text-orange-300 font-mono">
              Compréhension IA
            </span>
          </div>

          {/* Right: Forged LinkedIn Post */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl p-5 border-2 border-orange-500/40 shadow-xl space-y-3 relative">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-xs font-bold text-slate-950">
                  LF
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1">
                    Post LinkedIn Forgé <Check className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">Structure Ghostwriter</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold transition flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-h-48 overflow-y-auto pr-1">
              <p className="font-bold text-white text-sm sm:text-base">{demo.postHook}</p>
              {demo.postBody.map((paragraph, i) => (
                <p key={i} className="text-slate-300">{paragraph}</p>
              ))}
              <p className="text-orange-400 font-mono text-xs pt-1">{demo.tags}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" /> Prêt à publier
              </span>
              <span className="text-slate-500 italic text-[10px]">{demo.aiAnalysis}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
