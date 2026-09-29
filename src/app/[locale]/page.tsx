'use client';

import { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Film, 
  Globe2, 
  Sparkles, 
  Check, 
  X as XIcon,
  Zap, 
  Layers,
  ShoppingBag,
  Briefcase,
  Users,
  Lightbulb,
  Share2
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import SectionLabel from '@/components/ui/SectionLabel';
import Header from '@/components/layout/Header';
import LandingLeadCapture from '@/components/landing/LandingLeadCapture';
import { trackCtaClick } from '@/lib/analytics';

interface Pillar {
  tag: string;
  title: string;
  body: string;
}

interface WorkflowStep {
  title: string;
  body: string;
}

interface Reason {
  title: string;
  body: string;
}

const COMPARISON_ROWS = [
  {
    feature: "Point de départ",
    generic: "Prompt de 30 lignes à imaginer soi-même",
    forge: "Workflow guidé (Vidéo, URL ou Idée brute)"
  },
  {
    feature: "Compréhension de la source",
    generic: "Copier-coller manuel ou hallucinations",
    forge: "Analyse audio/vidéo + scraping d'URL en 1 clic"
  },
  {
    feature: "Style & Voix",
    generic: "Clichés robotiques (« À l'ère du digital... »)",
    forge: "Ghostwriter adapté à votre voix authentique"
  },
  {
    feature: "Structure & Formatage",
    generic: "Blocs de texte denses et peu engageants",
    forge: "Accroches percutantes, aérations & hashtags"
  },
  {
    feature: "Multi-plateforme",
    generic: "Tout reformuler manuellement",
    forge: "LinkedIn + Facebook + Script vidéo en 1 clic"
  },
  {
    feature: "Essai gratuit",
    generic: "Carte bancaire ou inscription complexe",
    forge: "5 générations offertes sans carte bancaire"
  }
];

const PLATFORMS = [
  {
    name: "LinkedIn",
    badge: "Format Long & Autorité",
    icon: "💼",
    desc: "Storytelling, leçons d'affaires, phrases courtes et visuel Hero pour captiver votre réseau."
  },
  {
    name: "Facebook",
    badge: "Conversationnel",
    icon: "📘",
    desc: "Ton chaleureux, engagement communautaire et questions ouvertes qui déclenchent les commentaires."
  },
  {
    name: "TikTok & Reels",
    badge: "Scripts Courts",
    icon: "🎬",
    desc: "Accroche visuelle 0-3s, rythme dynamique et appel à l'action clair pour formats verticaux."
  },
  {
    name: "X (Twitter)",
    badge: "Threads & Punchlines",
    icon: "💬",
    desc: "Condensé des enseignements majeurs en phrases choc pour une mémorisation immédiate."
  }
];

export default function Home() {
  const tNav = useTranslations('nav');
  const t = useTranslations('landing');
  
  const pillars = t.raw('transformation.pillars') as Pillar[];
  const workflowSteps = t.raw('workflow.steps') as WorkflowStep[];
  const whyUsReasons = t.raw('whyUs.reasons') as Reason[];

  return (
    <div className="w-full bg-white text-slate-900 overflow-hidden">
      {/* 1. HEADER */}
      <Header 
        variant="marketing" 
        pricingLabel={tNav('pricing')} 
        ctaLabel={tNav('cta')} 
        ctaHref="#demo" 
      />

      {/* 2. HERO SECTION : ÉPURÉ & BRUTAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-18 sm:pb-18 text-center">
        <div className="max-w-4xl mx-auto space-y-5 animate-rise">
          <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
            {t('badge')}
          </SectionLabel>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-black">
            {t('heroTitle')}
          </h1>

          <p className="text-xl sm:text-2xl text-slate-800 leading-snug max-w-2xl mx-auto font-bold">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button 
              href="#demo" 
              onClick={() => {
                trackCtaClick('hero_cta_primary', 'landing_hero', '#demo');
                setTimeout(() => {
                  document.getElementById('landing-email-input')?.focus();
                }, 100);
              }}
              size="lg" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25 transition-transform hover:scale-[1.02]"
            >
              {t('ctaPrimary')}
            </Button>
            <a
              href="#comment-ca-marche"
              onClick={() => trackCtaClick('hero_cta_secondary', 'landing_hero', '#comment-ca-marche')}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
            >
              {t('ctaSecondary')}
            </a>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t('freeReassurance')}
          </p>
        </div>

        {/* Interactive Lead Capture & Live Demonstration Component */}
        <div id="demo" className="mt-12 scroll-mt-24">
          <LandingLeadCapture />
        </div>
      </section>

      {/* 3. SECTION SOMBRE : LA COMPRÉHENSION IA (LA DIFFÉRENCIATION CLÉ) */}
      <section className="py-20 bg-slate-950 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Intelligence Dédiée
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white leading-tight">
              {t('whyUs.title')}
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              {t('whyUs.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUsReasons.map((reason, i) => (
              <div 
                key={i} 
                className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 hover:border-orange-500/50 transition duration-300 space-y-3 relative overflow-hidden group"
              >
                <div className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                  {reason.title}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {reason.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION : PEU IMPORTE VOTRE POINT DE DÉPART (3 ENTRÉES) */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              Matière première
            </SectionLabel>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-black leading-tight">
              {t('transformation.title')}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t('transformation.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-300 transition duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="inline-block text-xs font-bold font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                    {pillar.tag}
                  </span>
                  <h3 className="font-display font-bold text-xl text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION : UN MÊME CONTENU, ADAPTÉ À CHAQUE PLATEFORME */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              Diffusion Omnicanale
            </SectionLabel>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-black leading-tight">
              {t('omnichannel.title')}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t('omnichannel.body')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLATFORMS.map((plat, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-orange-300 hover:bg-white hover:shadow-lg transition duration-300 space-y-3"
              >
                <div className="text-3xl">{plat.icon}</div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-slate-900">{plat.name}</h3>
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {plat.badge}
                  </span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {plat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION : TABLEAU COMPARATIF FACTUEL */}
      <section className="py-20 bg-slate-50/80 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              Comparatif Factuel
            </SectionLabel>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-black">
              Une IA généraliste vous donne du texte.
              <br />
              <span className="text-orange-500">LinkedInForge construit votre contenu.</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Pas de prompt complexe à inventer. Un workflow guidé de la matière brute jusqu'à la publication.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60">
                    <th className="py-4.5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Critères</th>
                    <th className="py-4.5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-center w-1/3">IA Générique (ChatGPT)</th>
                    <th className="py-4.5 px-6 font-bold text-orange-600 uppercase tracking-wider text-xs text-center w-1/3 bg-orange-50/50">LinkedInForge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">{row.feature}</td>
                      <td className="py-4 px-6 text-center text-slate-500 text-xs sm:text-sm">{row.generic}</td>
                      <td className="py-4 px-6 text-center text-slate-900 font-bold text-xs sm:text-sm bg-orange-50/20 text-orange-950">
                        {row.forge}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WORKFLOW (01 à 04) */}
      <section id="comment-ca-marche" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              {t('workflow.sectionLabel')}
            </SectionLabel>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-black leading-tight">
              {t('workflow.title')}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t('workflow.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div
                key={i}
                className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200 hover:border-orange-300 hover:bg-white hover:shadow-lg transition duration-300 space-y-3"
              >
                <div className="font-mono text-3xl font-black text-orange-500">
                  {`0${i + 1}`}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">
                  {step.title.replace(/^\d+\s*—\s*/, '')}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TEASER TARIFS */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-block text-xs font-bold font-mono px-3.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 uppercase tracking-wider">
            {t('pricingTeaser.label')}
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-black">
            {t('pricingTeaser.title')}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Testez LinkedInForge gratuitement avec 5 générations offertes. Passez à la formule Pro avec 7 jours d'essai sans risque dès que vous êtes prêt.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/25 transition transform hover:scale-105"
            >
              Découvrir les offres & tarifs
            </Link>
            <Link
              href="/forge"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold rounded-2xl transition"
            >
              Essayer le générateur
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Annulable à tout moment
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" /> 5 crédits offerts
            </span>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display font-bold text-4xl sm:text-6xl leading-tight">
            {t('finalCta.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-700">{t('finalCta.body')}</p>
          <Button href="/forge" size="lg" className="px-10 py-5 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25">
            {t('finalCta.cta')}
          </Button>
          <p className="text-slate-500 text-xs sm:text-sm">{t('finalCta.note')}</p>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo showBeta={false} className="mb-4" />
              <p className="text-slate-600 text-sm font-semibold">{t('footer.tagline')}</p>
              <p className="text-slate-400 text-xs mt-1">{t('subSlogan')}</p>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">
                {t('footer.product')}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/forge" className="text-slate-500 hover:text-slate-900 transition font-medium">Générateur IA</Link></li>
                <li><a href="#comment-ca-marche" className="text-slate-500 hover:text-slate-900 transition">{t('footer.features')}</a></li>
                <li><Link href="/pricing" className="text-slate-500 hover:text-slate-900 transition">{t('footer.pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">
                {t('footer.legal')}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-500 hover:text-slate-900 transition">{t('footer.privacy')}</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 transition">{t('footer.terms')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">
                {t('footer.socials')}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-500 hover:text-slate-900 transition">LinkedIn</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 transition">Twitter / X</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-500/70">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
