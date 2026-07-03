'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const LOCALE_META: Record<Locale, { flag: string; label: string }> = {
  fr: { flag: '🇫🇷', label: 'Français' },
  en: { flag: '🇬🇧', label: 'English' },
  es: { flag: '🇪🇸', label: 'Español' },
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (nextLocale: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Choisir la langue"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-iron-700 text-sm text-smoke-300 hover:text-smoke-100 hover:border-iron-600 transition"
      >
        <span aria-hidden="true">{LOCALE_META[locale].flag}</span>
        <span className="hidden sm:inline font-mono text-xs uppercase">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-iron-900 border border-iron-800 rounded-lg shadow-xl py-1 z-50">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleSelect(loc)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-iron-800 transition ${
                loc === locale ? 'text-smoke-100' : 'text-smoke-400'
              }`}
            >
              <span aria-hidden="true">{LOCALE_META[loc].flag}</span>
              {LOCALE_META[loc].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
