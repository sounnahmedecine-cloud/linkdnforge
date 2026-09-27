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
  | 'videoAutopilot'
  | 'heroCapture'
  | 'tiktokReels'
  | 'waterfall'
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
  if (value === true) return <Check className="w-5 h-5 text-orange-500 mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-slate-300 mx-auto" />;
  if (typeof value === 'string' && value.includes(soonLabel)) {
    return (
      <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
        {value}
      </span>
    );
  }
  return <span className="text-sm text-slate-700 font-medium">{value}</span>;
}

export default function PricingPage() {
  const tNav = useTranslations('nav');
  const t = useTranslations('pricing');

  const [isYearly, setIsYearly] = useState(true);

  const plans = t.raw('plans') as Plan[];
  const featureGroups = t.raw('featureGroups') as FeatureGroup[];
  const featureLabels = t.raw('featureLabels') as Record<FeatureKey, string>;
  const faq = t.raw('faq') as FaqItem[];
  const soonLabel = t('soonLabel');

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <Header variant="marketing" showPricingLink={false} ctaLabel={tNav('ctaOnboarding')} ctaHref="/onboarding" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200">
            {t('badge')}
          </SectionLabel>
          <h1 className="font-display font-bold text-5xl sm:text-6xl leading-tight text-black">
            {t('title')}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">{t('subtitle')}</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-4">
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

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-[2rem] p-8 sm:p-10 flex flex-col gap-8 border-2 transition-all duration-300 bg-white ${
                plan.popular
                  ? 'border-orange-500 shadow-2xl shadow-orange-500/20 scale-100 sm:scale-105 z-10'
                  : 'border-slate-200 shadow-lg shadow-slate-200/50 hover:border-orange-300 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-rose-500 text-white text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-rose-500/30 whitespace-nowrap">
                    <Zap className="w-4 h-4 fill-white" /> Les plus populaires
                  </span>
                </div>
              )}

              <div className="space-y-3 text-center">
                <h2 className="text-2xl font-display font-bold text-black">
                  {plan.name}
                </h2>
                <p className="text-sm text-slate-500 font-medium">{plan.desc}</p>
              </div>

              <div className="space-y-2 text-center">
                <div className="flex items-end justify-center gap-1">
                  <span className={`font-mono text-6xl sm:text-7xl font-black tracking-tight ${plan.popular ? 'text-orange-500' : 'text-black'}`}>
                    {isYearly ? plan.yearly : plan.monthly}€
                  </span>
                  <span className="text-slate-400 text-sm font-bold pb-3">/mois</span>
                </div>
                
                <div className="h-6">
                  {isYearly && plan.monthly > plan.yearly ? (
                    <p className="text-sm text-rose-500 font-bold bg-rose-50 inline-block px-3 py-1 rounded-full">
                      Soit {(plan.monthly - plan.yearly) * 12}€ d'économie par an !
                    </p>
                  ) : null}
                </div>
              </div>

              <Button
                href={`${plan.ctaHref}&billing=${isYearly ? 'yearly' : 'monthly'}`}
                className={`w-full py-4 text-base font-bold rounded-2xl transition-transform hover:scale-105 shadow-md ${
                  plan.popular 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30' 
                    : 'bg-black hover:bg-slate-800 text-white shadow-slate-900/20'
                }`}
              >
                {plan.cta}
              </Button>

              <div className="pt-8 border-t-2 border-slate-100 flex-1">
                <ul className="space-y-5">
                  {(Object.entries(plan.features) as [FeatureKey, string | boolean][]).map(([key, value]) => (
                    value !== false && (
                      <li key={key} className="flex items-start gap-3">
                        {value === true ? (
                          <div className="bg-orange-100 rounded-full p-1 shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-orange-600 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="bg-slate-100 rounded-full p-1 shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-slate-600 stroke-[3]" />
                          </div>
                        )}
                        <span className="text-sm text-slate-600 leading-snug">
                          {value === true ? (
                            <span className="font-semibold text-slate-900">{featureLabels[key]}</span>
                          ) : (
                            <span><span className="font-bold text-slate-900">{value}</span> ({featureLabels[key]})</span>
                          )}
                        </span>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="space-y-8 max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/40">
          <h2 className="font-display font-bold text-3xl text-center text-black">{t('comparisonTitle')}</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left px-4 sm:px-6 py-5 text-slate-500 font-bold uppercase tracking-wider text-xs w-1/3">{t('featureColumnLabel')}</th>
                  {plans.map((p) => (
                    <th key={p.id} className={`px-4 sm:px-6 py-5 text-center font-display font-bold text-xl ${p.popular ? 'text-orange-500' : 'text-black'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureGroups.map((group) => (
                  <Fragment key={group.label}>
                    <tr>
                      <td colSpan={3} className="px-4 sm:px-6 py-4 font-bold text-sm text-slate-800 bg-slate-50 rounded-lg mt-4 inline-block w-full border-l-4 border-orange-500">
                        {group.label}
                      </td>
                    </tr>
                    {group.keys.map((key) => (
                      <tr key={key} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 sm:px-6 py-5 text-slate-700 font-medium">{featureLabels[key]}</td>
                        {plans.map((p) => (
                          <td key={p.id} className={`px-4 sm:px-6 py-5 text-center ${p.popular ? 'bg-orange-50/30' : ''}`}>
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
        <div className="max-w-3xl mx-auto space-y-10 pt-10">
          <h2 className="font-display font-bold text-3xl text-center text-black">{t('faqTitle')}</h2>
          <div className="grid gap-4">
            {faq.map(({ q, a }) => (
              <div key={q} className="bg-white border-2 border-slate-100 rounded-2xl p-6 sm:p-8 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
                <h3 className="font-bold text-black text-lg mb-3 flex items-start gap-3">
                  <span className="text-orange-500 text-xl font-black">Q.</span>
                  {q}
                </h3>
                <p className="text-slate-600 leading-relaxed pl-7">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-8 bg-black rounded-[2.5rem] py-16 px-6 sm:px-12 shadow-2xl shadow-black/20 text-white max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-rose-500/20 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-display font-bold text-4xl sm:text-5xl leading-tight">{t('finalCta.title')}</h2>
            <p className="text-slate-300 text-lg">{t('finalCta.note')}</p>
            <div className="pt-4">
              <Button href="/onboarding" size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-none px-10 py-5 text-lg font-bold rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform">
                {t('finalCta.cta')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 mt-12 bg-slate-50">
        <p className="text-center text-slate-500 text-sm font-medium">{t('copyright')}</p>
      </footer>
    </div>
  );
}
