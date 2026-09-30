'use client';

import React from 'react';
import { 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import SectionLabel from '@/components/ui/SectionLabel';
import { trackCtaClick } from '@/lib/analytics';

export default function HeroShowcase() {
  return (
    <section className="relative w-full pt-8 pb-16 sm:pt-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/30">
      {/* Grille de fond subtile */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="24" cy="24" r="1" className="fill-slate-400" />
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-6 animate-rise">
        
        {/* Badge */}
        <SectionLabel className="justify-center bg-orange-100 text-orange-700 border-orange-200 mx-auto w-fit font-bold">
          ✨ Studio de Création de Contenu IA
        </SectionLabel>

        {/* Titre Ultra-Direct */}
        <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-slate-950">
          Transformez votre contenu en posts prêts à publier.
        </h1>

        {/* Sous-titre Bénéfice Clair */}
        <p className="text-xl sm:text-2xl text-slate-700 leading-snug max-w-2xl mx-auto font-medium">
          Une idée → plusieurs contenus. LinkedInForge s'occupe du reste.
        </p>

        {/* CTA Principal Immédiat */}
        <div className="pt-2 w-full flex flex-col items-center">
          <a
            href="#demo"
            onClick={() => {
              trackCtaClick('hero_cta_primary', 'landing_hero', '#demo');
              setTimeout(() => {
                document.getElementById('landing-email-input')?.focus();
              }, 100);
            }}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-display font-black text-lg sm:text-xl text-white bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:scale-[1.02] active:scale-[0.98] transition duration-300 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 cursor-pointer"
          >
            <span>CRÉER MON PREMIER POST</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </a>

          {/* Micro-réassurance en 3 points sous le CTA */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Rapide & simple</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Multi-plateformes (LinkedIn, FB, Reels)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>5 générations offertes sans CB</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
