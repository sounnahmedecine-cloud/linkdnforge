'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import { trackAuth } from '@/lib/analytics';
import { Loader2, MailCheck } from 'lucide-react';
import { sendMagicLink, signInWithGoogle } from '@/lib/auth/client';
import { GoogleIcon } from '@/components/auth/GoogleIcon';


export default function LoginPage() {
  const t = useTranslations('login');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const handleGoogleAuth = async () => {
    if (isLoading || isGoogleLoading) return;
    setError('');
    setIsGoogleLoading(true);

    try {
      const { isNewUser } = await signInWithGoogle();

      try {
        trackAuth('google', isNewUser);
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

  // Connexion et inscription sans mot de passe : lien magique envoyé par Firebase
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError(t('emailRequired'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await sendMagicLink(trimmedEmail, locale);
      setSentTo(trimmedEmail);
    } catch (err) {
      console.warn('Magic link error:', err);
      setError(t('magicLinkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Header variant="minimal" />
          <h1 className="font-display font-bold text-4xl mb-2">{t('signInTitle')}</h1>
          <p className="text-slate-500">{t('signInSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-orange-500/10 border border-orange-500/40 text-orange-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {sentTo ? (
            <div className="text-center space-y-3">
              <MailCheck className="w-10 h-10 mx-auto text-orange-500" />
              <h2 className="font-semibold text-lg">{t('magicLinkSentTitle')}</h2>
              <p className="text-sm text-slate-500">{t('magicLinkSentBody', { email: sentTo })}</p>
              <button
                type="button"
                onClick={() => setSentTo('')}
                className="text-sm text-black hover:text-black/80 transition font-medium"
              >
                {t('magicLinkChangeEmail')}
              </button>
            </div>
          ) : (
            <>
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

              {/* Lien magique */}
              <form onSubmit={handleMagicLink} className="space-y-4">
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
                  <p className="mt-2 text-xs text-slate-500">{t('magicLinkHint')}</p>
                </div>

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
                    <span>{t('magicLinkSubmit')}</span>
                  )}
                </Button>
              </form>
            </>
          )}
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
