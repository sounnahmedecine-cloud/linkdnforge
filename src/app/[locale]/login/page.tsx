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
    <div className="min-h-screen bg-iron-950 text-smoke-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Header variant="minimal" />
          <h1 className="font-display font-bold text-4xl mb-2">
            {isSignUp ? t('signUpTitle') : t('signInTitle')}
          </h1>
          <p className="text-smoke-500">
            {isSignUp ? t('signUpSubtitle') : t('signInSubtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-iron-900/60 border border-iron-800 rounded-2xl p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-ember-500/10 border border-ember-500/40 text-ember-300 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-smoke-300">{t('emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full bg-iron-800/60 border border-iron-700 rounded-lg px-4 py-3 text-smoke-100 placeholder-smoke-500/60 focus:outline-none focus:border-ember-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-smoke-300">{t('passwordLabel')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? t('passwordPlaceholder') : ''}
                className="w-full bg-iron-800/60 border border-iron-700 rounded-lg px-4 py-3 text-smoke-100 placeholder-smoke-500/60 focus:outline-none focus:border-ember-500 transition"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? t('processing') : isSignUp ? t('signUpSubmit') : t('signInSubmit')}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center text-sm text-smoke-500">
            {isSignUp ? (
              <>
                {t('haveAccount')}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className="text-quench-400 hover:text-quench-400/80 transition"
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
                  className="text-quench-400 hover:text-quench-400/80 transition"
                >
                  {t('switchToSignUp')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-smoke-500/70 text-xs mt-8">
          {t('termsPrefix')}{' '}
          <a href="#" className="hover:text-smoke-300 transition">
            {t('termsLink')}
          </a>
        </p>
      </div>
    </div>
  );
}
