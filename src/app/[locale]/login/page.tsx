'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import Header from '@/components/layout/Header';

export default function LoginPage() {
  const t = useTranslations('login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isSignUp })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('genericError'));
      }

      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericErrorFallback'));
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

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">{t('emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full bg-slate-100/60 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-smoke-500/60 focus:outline-none focus:border-orange-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">{t('passwordLabel')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? t('passwordPlaceholder') : ''}
                className="w-full bg-slate-100/60 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-smoke-500/60 focus:outline-none focus:border-orange-500 transition"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? t('processing') : isSignUp ? t('signUpSubmit') : t('signInSubmit')}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center text-sm text-slate-500">
            {isSignUp ? (
              <>
                {t('haveAccount')}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className="text-black hover:text-black/80 transition"
                >
                  {t('switchToSignIn')}
                </button>
              </>
            ) : (
              <>
                {t('noAccount')}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                  className="text-black hover:text-black/80 transition"
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
