'use client';

import { useState, useEffect } from 'react';
import { Film, Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Link, usePathname } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import ChromeExtensionModal from '@/components/extension/ChromeExtensionModal';

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
  chromeExtensionLabel?: string;
  showPricingLink?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  user?: AppUser | null;
  onLogout?: () => void;
  logoutLabel?: string;
  onOpenMobileMenu?: () => void;
}

export default function Header({
  variant,
  generatorLabel,
  howItWorksLabel,
  pricingLabel,
  autopilotLabel,
  chromeExtensionLabel,
  showPricingLink = true,
  ctaLabel,
  ctaHref = '/#demo',
  user,
  onLogout,
  logoutLabel = 'Déconnexion',
  onOpenMobileMenu,
}: HeaderProps) {
  const tNav = useTranslations('nav');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(user || null);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      return;
    }
    if (typeof document !== 'undefined') {
      try {
        const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
        if (match && match[1]) {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          if (parsed && typeof parsed.email === 'string' && parsed.email.length > 0) {
            setCurrentUser(parsed);
          }
        }
      } catch (e) {
        // ignore cookie parse error
      }
    }
  }, [user]);

  const resolvedGenerator = generatorLabel || tNav('generator') || 'Générateur';
  const resolvedHowItWorks = howItWorksLabel || tNav('howItWorks') || 'Comment ça marche';
  const resolvedPricing = pricingLabel || tNav('pricing') || 'Tarifs';
  const resolvedAutopilot = autopilotLabel || tNav('autopilot') || 'Autopilot Vidéo';
  const resolvedChromeExtension = chromeExtensionLabel || tNav('chromeExtension') || 'Extension Chrome';
  const resolvedCta = ctaLabel || tNav('cta') || 'Essayer gratuitement';
  const resolvedSignIn = tNav('signIn') || 'Se connecter';
  const resolvedMyStudio = tNav('myStudio') || 'Mon Atelier';

  const isForgeActive = pathname === '/forge' || pathname.startsWith('/forge');
  const isPricingActive = pathname === '/pricing' || pathname.startsWith('/pricing');

  const handleCtaClick = () => {
    if (ctaHref.includes('#demo') || ctaHref === '#demo') {
      setTimeout(() => {
        const el = document.getElementById('landing-email-input');
        el?.focus();
      }, 150);
    }
  };

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
      <>
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xs" suppressHydrationWarning>
          <div className="flex items-center gap-3">
            {onOpenMobileMenu && (
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="lg:hidden p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                aria-label="Ouvrir le menu de navigation"
              >
                <Menu className="w-5 h-5 text-stone-900" />
                <span className="text-xs font-bold hidden sm:inline">Menu</span>
              </button>
            )}
            <Logo />
            {user?.role === 'admin' && (
              <span className="text-[10px] font-mono bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded-full border border-stone-200">
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowExtensionModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-50 hover:bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200 transition cursor-pointer"
              title="Installer l'extension Chrome"
            >
              <span className="text-stone-500 font-bold">⚡</span>
              <span>Extension Chrome</span>
            </button>
            {user?.email && (
              <span className="hidden md:inline text-xs font-medium text-stone-500 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200 font-mono">
                {user.email}
              </span>
            )}
            <LanguageSwitcher />
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 border border-stone-200 text-stone-700 hover:text-rose-600 hover:border-rose-200 rounded-xl hover:bg-rose-50 transition text-xs font-semibold cursor-pointer"
              >
                {logoutLabel}
              </button>
            )}
          </div>
        </header>
        <ChromeExtensionModal 
          isOpen={showExtensionModal} 
          onClose={() => setShowExtensionModal(false)} 
        />
      </>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Logo />

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/#comment-ca-marche"
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
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

            {/* Chrome Extension Trigger Link in Header */}
            <button
              type="button"
              onClick={() => setShowExtensionModal(true)}
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors flex items-center gap-1.5 group cursor-pointer"
            >
              <span className="text-orange-500 group-hover:scale-110 transition-transform">⚡</span>
              <span>{resolvedChromeExtension}</span>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full border border-orange-200/80 shadow-2xs">
                Nouveau
              </span>
            </button>
          </div>

          {/* Right Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <>
                <LanguageSwitcher />
                <Button href="/dashboard" size="md" className="font-bold shadow-sm bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5">
                  <span>{resolvedMyStudio}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-950 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {resolvedSignIn}
                </Link>
                <LanguageSwitcher />
                <Button href={ctaHref} size="md" className="font-bold shadow-sm" onClick={handleCtaClick}>
                  {resolvedCta}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger & Actions */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50 transition cursor-pointer"
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
            <div className="flex flex-col space-y-2">
              <a
                href="/#comment-ca-marche"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {resolvedHowItWorks}
              </a>

              {showPricingLink && (
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isPricingActive
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {resolvedPricing}
                </Link>
              )}

              {/* Mobile Chrome Extension Link */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowExtensionModal(true);
                }}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer text-left w-full"
              >
                <span className="flex items-center gap-2">
                  <span className="text-orange-500">⚡</span>
                  <span>{resolvedChromeExtension}</span>
                </span>
                <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                  Gratuit
                </span>
              </button>
            </div>

            {currentUser ? (
              <div className="pt-2">
                <Button
                  href="/dashboard"
                  size="lg"
                  className="w-full font-bold justify-center shadow-md bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{resolvedMyStudio}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 hover:text-black font-bold flex items-center justify-center text-sm transition hover:bg-slate-50"
                >
                  {resolvedSignIn}
                </Link>
                <Button
                  href={ctaHref}
                  size="lg"
                  className="w-full font-bold justify-center shadow-md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCtaClick();
                  }}
                >
                  {resolvedCta}
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>
      <ChromeExtensionModal 
        isOpen={showExtensionModal} 
        onClose={() => setShowExtensionModal(false)} 
      />
    </>
  );
}

