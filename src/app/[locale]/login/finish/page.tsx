'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import { trackAuth } from '@/lib/analytics';
import {
  completeMagicLink,
  getPendingMagicLinkEmail,
  isMagicLink,
  safeNextPath,
} from '@/lib/auth/client';

/** Retour du lien magique e-mail : ouvre la session puis redirige vers `next`. */
export default function LoginFinishPage() {
  const t = useTranslations('login');
  const locale = useLocale();
  const [needsEmail, setNeedsEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const started = useRef(false);

  const finish = async (address: string) => {
    setError('');
    setIsLoading(true);
    try {
      const { isNewUser } = await completeMagicLink(address.trim().toLowerCase(), window.location.href);
      try {
        trackAuth('email', isNewUser);
      } catch (trackErr) {
        console.warn('Analytics tracking error:', trackErr);
      }
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.replace(safeNextPath(next, `/${locale}/dashboard`));
    } catch (err: any) {
      console.warn('Magic link completion error:', err);
      setError(err?.code === 'auth/invalid-email' ? t('finishEmailMismatch') : t('finishError'));
      setNeedsEmail(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!isMagicLink(window.location.href)) {
      setError(t('finishInvalidLink'));
      setIsLoading(false);
      return;
    }
    const pending = getPendingMagicLinkEmail();
    if (pending) {
      finish(pending);
    } else {
      // Lien ouvert sur un autre appareil : on redemande l'adresse
      setNeedsEmail(true);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Header variant="minimal" />
          <h1 className="font-display font-bold text-3xl mb-2">{t('finishTitle')}</h1>
        </div>

        <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-orange-500/10 border border-orange-500/40 text-orange-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('processing')}</span>
            </div>
          )}

          {!isLoading && needsEmail && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes('@')) finish(email);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">{t('finishConfirmEmail')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                  className="w-full bg-slate-100/60 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-500 transition"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full font-bold" size="lg">
                {t('finishSubmit')}
              </Button>
            </form>
          )}

          {!isLoading && !needsEmail && (
            <a href={`/${locale}/login`} className="block text-center text-sm font-medium text-black hover:text-black/80">
              {t('finishBackToLogin')}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
