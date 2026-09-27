'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Film, Globe2, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import SectionLabel from '@/components/ui/SectionLabel';
import Header from '@/components/layout/Header';
import LandingGenerator from '@/components/landing/LandingGenerator';

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

export default function Home() {
  const tNav = useTranslations('nav');
  const t = useTranslations('landing');
  
  const pillars = t.raw('transformation.pillars') as Pillar[];
  const workflowSteps = t.raw('workflow.steps') as WorkflowStep[];
  const whyUsReasons = t.raw('whyUs.reasons') as Reason[];
  const plans = t.raw('pricingTeaser.plans') as Plan[];

  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="w-full bg-white text-slate-900 overflow-hidden">
      {/* Navigation */}
      <Header variant="marketing" pricingLabel={tNav('pricing')} ctaLabel={tNav('cta')} ctaHref="/login" />

      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 sm:pt-24 sm:pb-24 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-rise">
          <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
            {t('badge')}
          </SectionLabel>

          <h1 className="font-display font-black text-5xl sm:text-7xl leading-[1.08] tracking-tight text-black">
            {t('heroTitle')}
          </h1>

          <p className="text-xl sm:text-2xl text-slate-900 leading-snug max-w-3xl mx-auto font-bold">
            {t('heroSubtitle')}
          </p>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {t('heroDescription')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Button href="/onboarding" size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25 transition-transform hover:scale-[1.02]">
              {t('ctaPrimary')}
            </Button>
            <a
              href="#comment-ca-marche"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
            >
              {t('ctaSecondary')}
            </a>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 font-medium pt-1">
            {t('freeReassurance')}
          </p>
        </div>

        {/* Interactive Showcase / Hero Demo Component */}
        <div className="mt-14">
          <LandingGenerator plans={plans} />
        </div>
      </section>

      {/* 2. SECTION : VOTRE CONTENU, SANS REPARTIR DE ZÉRO (3 PILIERS) */}
      <section className="py-24 bg-slate-50/70 border-y border-slate-200">
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

      {/* 3. SECTION : DE VOTRE CONTENU BRUT À UNE PUBLICATION PRÊTE À PARTAGER (WORKFLOW 01 À 04) */}
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
                  {step.title.replace(/^\d+\s*—\s*/, '')}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION : UN SEUL CONTENU PEUT ALIMENTER PLUSIEURS RÉSEAUX (OMNICANAL) */}
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
              👥 Facebook
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white flex items-center gap-2">
              🎵 TikTok & Reels
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white flex items-center gap-2">
              🐦 X (Twitter) & Reddit
            </span>
          </div>
          <p className="text-xs text-slate-400 pt-2 italic">
            {t('omnichannel.videoNote')}
          </p>
        </div>
      </section>

      {/* 5. SECTION : POURQUOI LINKEDINFORGE ? (FACTUELLE & PREMIUM) */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
              Exigence & Vérité
            </SectionLabel>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-black leading-tight">
              {t('whyUs.title')}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {t('whyUs.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {whyUsReasons.map((reason, i) => (
              <div
                key={i}
                className="bg-slate-50/80 rounded-3xl p-8 border border-slate-200 hover:border-orange-300 transition duration-300 space-y-3"
              >
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  {reason.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {reason.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION : LE CONTENU QUE VOUS AVEZ DÉJÀ EST UNE MATIÈRE PREMIÈRE */}
      <section className="py-24 bg-gradient-to-b from-orange-50/50 via-white to-white border-y border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display font-black text-4xl sm:text-5xl text-black leading-tight">
            {t('rawMaterial.title')}
          </h2>
          <p className="text-slate-700 text-base sm:text-lg leading-relaxed">
            {t('rawMaterial.body')}
          </p>
          <p className="text-slate-900 font-bold text-lg sm:text-xl">
            {t('rawMaterial.action')}
          </p>
          <div className="pt-4">
            <Button
              href="/onboarding"
              size="lg"
              className="px-10 py-5 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25 transition-transform hover:scale-105"
            >
              {t('rawMaterial.cta')}
            </Button>
          </div>
        </div>
      </section>

      {/* 7. SECTION : TARIFS */}
      <section className="py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-4">
            <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200">{t('pricingTeaser.label')}</SectionLabel>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-black">
              {t('pricingTeaser.title')}
            </h2>
          </div>

          <div className="flex justify-center items-center gap-4 mb-12">
            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-black' : 'text-slate-400'}`}>Mensuel</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-orange-500 transition-colors focus:outline-none shadow-inner"
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${isYearly ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-black' : 'text-slate-400'} flex items-center gap-2`}>
              Annuel <span className="text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-sm">PROMO -45%</span>
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.filter(p => p.desc.includes('an') === isYearly).map((plan, index) => (
              <div
                key={plan.name + index}
                className={`relative rounded-[2rem] p-8 sm:p-10 border-2 transition-all duration-300 bg-white ${
                  plan.popular
                    ? 'border-orange-500 shadow-2xl shadow-orange-500/20 scale-100 sm:scale-105 z-10'
                    : 'border-slate-200 shadow-lg shadow-slate-200/50 hover:border-orange-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-rose-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/30 whitespace-nowrap">
                      {t('pricingTeaser.popular')}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-display font-bold mb-2 text-black text-center">{plan.name}</h3>
                <p className="font-mono text-5xl sm:text-6xl font-black mb-1 text-center mt-6">
                  <span className={plan.popular ? 'text-orange-500' : 'text-black'}>{plan.price}</span>
                </p>
                <p className="text-sm text-slate-500 mb-8 text-center font-medium">/mois</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-slate-700 font-medium">
                      <span className="text-orange-500 font-black flex items-center justify-center w-5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  href={`/api/stripe/checkout?plan=${plan.name.toLowerCase().includes('pro') ? 'pro' : 'starter'}&billing=${isYearly ? 'yearly' : 'monthly'}`} 
                  className={`w-full py-4 text-base font-bold rounded-2xl transition-transform hover:scale-105 shadow-md ${
                    plan.popular 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30' 
                      : 'bg-black hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
                >
                  {t('pricingTeaser.cta')}
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mt-16 pt-10 border-t border-slate-200 text-slate-600 font-medium max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>Satisfait ou remboursé</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-500" />
              <span>Essai gratuit de 7 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              <span>Annulable sans frais</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-28 bg-slate-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="font-display font-bold text-5xl sm:text-6xl leading-tight">
            {t('finalCta.title')}
          </h2>
          <p className="text-lg text-slate-700">{t('finalCta.body')}</p>
          <Button href="/onboarding" size="lg" className="px-10 py-5 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25">
            {t('finalCta.cta')}
          </Button>
          <p className="text-slate-500 text-sm">{t('finalCta.note')}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-16">
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
