'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Loader2 
} from 'lucide-react';
import { trackAuth, trackCtaClick } from '@/lib/analytics';

export default function LandingLeadCapture() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
      {/* Main Clean Lead Capture Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-2xl shadow-slate-200/60 relative overflow-hidden text-left">
        {/* Subtle glow accent */}
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
              Entrez votre adresse email pour accéder immédiatement au studio complet : transformation de vidéos et liens web, extraction d'images HD et scripts pour vos réseaux.
            </p>
          </div>

          {/* Lead Capture Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <input
                  id="landing-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrez votre adresse email..."
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
                    <span>Essayer gratuitement</span>
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
    </div>
  );
}
