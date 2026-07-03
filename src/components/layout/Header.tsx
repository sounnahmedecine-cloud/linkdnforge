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
          {user?.email && <span className="text-sm text-smoke-500">{user.email}</span>}
          <LanguageSwitcher />
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-iron-700 text-smoke-300 hover:text-smoke-100 rounded-lg hover:border-iron-600 transition text-sm"
          >
            {logoutLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-iron-950/90 backdrop-blur-md border-b border-iron-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          {showPricingLink && (
            <Link href="/pricing" className="text-sm text-smoke-500 hover:text-smoke-100 transition font-medium">
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
