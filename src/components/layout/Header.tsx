'use client';

import { useState } from 'react';
import { Film, Menu, X, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

interface AppUser {
  email: string;
  role: 'admin' | 'user';
}

interface HeaderProps {
  variant: 'marketing' | 'minimal' | 'app';
  generatorLabel?: string;
  howItWorksLabel?: string;
  pricingLabel?: string;
  autopilotLabel?: string;
  showPricingLink?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  user?: AppUser | null;
  onLogout?: () => void;
  logoutLabel?: string;
}

export default function Header({
  variant,
  generatorLabel,
  howItWorksLabel,
  pricingLabel,
  autopilotLabel,
  showPricingLink = true,
  ctaLabel,
  ctaHref = '/forge',
  user,
  onLogout,
  logoutLabel = 'Déconnexion',
}: HeaderProps) {
  const tNav = useTranslations('nav');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const resolvedGenerator = generatorLabel || tNav('generator') || 'Générateur';
  const resolvedHowItWorks = howItWorksLabel || tNav('howItWorks') || 'Comment ça marche';
  const resolvedPricing = pricingLabel || tNav('pricing') || 'Tarifs';
  const resolvedAutopilot = autopilotLabel || tNav('autopilot') || 'Autopilot Vidéo';
  const resolvedCta = ctaLabel || tNav('cta') || 'Essayer gratuitement';

  const isForgeActive = pathname === '/forge' || pathname.startsWith('/forge');
  const isPricingActive = pathname === '/pricing' || pathname.startsWith('/pricing');

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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo />

        {/* Desktop Navigation Links (MoroAI inspired) */}
        <div className="hidden md:flex items-center gap-7">
          <Link
            href="/forge"
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              isForgeActive
                ? 'text-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <span>{resolvedGenerator}</span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              Essai
            </span>
          </Link>

          <a
            href="/#comment-ca-marche"
            className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            {resolvedHowItWorks}
          </a>

          {showPricingLink && (
            <Link
              href="/pricing"
              className={`text-sm font-semibold transition-colors ${
                isPricingActive
                  ? 'text-orange-600 font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {resolvedPricing}
            </Link>
          )}

          {/* Autopilot highlight pill (like MoroAI WhatsApp link) */}
          <Link
            href="/forge?mode=video"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-black text-xs font-bold transition-all shadow-sm hover:shadow"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>{resolvedAutopilot}</span>
          </Link>
        </div>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <Button href={ctaHref} size="md" className="font-bold shadow-sm">
            {resolvedCta}
          </Button>
        </div>

        {/* Mobile Hamburger & Actions */}
        <div className="flex md:hidden items-center gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50 transition"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3">
            <Link
              href="/forge"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-base font-semibold flex items-center justify-between ${
                isForgeActive
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{resolvedGenerator}</span>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Essai gratuit
              </span>
            </Link>

            <a
              href="/#comment-ca-marche"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              {resolvedHowItWorks}
            </a>

            {showPricingLink && (
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-base font-semibold ${
                  isPricingActive
                    ? 'bg-orange-50 text-orange-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {resolvedPricing}
              </Link>
            )}

            <Link
              href="/forge?mode=video"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-base font-bold bg-slate-900 text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                {resolvedAutopilot}
              </span>
              <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md">
                Nouveau
              </span>
            </Link>
          </div>

          <div className="pt-2">
            <Button
              href={ctaHref}
              size="lg"
              className="w-full font-bold justify-center shadow-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {resolvedCta}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
