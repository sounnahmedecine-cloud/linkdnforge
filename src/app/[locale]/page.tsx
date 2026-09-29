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
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Lock,
  Layers,
  ShoppingBag,
  Briefcase,
  Users
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

interface Plan {
  name: string;
  price: string;
  desc: string;
  features: string[];
  popular?: boolean;
}

const COMPARISON_ROWS = [
  {
    feature: "Compréhension d’une URL ou d’une page produit",
    generic: "Texte tronqué ou hallucinations",
    forge: "Scraping complet de l'offre & visuel Hero HD"
  },
  {
    feature: "Analyse audio & visuelle d'une vidéo brute (mp4, Reels)",
    generic: "Nécessite des outils tiers de transcription",
    forge: "Ingestion directe, détection des moments clés"
  },
  {
    feature: "Style d’écriture Ghostwriter authentique",
    generic: "Clichés robotiques (« À l'ère du digital... »)",
    forge: "Votre voix réelle, phrases courtes & percutantes"
  },
  {
    feature: "Formatage certifié algorithme LinkedIn",
    generic: "Bloc de texte brut difficile à lire",
    forge: "Accroches percutantes, aérations et hashtags ciblés"
  },
  {
    feature: "Génération omnicanale simultanée",
    generic: "Nécessite de reformuler chaque prompt",
    forge: "Post LinkedIn + Script TikTok + Thread X en 1 clic"
  },
  {
    feature: "Essai gratuit immédiat sans carte bancaire",
    generic: "Inscription ou abonnement requis",
    forge: "5 générations offertes immédiatement"
  }
];

const USE_CASES = [
  {
    id: "saas",
    title: "Fondateurs SaaS & Tech",
    icon: Sparkles,
    summary: "Transformez vos releases GitHub, vos pages d'accueil et vos retours clients en récits de fondateurs passionnants.",
    example: "Exemple typique : annoncer une nouvelle fonctionnalité sans sonner corporatif, raconter un échec technique surmonté."
  },
  {
    id: "freelance",
    title: "Freelances & Solopreneurs",
    icon: Briefcase,
    summary: "Montrez votre expertise de terrain pour attirer des clients qualifiés en message privé sans faire de prospection agressive.",
    example: "Exemple typique : décortiquer une étude de cas client avec chiffres et méthodologie concrète."
  },
  {
    id: "ecommerce",
    title: "E-commerçants & Boutiques",
    icon: ShoppingBag,
    summary: "Collez simplement l'URL d'un produit (Shopify, Amazon, niche) : l'IA extrait la proposition de valeur et forge un post engageant.",
    example: "Exemple typique : raconter les secrets de fabrication d'un parfum ou les coulisses d'un lancement de stock."
  },
  {
    id: "creator",
    title: "Créateurs & Consultants",
    icon: Users,
    summary: "Glissez une vidéo ou un mémo vocal : le moteur en extrait la thèse forte et la décline pour LinkedIn et les formats courts.",
    example: "Exemple typique : transformer un live ou un podcast de 2 minutes en 3 publications à fort engagement."
  }
];

