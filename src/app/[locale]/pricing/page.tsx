'use client';

import { Fragment, useState } from 'react';
import { Check, Minus, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionLabel from '@/components/ui/SectionLabel';
import Header from '@/components/layout/Header';

type FeatureKey =
  | 'posts'
  | 'ghostwriter'
  | 'toneStyles'
  | 'variants'
  | 'visuals'
  | 'autoProfile'
  | 'personalExamples'
  | 'history'
  | 'calendar'
  | 'analytics'
  | 'multiAccount'
  | 'support';

interface Plan {
  id: string;
  name: string;
  monthly: number;
  yearly: number;
  desc: string;
  cta: string;
  ctaHref: string;
  popular: boolean;
  features: Record<FeatureKey, string | boolean>;
}

interface FeatureGroup {
  label: string;
  keys: FeatureKey[];
}

interface FaqItem {
  q: string;
  a: string;
}

function FeatureValue({ value, soonLabel }: { value: string | boolean; soonLabel: string }) {
  if (value === true) return <Check className="w-5 h-5 text-ember-400 mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-iron-600 mx-auto" />;
  if (typeof value === 'string' && value.includes(soonLabel)) {
    return (
      <span className="font-mono text-[11px] text-smoke-500 bg-iron-800 px-2 py-0.5 rounded-full">
        {value}
      </span>
    );
  }
  return <span className="text-sm text-smoke-300">{value}</span>;
}

export default function PricingPage() {
  const tNav = useTranslations('nav');
  const t = useTranslations('pricing');
  const [yearly, setYearly] = useState(false);

  const plans = t.raw('plans') as Plan[];
  const featureGroups = t.raw('featureGroups') as FeatureGroup[];
  const featureLabels = t.raw('featureLabels') as Record<FeatureKey, string>;
  const faq = t.raw('faq') as FaqItem[];
  const soonLabel = t('soonLabel');

  return (
    <div className="min-h-screen bg-iron-950 text-smoke-100">
      {/* Nav */}
      <Header variant="marketing" showPricingLink={false} ctaLabel={tNav('ctaOnboarding')} ctaHref="/onboarding" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-20">
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <SectionLabel className="justify-center">{t('badge')}</SectionLabel>
          <h1 className="font-display font-bold text-5xl sm:text-6xl leading-tight">
            {t('title')}
          </h1>
          <p className="text-lg text-smoke-500 leading-relaxed">{t('subtitle')}</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 bg-iron-900/60 border border-iron-800 rounded-xl p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${!yearly ? 'bg-iron-800 text-smoke-100' : 'text-smoke-500 hover:text-smoke-100'}`}
            >
              {t('toggle.monthly')}
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${yearly ? 'bg-iron-800 text-smoke-100' : 'text-smoke-500 hover:text-smoke-100'}`}
            >
              {t('toggle.yearly')}
              <span className="font-mono text-[11px] bg-quench-500/15 text-quench-400 border border-quench-500/30 px-2 py-0.5 rounded-full">{t('toggle.yearlyDiscount')}</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-7 flex flex-col gap-6 border transition ${
                plan.popular
                  ? 'bg-ember-500/[0.06] border-ember-500/50 shadow-[0_0_40px_-16px_rgba(255,90,31,0.4)]'
                  : 'bg-iron-900/50 border-iron-800 hover:border-iron-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge tone="ember">
                    <Zap className="w-3 h-3" /> {t('popularBadge')}
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-xl font-display font-bold">{plan.name}</h2>
                <p className="text-sm text-smoke-500">{plan.desc}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-end gap-1">
                  <span className={`font-mono text-5xl font-semibold ${plan.popular ? 'text-ember-400' : 'text-smoke-100'}`}>
                    {plan.monthly === 0 ? '0' : `${yearly ? plan.yearly : plan.monthly}`}€
                  </span>
                  {plan.monthly > 0 && (
                    <span className="text-smoke-500 text-sm pb-2">{t('perMonth')}</span>
                  )}
                </div>
                {yearly && plan.monthly > 0 && (
                  <p className="text-xs text-smoke-500">
                    {t('billedYearly', { amount: plan.yearly * 12 })}
                  </p>
                )}
              </div>

              <Button
                href={plan.ctaHref}
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full"
              >
                {plan.cta}
              </Button>

              <ul className="space-y-3 flex-1">
                {(Object.entries(plan.features) as [FeatureKey, string | boolean][]).map(([key, value]) => (
                  value !== false && (
                    <li key={key} className="flex items-start gap-3">
                      {value === true ? (
                        <Check className="w-4 h-4 text-ember-400 mt-0.5 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 mt-0.5 shrink-0 text-ember-400 text-xs font-bold flex items-center">→</span>
                      )}
                      <span className="text-sm text-smoke-300 leading-snug">
                        {value === true ? featureLabels[key] : `${featureLabels[key]} : ${value}`}
                      </span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="space-y-8">
          <h2 className="font-display font-bold text-3xl text-center">{t('comparisonTitle')}</h2>

          <div className="overflow-x-auto rounded-2xl border border-iron-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-iron-800 bg-iron-900/80">
                  <th className="text-left px-6 py-5 text-smoke-500 font-medium w-1/3">{t('featureColumnLabel')}</th>
                  {plans.map((p) => (
                    <th key={p.id} className={`px-6 py-5 text-center font-display font-bold ${p.popular ? 'text-ember-400' : 'text-smoke-100'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureGroups.map((group) => (
                  <Fragment key={group.label}>
                    <tr className="bg-iron-900/40 border-b border-iron-800/60">
                      <td colSpan={5} className="px-6 py-3 font-mono text-xs font-semibold text-ember-400 uppercase tracking-widest">
                        {group.label}
                      </td>
                    </tr>
                    {group.keys.map((key) => (
                      <tr key={key} className="border-b border-iron-800/40 hover:bg-iron-800/20 transition">
                        <td className="px-6 py-4 text-smoke-300">{featureLabels[key]}</td>
                        {plans.map((p) => (
                          <td key={p.id} className={`px-6 py-4 text-center ${p.popular ? 'bg-ember-500/5' : ''}`}>
                            <FeatureValue value={p.features[key]} soonLabel={soonLabel} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="font-display font-bold text-3xl text-center">{t('faqTitle')}</h2>
          <div className="space-y-4">
            {faq.map(({ q, a }) => (
              <div key={q} className="bg-iron-900/50 border border-iron-800 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-smoke-100">{q}</h3>
                <p className="text-smoke-500 leading-relaxed text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 bg-iron-900/50 border border-iron-800 rounded-2xl py-16 px-8">
          <h2 className="font-display font-bold text-4xl">{t('finalCta.title')}</h2>
          <p className="text-smoke-500">{t('finalCta.note')}</p>
          <Button href="/onboarding" size="lg">
            {t('finalCta.cta')}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-iron-800 py-8 mt-8">
        <p className="text-center text-smoke-500/70 text-sm">{t('copyright')}</p>
      </footer>
    </div>
  );
}
