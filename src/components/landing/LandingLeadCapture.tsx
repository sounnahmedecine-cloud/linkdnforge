'use client';

import { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { trackAuth, trackCtaClick } from '@/lib/analytics';

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
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const demo = PREVIEW_DEMOS[activeTab];

  const handleCopy = () => {
    const textToCopy = `${demo.postHook}\n\n${demo.postBody.join('\n\n')}\n\n${demo.tags}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          password: 'GuestAutoUser123!',
          isSignUp: true,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session');
      }

      try {
        trackAuth('email', true);
      } catch (trackErr) {
        console.warn('Analytics tracking error:', trackErr);
      }

      window.location.assign(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      {/* 1. Fast Action Input Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xl shadow-orange-500/5 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Générateur Immédiat · 5 crédits offerts
            </span>
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Sans carte bancaire requise
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <input
                  id="landing-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre email pour générer votre premier post..."
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full h-14 pl-4 pr-4 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-base font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-14 px-8 rounded-2xl font-display font-black text-base bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création de votre accès...</span>
                  </>
                ) : (
                  <>
                    <span>Générer mon premier post</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              5 générations complètes offertes
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Accès immédiat à l'Atelier
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              100% sans engagement
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
