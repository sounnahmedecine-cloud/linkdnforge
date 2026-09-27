'use client';

import { useState } from 'react';
import { ArrowRight, PlayCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo, { AnvilMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionLabel from '@/components/ui/SectionLabel';
import Divider from '@/components/ui/Divider';
import StampNumber from '@/components/ui/StampNumber';
import Header from '@/components/layout/Header';
import LandingGenerator from '@/components/landing/LandingGenerator';

interface GuideStep {
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
  const guideSteps = t.raw('guide.steps') as GuideStep[];
  const plans = t.raw('pricingTeaser.plans') as Plan[];

  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="w-full bg-white text-slate-900">
      {/* Navigation */}
      <Header variant="marketing" pricingLabel={tNav('pricing')} ctaLabel={tNav('cta')} ctaHref="/login" />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-rise">
          <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">{t('badge')}</SectionLabel>
          <h1 className="font-display font-black text-5xl sm:text-7xl leading-[1.1] tracking-tight text-black">
            {t('heroTitlePre')}{' '}
            <span className="text-orange-500">{t('heroTitleHighlight')}</span>
            {t('heroTitleSuffix')}
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            {t('heroSubtitle')}
          </p>
        </div>

        <LandingGenerator plans={plans} />
      </section>

      {/* Intro band */}
      <section className="py-16 bg-slate-50/40 border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xl sm:text-2xl font-display font-bold leading-snug">
            {t('introBand.title')}
          </p>
          <p className="text-slate-500 leading-relaxed">{t('introBand.body')}</p>
        </div>
      </section>

      {/* Guide */}
      <section id="comment-ca-marche" className="py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="space-y-5">
            <SectionLabel>{t('guide.sectionLabel')}</SectionLabel>
            <h2 className="font-display font-bold text-4xl sm:text-5xl leading-tight">
              {t('guide.title')}
            </h2>
            <p className="text-slate-700 leading-relaxed">{t('guide.body')}</p>
          </div>

          <Divider />

          <div className="space-y-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl">{t('guide.howItWorks')}</h2>
            <div className="space-y-10">
              {guideSteps.map((s, i) => (
                <div key={s.title} className="flex gap-6 items-start">
                  <StampNumber n={i + 1} size="lg" />
                  <div className="space-y-2 pt-1">
                    <h3 className="text-xl font-semibold text-slate-900">{s.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div className="space-y-5">
            <SectionLabel>{t('guide.goldenRuleLabel')}</SectionLabel>
            <h2 className="font-display font-bold text-3xl sm:text-4xl">
              {t('guide.goldenRuleTitle')}
            </h2>
            <p className="text-slate-700 leading-relaxed">{t('guide.goldenRuleBody')}</p>
            <div className="pt-2">
              <Button href="/onboarding" size="lg">
                {t('guide.tryFree')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-28 bg-white border-y border-slate-200">
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
              Annuel <span className="text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-sm">PROMO</span>
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
                  href={`/api/stripe/checkout?plan=${plan.name.toLowerCase()}&billing=${isYearly ? 'yearly' : 'monthly'}`} 
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
              <span>Essai gratuit de 14 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              <span>Annulable sans frais</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="font-display font-bold text-5xl sm:text-6xl leading-tight">
            {t('finalCta.title')}
          </h2>
          <p className="text-lg text-slate-700">{t('finalCta.body')}</p>
          <Button href="/onboarding" size="lg">
            {t('finalCta.cta')}
          </Button>
          <p className="text-slate-500 text-sm">{t('finalCta.note')}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo showBeta={false} className="mb-4" />
              <p className="text-slate-500 text-sm">{t('footer.tagline')}</p>
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
                <li><a href="#" className="text-slate-500 hover:text-slate-900 transition">Twitter</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 transition">LinkedIn</a></li>
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
