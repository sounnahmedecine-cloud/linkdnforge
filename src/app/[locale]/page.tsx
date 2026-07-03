'use client';

import { ArrowRight, PlayCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Logo, { AnvilMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionLabel from '@/components/ui/SectionLabel';
import Divider from '@/components/ui/Divider';
import StampNumber from '@/components/ui/StampNumber';
import Header from '@/components/layout/Header';

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

  return (
    <div className="w-full bg-iron-950 text-smoke-100">
      {/* Navigation */}
      <Header variant="marketing" pricingLabel={tNav('pricing')} ctaLabel={tNav('cta')} ctaHref="/login" />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: pitch */}
          <div className="space-y-8 animate-rise">
            <SectionLabel>{t('badge')}</SectionLabel>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[4.2rem] leading-[1.05] tracking-tight">
              {t('heroTitlePre')}{' '}
              <span className="text-ember-500">{t('heroTitleHighlight')}</span>
              {t('heroTitleSuffix')}
            </h1>
            <p className="text-lg text-smoke-300 max-w-xl leading-relaxed">{t('heroSubtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/login" size="lg">
                {t('ctaPrimary')} <ArrowRight className="w-5 h-5" />
              </Button>
              <Button href="#comment-ca-marche" variant="outline" size="lg">
                <PlayCircle className="w-5 h-5" /> {t('ctaSecondary')}
              </Button>
            </div>
          </div>

          {/* Right: the forge — raw note becomes a finished post */}
          <div className="relative">
            <div className="rounded-xl border border-dashed border-iron-700 bg-iron-900/40 p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-smoke-500 mb-3">
                {t('mockup.draftLabel')}
              </p>
              <p className="text-smoke-500 leading-relaxed text-[15px]">{t('mockup.draftText')}</p>
            </div>

            <div className="flex items-center gap-3 my-3 pl-5">
              <div className="w-px h-8 bg-gradient-to-b from-iron-700 to-ember-500/60" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-ember-400">
                {t('mockup.forgedLabel')}
              </span>
            </div>

            <div className="rounded-xl border border-ember-500/40 bg-iron-900 shadow-[0_0_40px_-12px_rgba(255,90,31,0.35)] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-iron-800 flex items-center justify-center">
                  <AnvilMark className="w-5 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-smoke-100 text-sm">{t('mockup.you')}</p>
                  <p className="text-xs text-smoke-500">{t('mockup.justNow')}</p>
                </div>
              </div>
              <p className="text-smoke-100 text-[15px] leading-relaxed">
                {t('mockup.postText')
                  .split('\n')
                  .map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-iron-800 text-xs text-smoke-500">
                <span>{t('mockup.likes')}</span>
                <span>{t('mockup.comments')}</span>
                <span>{t('mockup.share')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro band */}
      <section className="py-16 bg-iron-900/40 border-y border-iron-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xl sm:text-2xl font-display font-bold leading-snug">
            {t('introBand.title')}
          </p>
          <p className="text-smoke-500 leading-relaxed">{t('introBand.body')}</p>
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
            <p className="text-smoke-300 leading-relaxed">{t('guide.body')}</p>
          </div>

          <Divider />

          <div className="space-y-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl">{t('guide.howItWorks')}</h2>
            <div className="space-y-10">
              {guideSteps.map((s, i) => (
                <div key={s.title} className="flex gap-6 items-start">
                  <StampNumber n={i + 1} size="lg" />
                  <div className="space-y-2 pt-1">
                    <h3 className="text-xl font-semibold text-smoke-100">{s.title}</h3>
                    <p className="text-smoke-500 leading-relaxed">{s.body}</p>
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
            <p className="text-smoke-300 leading-relaxed">{t('guide.goldenRuleBody')}</p>
            <div className="pt-2">
              <Button href="/onboarding" size="lg">
                {t('guide.tryFree')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-28 bg-iron-900/30 border-y border-iron-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <SectionLabel className="justify-center">{t('pricingTeaser.label')}</SectionLabel>
            <h2 className="font-display font-bold text-4xl sm:text-5xl">
              {t('pricingTeaser.title')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-8 border transition ${
                  plan.popular
                    ? 'bg-ember-500/[0.06] border-ember-500/50'
                    : 'bg-iron-900/60 border-iron-800 hover:border-iron-700'
                }`}
              >
                {plan.popular && (
                  <Badge tone="ember" className="mb-4">
                    {t('pricingTeaser.popular')}
                  </Badge>
                )}
                <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                <p className="font-mono text-4xl font-semibold mb-1 text-smoke-100">
                  {plan.price}
                </p>
                <p className="text-sm text-smoke-500 mb-8">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-smoke-300">
                      <span className="text-ember-500 font-bold">+</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button href="/onboarding" variant={plan.popular ? 'primary' : 'outline'} className="w-full">
                  {t('pricingTeaser.cta')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="font-display font-bold text-5xl sm:text-6xl leading-tight">
            {t('finalCta.title')}
          </h2>
          <p className="text-lg text-smoke-300">{t('finalCta.body')}</p>
          <Button href="/onboarding" size="lg">
            {t('finalCta.cta')}
          </Button>
          <p className="text-smoke-500 text-sm">{t('finalCta.note')}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-iron-950 border-t border-iron-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo showBeta={false} className="mb-4" />
              <p className="text-smoke-500 text-sm">{t('footer.tagline')}</p>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-smoke-500 mb-4">
                {t('footer.product')}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#comment-ca-marche" className="text-smoke-500 hover:text-smoke-100 transition">{t('footer.features')}</a></li>
                <li><Link href="/pricing" className="text-smoke-500 hover:text-smoke-100 transition">{t('footer.pricing')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-smoke-500 mb-4">
                {t('footer.legal')}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-smoke-500 hover:text-smoke-100 transition">{t('footer.privacy')}</a></li>
                <li><a href="#" className="text-smoke-500 hover:text-smoke-100 transition">{t('footer.terms')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-smoke-500 mb-4">
                {t('footer.socials')}
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-smoke-500 hover:text-smoke-100 transition">Twitter</a></li>
                <li><a href="#" className="text-smoke-500 hover:text-smoke-100 transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-iron-800 pt-8 text-center text-sm text-smoke-500/70">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
