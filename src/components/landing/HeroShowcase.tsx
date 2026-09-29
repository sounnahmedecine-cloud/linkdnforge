'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Play, 
  Volume2, 
  Maximize2, 
  Link as LinkIcon, 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  Sparkles, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  Share2,
  Globe
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { trackCtaClick } from '@/lib/analytics';

interface HeroShowcaseProps {
  onCtaClick?: () => void;
}

export default function HeroShowcase({ onCtaClick }: HeroShowcaseProps) {
  const handleScrollToDemo = () => {
    trackCtaClick('hero_visual_cta', 'landing_hero', '#demo');
    if (onCtaClick) {
      onCtaClick();
    } else {
      const demoElement = document.getElementById('demo');
      if (demoElement) {
        demoElement.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(() => {
        document.getElementById('landing-email-input')?.focus();
      }, 300);
    }
  };

  return (
    <section className="relative w-full pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
      {/* Background Geometric / Mesh Network lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="24" cy="24" r="1" className="fill-slate-400" />
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="hero-glow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
          <rect width="100%" height="100%" fill="url(#hero-glow)" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* 1. Header / Logo */}
        <div className="mb-4 inline-flex items-center justify-center">
          <Logo />
        </div>

        {/* 2. Main Hero Title & Subtitle */}
        <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-slate-950 uppercase max-w-4xl leading-[1.1]">
          CONVERTISSEZ VOTRE CONTENU EN POSTS PRÊTS À PUBLIER.
        </h1>

        <p className="mt-3 text-lg sm:text-2xl text-slate-700 font-medium tracking-normal">
          Une vidéo, une URL ou une idée...
        </p>

        {/* 3. Transformation Visual Mockup (Input -> Beam -> Output) */}
        <div className="relative w-full mt-10 md:mt-14 mb-8 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 max-w-5xl">
          
          {/* === GAUCHE : CARTE SOURCE (Vidéo / URL) === */}
          <div className="w-full max-w-md lg:w-[380px] bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-3 sm:p-4 text-left transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Source brute
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                1 clic
              </span>
            </div>

            <div className="flex gap-2.5 items-stretch">
              {/* Vignette Vidéo YouTube */}
              <div className="relative flex-1 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video group">
                <Image
                  src="/images/hero/video_thumb.jpg"
                  alt="Vignette vidéo source"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                
                {/* Badge titre en haut à gauche */}
                <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                  How-to Video
                </div>

                {/* Bouton Play YouTube Orange au centre */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-orange-500/95 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 transform group-hover:scale-110 transition duration-300">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Barre de contrôle vidéo bas */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 flex items-center justify-between text-white text-[10px]">
                  <div className="flex items-center gap-1 font-mono">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>0:00</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Volume2 className="w-2.5 h-2.5" />
                    <Maximize2 className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>

              {/* Bouton / Onglet Submit URL */}
              <div className="w-28 sm:w-32 rounded-xl border border-dashed border-slate-300 hover:border-orange-400 bg-slate-50/80 hover:bg-orange-50/40 p-2 flex flex-col items-center justify-center text-center cursor-pointer transition">
                <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 mb-1.5 group-hover:text-orange-600">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-tight">
                  Coller URL
                </span>
                <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                  ou idée brute
                </span>
              </div>
            </div>
          </div>

          {/* === CENTRE : FAISCEAU D'ÉNERGIE / TRANSFORMATION IA === */}
          <div className="relative flex items-center justify-center py-2 lg:py-0 w-28 lg:w-36 shrink-0">
            {/* Lignes courbes d'énergie SVG */}
            <svg className="w-full h-16 lg:h-24 overflow-visible" viewBox="0 0 140 60" fill="none">
              <path 
                d="M 10 30 C 50 10, 90 50, 130 30" 
                stroke="url(#beam-gradient-1)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                className="opacity-90"
              />
              <path 
                d="M 10 35 C 50 45, 90 15, 130 30" 
                stroke="url(#beam-gradient-2)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                className="opacity-70"
              />
              <path 
                d="M 10 25 C 60 5, 80 55, 130 30" 
                stroke="url(#beam-gradient-3)" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
                className="opacity-60"
              />
              {/* Flèche d'arrivée */}
              <polygon points="128,26 138,30 128,34" fill="#f97316" />

              <defs>
                <linearGradient id="beam-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <linearGradient id="beam-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="60%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="beam-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Badge flottant Ghostwriter IA */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-xs border border-orange-200 shadow-sm px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-orange-600 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-orange-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Ghostwriter IA</span>
            </div>
          </div>

          {/* === DROITE : CARTE POST LINKEDIN MOCKUP === */}
          <div className="w-full max-w-md lg:w-[380px] bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-4 text-left transition-transform hover:-translate-y-1 duration-300">
            {/* Header Profil LinkedIn */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-xs font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">LinkedInForge</span>
                    <span className="text-[10px] text-slate-400 font-normal">• 1er</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-none">Studio de Contenu IA · 2h</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs tracking-widest font-mono">•••</span>
            </div>

            {/* Titre & Contenu du Post */}
            <div className="space-y-1.5 mb-3">
              <h3 className="font-bold text-slate-950 text-xs sm:text-sm uppercase tracking-tight leading-snug">
                CONVERTISSEZ VOTRE CONTENU EN POSTS PRÊTS À PUBLIER.
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed line-clamp-3">
                Une vidéo, un podcast ou une simple idée brute : l’IA extrait vos meilleurs arguments, adapte votre tonalité et structure une publication magnétique à fort impact.
              </p>
            </div>

            {/* Visuel du Post LinkedIn */}
            <div className="relative w-full rounded-xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-200/80 mb-3">
              <Image
                src="/images/hero/post_visual.jpg"
                alt="Visuel du post LinkedIn"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-orange-400" />
                <span>Visuel HD généré</span>
              </div>
            </div>

            {/* Barre d'actions LinkedIn */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <div className="flex items-center gap-1 hover:text-orange-600 transition cursor-pointer">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>J'aime</span>
              </div>
              <div className="flex items-center gap-1 hover:text-orange-600 transition cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Commenter</span>
              </div>
              <div className="flex items-center gap-1 hover:text-orange-600 transition cursor-pointer">
                <Repeat2 className="w-3.5 h-3.5" />
                <span>Republier</span>
              </div>
              <div className="flex items-center gap-1 hover:text-orange-600 transition cursor-pointer">
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Badges de Réassurance */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-300/80 text-orange-800 text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>GÉNÉRATEUR IMMÉDIAT • 5 CRÉDITS OFFERTS</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Sans carte bancaire requise</span>
          </div>
        </div>

        {/* 5. Gros Bouton CTA Principal */}
        <button
          onClick={handleScrollToDemo}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-display font-black text-base sm:text-lg text-white bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-size-200 hover:bg-right transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>CRÉER MON PREMIER POST</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 6. Tagline finale en bas */}
        <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-500 flex items-center justify-center gap-1.5">
          <span>LinkedInForge - Studio de Création de Contenu IA</span>
          <span>🪄</span>
        </p>

      </div>
    </section>
  );
}
