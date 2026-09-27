'use client';

import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

interface AppUser {
  email: string;
  role: 'admin' | 'user';
}

interface HeaderProps {
  variant: 'marketing' | 'minimal' | 'app';
  pricingLabel?: string;
  showPricingLink?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  user?: AppUser | null;
  onLogout?: () => void;
  logoutLabel?: string;
}

export default function Header({
  variant,
  pricingLabel = 'Tarifs',
  showPricingLink = true,
  ctaLabel = 'Commencer',
  ctaHref = '/login',
  user,
  onLogout,
  logoutLabel = 'Déconnexion',
}: HeaderProps) {
  if (variant === 'minimal') {
    return (
      <div className="relative flex justify-center mb-8">
        <Logo showBeta={false} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <LanguageSwitcher />
        </div>
      </div>
    );
  }

  if (variant === 'app') {
    return (
      <div className="flex items-center justify-between mb-12" suppressHydrationWarning>
        <div className="flex items-center gap-3">
          <Logo />
          {user?.role === 'admin' && <Badge tone="spark">👑 Admin</Badge>}
        </div>
        <div className="flex items-center gap-4">
          {user?.email && <span className="text-sm text-slate-500">{user.email}</span>}
          <LanguageSwitcher />
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg hover:border-slate-300 transition text-sm"
          >
            {logoutLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          {showPricingLink && (
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-900 transition font-medium">
              {pricingLabel}
            </Link>
          )}
          <LanguageSwitcher />
          <Button href={ctaHref} size="md">
            {ctaLabel}
          </Button>
        </div>
      </div>
    </nav>
  );
}