export default function Home() {
  const tNav = useTranslations('nav');
  const t = useTranslations('landing');
  
  const pillars = t.raw('transformation.pillars') as Pillar[];
  const workflowSteps = t.raw('workflow.steps') as WorkflowStep[];
  const whyUsReasons = t.raw('whyUs.reasons') as Reason[];
  const plans = t.raw('pricingTeaser.plans') as Plan[];

  const [isYearly, setIsYearly] = useState(true);
  const [activeUseCase, setActiveUseCase] = useState(0);

  return (
    <div className="w-full bg-white text-slate-900 overflow-hidden">
      {/* 1. Header (MoroAI inspired) */}
      <Header 
        variant="marketing" 
        pricingLabel={tNav('pricing')} 
        ctaLabel={tNav('cta')} 
        ctaHref="/forge" 
      />

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-20 sm:pb-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-rise">
          <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
            {t('badge')}
          </SectionLabel>

          <h1 className="font-display font-black text-4xl sm:text-7xl leading-[1.08] tracking-tight text-black">
            {t('heroTitle')}
          </h1>

          <p className="text-xl sm:text-2xl text-slate-900 leading-snug max-w-3xl mx-auto font-bold">
            {t('heroSubtitle')}
          </p>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal">
            {t('heroDescription')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Button 
              href="/forge" 
              onClick={() => trackCtaClick('hero_cta_primary', 'landing_hero', '/forge')}
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

          <p className="text-xs sm:text-sm text-slate-400 font-medium pt-1">
            {t('freeReassurance')}
          </p>
        </div>

        {/* Interactive Lead Capture Showcase Component */}
        <div id="demo" className="mt-14 scroll-mt-24">
          <LandingLeadCapture />
        </div>
      </section>

      {/* 3. SECTION : POURQUOI UN OUTIL SPÉCIALISÉ ? (Confrontation Avant/Après MoroAI) */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              Le problème de l'IA générique
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white">
              Des posts LinkedIn que votre réseau lira vraiment jusqu'au bout.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Les algorithmes et les lecteurs repèrent instantanément les textes plats générés par ChatGPT. LinkdnForge adopte la structure des meilleurs créateurs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* ChatGPT Card */}
            <div className="bg-slate-800/80 rounded-3xl p-8 border border-slate-700 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800">
                    L'IA classique (ChatGPT / Outil générique)
                  </span>
                  <XIcon className="w-5 h-5 text-rose-400" />
                </div>
                <div className="font-mono text-xs text-slate-400 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 leading-relaxed italic">
                  « Dans le monde dynamique et en constante évolution d'aujourd'hui, le personal branding est crucial. Plongeons ensemble dans les 5 piliers incontournables de la croissance 🚀... »
                </div>
              </div>
              <p className="text-xs text-slate-400">
                ❌ Clichés verbeux, jargon artificiel, 0 personnalité, boudé par l’algorithme LinkedIn.
              </p>
            </div>

            {/* LinkdnForge Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl p-8 border-2 border-orange-500/80 shadow-2xl shadow-orange-500/10 space-y-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-300 bg-orange-950/80 px-3 py-1 rounded-full border border-orange-500/50">
                    Forgé avec LinkdnForge
                  </span>
                  <Check className="w-5 h-5 text-orange-400" />
                </div>
                <div className="font-sans text-xs sm:text-sm text-slate-200 bg-slate-950/90 p-5 rounded-2xl border border-orange-500/30 leading-relaxed space-y-2">
                  <p className="font-bold text-white">« On a passé 3 semaines à peaufiner notre landing page.</p>
                  <p>Résultat le premier jour : 0 vente.</p>
                  <p>Voici la seule modification qui a tout changé (et pourquoi vous faites sûrement la même erreur) : »</p>
                </div>
              </div>
              <p className="text-xs text-orange-300 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Accroche percutante, rythme aéré, storytelling authentique et visuel Hero extrait en direct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION : 3 PILIERS (Matière Première) */}
      <section className="py-24 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              Matière première
            </SectionLabel>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-black leading-tight">
              {t('transformation.title')}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {t('transformation.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-300 transition duration-300 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <span className="inline-block text-xs font-bold font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                    {pillar.tag}
                  </span>
                  <h3 className="font-display font-bold text-2xl text-slate-900 leading-snug">
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

      {/* 5. SECTION : CAS D'USAGE PAR PROFIL (MoroAI inspired "La vraie vie") */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              Cas d'usage concrets
            </SectionLabel>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-black leading-tight">
              LinkdnForge taillé pour votre profil et vos objectifs
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Chaque activité possède sa propre matière première. Voici comment nos utilisateurs l'exploitent au quotidien :
            </p>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex justify-center gap-3">
            {USE_CASES.map((uc, index) => {
              const Icon = uc.icon;
              const isActive = activeUseCase === index;
              return (
                <button
                  key={uc.id}
                  type="button"
                  onClick={() => setActiveUseCase(index)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{uc.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content (Desktop) */}
          <div className="hidden sm:block max-w-3xl mx-auto bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-4">
            <h3 className="font-display font-bold text-2xl text-slate-900">
              {USE_CASES[activeUseCase].title}
            </h3>
            <p className="text-slate-700 text-base leading-relaxed">
              {USE_CASES[activeUseCase].summary}
            </p>
            <p className="text-xs font-mono font-semibold text-orange-600 bg-orange-50 p-3 rounded-xl border border-orange-200">
              💡 {USE_CASES[activeUseCase].example}
            </p>
          </div>

          {/* Mobile Accordion */}
          <div className="sm:hidden space-y-4">
            {USE_CASES.map((uc, index) => {
              const Icon = uc.icon;
              return (
                <div key={uc.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2.5 font-bold text-slate-900 text-lg">
                    <Icon className="w-5 h-5 text-orange-500" />
                    <h4>{uc.title}</h4>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{uc.summary}</p>
                  <p className="text-xs font-mono text-orange-600 bg-orange-50 p-2.5 rounded-lg border border-orange-100">
                    💡 {uc.example}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SECTION : TABLEAU COMPARATIF MATRICIEL (MoroAI signature) */}
      <section className="py-24 bg-slate-50/80 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              Exigence & Vérité
            </SectionLabel>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-black">
              Pourquoi utiliser un outil spécialisé plutôt qu'une IA générale ?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              ChatGPT est fait pour tout faire moyennement. LinkdnForge est fait pour forger des posts LinkedIn qui convertissent.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/50">
                    <th className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs">Critères</th>
                    <th className="py-5 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-center w-1/3">IA Générique (ChatGPT)</th>
                    <th className="py-5 px-6 font-bold text-orange-600 uppercase tracking-wider text-xs text-center w-1/3 bg-orange-50/50">LinkdnForge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition">
                      <td className="py-4.5 px-6 font-semibold text-slate-900">{row.feature}</td>
                      <td className="py-4.5 px-6 text-center text-slate-500 text-xs sm:text-sm">{row.generic}</td>
                      <td className="py-4.5 px-6 text-center text-slate-900 font-bold text-xs sm:text-sm bg-orange-50/20 text-orange-900">
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
      <section id="comment-ca-marche" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              {t('workflow.sectionLabel')}
            </SectionLabel>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-black leading-tight">
              {t('workflow.title')}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {t('workflow.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div
                key={i}
                className="bg-slate-50/70 rounded-3xl p-7 border border-slate-200 hover:border-orange-300 hover:bg-white hover:shadow-lg transition duration-300 space-y-3"
              >
                <div className="font-mono text-3xl font-black text-orange-500">
                  {`0${i + 1}`}
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 leading-snug">
                  {step.title.replace(/^\d+\s*-\s*/, '')}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. DIFFUSION OMNICANALE */}
      <section className="py-20 bg-slate-950 text-white rounded-3xl mx-4 sm:mx-8 lg:mx-auto max-w-6xl my-12 p-8 sm:p-14 border border-slate-800 shadow-2xl">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-block text-xs font-bold tracking-wider uppercase text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3.5 py-1 rounded-full">
            Diffusion Omnicanale
          </span>
          <h2 className="font-display font-black text-4xl sm:text-5xl leading-tight text-white">
            {t('omnichannel.title')}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {t('omnichannel.body')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white flex items-center gap-2">
              💼 LinkedIn
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white flex items-center gap-2">
              📘 Facebook
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white flex items-center gap-2">
              🎬 TikTok & Reels
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white flex items-center gap-2">
              💬 X (Twitter) & Reddit
            </span>
          </div>
          <p className="text-xs text-slate-400 pt-2 italic">
            {t('omnichannel.videoNote')}
          </p>
        </div>
      </section>

      {/* 9. TEASER TARIFS VERS PAGE DÉDIÉE */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="inline-block text-xs font-bold font-mono px-3.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 uppercase tracking-wider">
            {t('pricingTeaser.label')}
          </span>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-black">
            {t('pricingTeaser.title')}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Testez LinkdnForge gratuitement avec 5 générations offertes. Passez à la formule Pro avec 7 jours d'essai sans risque dès que vous êtes prêt.
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
              <Clock className="w-4 h-4 text-orange-500" /> Essai gratuit de 7 jours
            </span>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-28 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="font-display font-bold text-5xl sm:text-6xl leading-tight">
            {t('finalCta.title')}
          </h2>
          <p className="text-lg text-slate-700">{t('finalCta.body')}</p>
          <Button href="/forge" size="lg" className="px-10 py-5 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25">
            {t('finalCta.cta')}
          </Button>
          <p className="text-slate-500 text-sm">{t('finalCta.note')}</p>
        </div>
      </section>

      {/* 11. FOOTER */}
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
