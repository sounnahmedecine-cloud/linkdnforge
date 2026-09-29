'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Sparkles, 
  Film, 
  Globe2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Loader2,
  Check
} from 'lucide-react';
import { trackAuth, trackCtaClick } from '@/lib/analytics';

export default function LandingLeadCapture() {
  const locale = useLocale();
  const tLanding = useTranslations('landing');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState<'video' | 'url' | 'idea'>('video');

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

      // Hard redirect to dashboard: fresh session cookie, no client router cache
      window.location.assign(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      {/* Top Main Lead Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-2xl shadow-slate-200/60 relative overflow-hidden text-left">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header pill */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Atelier Complet · 5 crédits offerts
            </span>
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Sans carte bancaire requise
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight">
              Débloquez vos 5 générations offertes dans l'Atelier
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Entrez votre adresse email pour accéder immédiatement au studio complet : pilote vidéo multimodal, analyse d'URLs en direct, capture Hero HD et script TikTok/Reels.
            </p>
          </div>

          {/* Lead Capture Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre email professionnel..."
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full h-14 pl-4 pr-4 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-base font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-14 px-8 rounded-2xl font-display font-black text-sm sm:text-base bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création de votre accès...</span>
                  </>
                ) : (
                  <>
                    <span>Accéder au Studio gratuit</span>
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

          {/* Reassurances list */}
          <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              5 générations complètes offertes
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Accès immédiat sans attente
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Aucun engagement, 100% libre
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Studio Preview Tabs (Demonstrating value before entering) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-orange-400 font-bold">
              Aperçu en direct
            </span>
            <h3 className="font-display font-black text-lg sm:text-xl text-white">
              Ce que vous allez forger dans l'Atelier
            </h3>
          </div>

          {/* Preview Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActivePreviewTab('video')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activePreviewTab === 'video'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>🎥 Vidéo</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab('url')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activePreviewTab === 'url'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>🔗 URL Produit</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab('idea')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activePreviewTab === 'idea'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>💡 Idée brute</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Video */}
        {activePreviewTab === 'video' && (
          <div className="grid md:grid-cols-12 gap-6 items-center animate-in fade-in duration-200">
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2.5 py-1 rounded-md border border-orange-800">
                Pilote Multimodal
              </span>
              <h4 className="font-display font-bold text-base sm:text-lg text-white">
                Déposez un TikTok, Reel ou vidéo mp4
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                LinkdnForge écoute la voix, détecte les temps forts et crée un post LinkedIn aéré ainsi qu’un script vidéo court.
              </p>
            </div>
            <div className="md:col-span-7 bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-2.5 font-sans text-xs sm:text-sm leading-relaxed text-slate-300">
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Post LinkedIn généré automatiquement :
              </div>
              <p className="font-bold text-white">
                « 95% des créateurs font cette erreur sur leurs vidéos courtes :
              </p>
              <p>Ils mettent leur logo au début, au lieu de lancer l'accroche dans les 2 premières secondes.</p>
              <p>Voici la règle des 3 secondes qui a multiplié notre rétention par 4 : »</p>
            </div>
          </div>
        )}

        {/* Tab 2: URL */}
        {activePreviewTab === 'url' && (
          <div className="grid md:grid-cols-12 gap-6 items-center animate-in fade-in duration-200">
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800">
                Scraping Intelligent
              </span>
              <h4 className="font-display font-bold text-base sm:text-lg text-white">
                Collez l’URL d'un produit ou d'un site
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                L’IA extrait la proposition de valeur, capture l'image Hero du site et forge une publication prête pour vos prospects.
              </p>
            </div>
            <div className="md:col-span-7 bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-2.5 font-sans text-xs sm:text-sm leading-relaxed text-slate-300">
              <div className="text-blue-400 font-bold text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Post LinkedIn & Visuel Hero extrait :
              </div>
              <p className="font-bold text-white">
                « Comment transformer un produit de niche en best-seller sans dépenser des fortunes en publicité ?
              </p>
              <p>En arrêtant de vanter les caractéristiques techniques pour raconter une vraie transformation client.</p>
              <p>Étude de cas complète et analyse des chiffres ci-dessous : »</p>
            </div>
          </div>
        )}

        {/* Tab 3: Idea */}
        {activePreviewTab === 'idea' && (
          <div className="grid md:grid-cols-12 gap-6 items-center animate-in fade-in duration-200">
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800">
                Ghostwriter Spécialisé
              </span>
              <h4 className="font-display font-bold text-base sm:text-lg text-white">
                Une phrase ou une idée brute
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tapez votre sujet sans réfléchir à la structure. Le Ghostwriter applique les meilleures structures d'accroches de LinkedIn.
              </p>
            </div>
            <div className="md:col-span-7 bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-2.5 font-sans text-xs sm:text-sm leading-relaxed text-slate-300">
              <div className="text-amber-400 font-bold text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Structure Ghostwriter :
              </div>
              <p className="font-bold text-white">
                « J'ai perdu 6 mois à prospecter "dans le vide" sur LinkedIn.
              </p>
              <p>Puis j'ai changé une seule chose : au lieu d'envoyer des pitchs froids, j'ai publié mes coulisses de travail.</p>
              <p>Résultat : 14 demandes entrantes par semaine. Voici la routine exacte : »</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
