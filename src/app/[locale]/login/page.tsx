'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import { trackAuth } from '@/lib/analytics';
import { Loader2 } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function LoginPage() {
  const t = useTranslations('login');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleAuth = async () => {
    if (isLoading || isGoogleLoading) return;
    setError('');
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json().catch(() => ({}));

      // La session de l'app repose sur le cookie auth_token : inutile de garder
      // une session Firebase Auth côté client.
      signOut(auth).catch(() => {});

      if (!response.ok) {
        throw new Error(data.error || t('googleError'));
      }

      try {
        trackAuth('google', Boolean(data.isNewUser));
      } catch (trackErr) {
        console.warn('Analytics tracking error:', trackErr);
      }

      window.location.assign(`/${locale}/dashboard`);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // Fermeture volontaire de la popup : pas d'erreur à afficher
      } else if (code === 'auth/popup-blocked') {
        setError(t('googlePopupBlocked'));
      } else {
        setError(err instanceof Error && !code ? err.message : t('googleError'));
      }
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError(t('emailRequired') || 'Veuillez saisir une adresse email valide');
      return;
    }

    if (isSignUp && password && password.length < 8) {
      setError(t('passwordMinLength') || 'Le mot de passe doit comporter au moins 8 caractères');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: trimmedEmail, 
          password: password || 'GuestAutoUser123!', 
          isSignUp 
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || t('genericError'));
      }

      try {
        trackAuth('email', isSignUp);
      } catch (trackErr) {
        console.warn('Analytics tracking error:', trackErr);
      }

      // Hard redirect to ensure fresh cookies are sent, router cache is bypassed,
      // and prevent multiple clicks. Keep isLoading true so button stays in loading state.
      window.location.assign(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericErrorFallback'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Header variant="minimal" />
          <h1 className="font-display font-bold text-4xl mb-2">
            {isSignUp ? t('signUpTitle') : t('signInTitle')}
          </h1>
          <p className="text-slate-500">
            {isSignUp ? t('signUpSubtitle') : t('signInSubtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-orange-500/10 border border-orange-500/40 text-orange-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
            <span>{isGoogleLoading ? t('processing') : t('googleButton')}</span>
          </button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>{t('orDivider')}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">{t('emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                className="w-full bg-slate-100/60 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-smoke-500/60 focus:outline-none focus:border-orange-500 transition"
                required
                autoFocus
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">{t('passwordLabel')} (optionnel)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  autoComplete="new-password"
                  className="w-full bg-slate-100/60 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-smoke-500/60 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 font-bold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('processing')}</span>
                </>
              ) : (
                <span>{isSignUp ? t('signUpSubmit') : t('signInSubmit')}</span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center text-sm text-slate-500">
            {isSignUp ? (
              <>
                {t('haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className="text-black hover:text-black/80 transition font-medium"
                >
                  {t('switchToSignIn')}
                </button>
              </>
            ) : (
              <>
                {t('noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                  className="text-black hover:text-black/80 transition font-medium"
                >
                  {t('switchToSignUp')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500/70 text-xs mt-8">
          {t('termsPrefix')}{' '}
          <a href="#" className="hover:text-slate-700 transition">
            {t('termsLink')}
          </a>
        </p>
      </div>
    </div>
  );
}
