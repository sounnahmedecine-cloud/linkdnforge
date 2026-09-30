'use client';

import { Fragment, useState, useEffect } from 'react';
import { 
  Check, 
  CheckCircle2,
  Minus, 
  Zap, 
  ShieldCheck, 
  Lock, 
  Clock, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionLabel from '@/components/ui/SectionLabel';
import Header from '@/components/layout/Header';
import { Link } from '@/i18n/navigation';
import {
  trackViewPricing,
  trackBillingToggled,
  trackBeginCheckout,
} from '@/lib/analytics';

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

const BEFORE_YOU_CHOOSE = [
  {
    title: "Essai gratuit de 7 jours",
    desc: "Testez toutes les fonctionnalités Pro sans aucun risque pendant 7 jours. Vous pouvez annuler à tout moment avant la fin de l'essai sans être débité d'un seul centime."
  },
  {
    title: "Offre annuelle à -45%",
    desc: "L'abonnement annuel vous permet d'économiser près de la moitié du prix par rapport au mensuel. Un paiement unique par an, renouvelé automatiquement sauf annulation."
  },
  {
    title: "Annulation en 1 clic sans condition",
    desc: "Pas d'appel téléphonique, pas de formulaire dissuasif. Vous pouvez résilier en un clic depuis votre espace. Votre accès reste pleinement actif jusqu'à la fin de la période réglée."
  },
  {
    title: "Factures Pro avec TVA déductible",
    desc: "Tous les paiements sont sécurisés par Stripe. Vous recevez instantanément une facture officielle avec TVA pour déduire l'abonnement dans les charges de votre entreprise."
  }
];

export default function PricingPage() {
  const tNav = useTranslations('nav');
  const t = useTranslations('pricing');

  const [isYearly, setIsYearly] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [openConditionIndex, setOpenConditionIndex] = useState<number | null>(null);

  const plans = t.raw('plans') as Plan[];
  const featureGroups = t.raw('featureGroups') as FeatureGroup[];
  const featureLabels = t.raw('featureLabels') as Record<FeatureKey, string>;
  const faq = t.raw('faq') as FaqItem[];
  const soonLabel = t('soonLabel');

  useEffect(() => {
    trackViewPricing('pricing_page');
  }, []);

  const handleToggleBilling = () => {
    const nextVal = !isYearly;
    setIsYearly(nextVal);
    trackBillingToggled(nextVal ? 'yearly' : 'monthly');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleCondition = (index: number) => {
    setOpenConditionIndex(openConditionIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 1. Nav */}
      <Header 
        variant="marketing" 
        pricingLabel={tNav('pricing')} 
        ctaLabel={tNav('cta')} 
        ctaHref="/#demo" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
        {/* 2. Hero Section with Reassurance Chips (MoroAI inspired) */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <SectionLabel className="justify-center bg-orange-100 text-orange-600 border-orange-200 mx-auto w-fit">
            {t('badge')}
          </SectionLabel>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-black leading-[1.1] tracking-tight">
            Publiez avec autorité sans y passer vos nuits.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Immediate Reassurance Banner (MoroAI signature) */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 pt-3 text-xs sm:text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Paiement sécurisé par Stripe
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              7 jours d'essai sans engagement
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Annulable en 1 clic
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              Facture Pro avec TVA
            </span>
          </div>
        </div>

        {/* 3. Monthly / Yearly Toggle */}
        <div className="flex justify-center items-center gap-4">
          <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-black' : 'text-slate-400'}`}>
            {t('toggle.monthly')}
          </span>
          <button 
            type="button"
            onClick={handleToggleBilling}
            className="relative inline-flex h-8 w-16 items-center rounded-full bg-orange-500 transition-colors focus:outline-none shadow-inner"
            aria-label="Basculer entre facturation mensuelle et annuelle"
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${isYearly ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-black' : 'text-slate-400'} flex items-center gap-2`}>
            {t('toggle.yearly')} 
            <span className="text-xs font-black bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-sm">
              PROMO -45%
            </span>
          </span>
        </div>

        {/* 4. Strategic Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-[2.5rem] p-8 sm:p-10 border-2 transition-all duration-300 flex flex-col justify-between bg-white ${
                plan.popular
                  ? 'border-orange-500 shadow-2xl shadow-orange-500/20 scale-100 md:scale-[1.02] z-10'
                  : 'border-slate-200 shadow-lg shadow-slate-200/50 hover:border-orange-300 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-rose-500 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-rose-500/30 whitespace-nowrap">
                    <Zap className="w-4 h-4 fill-white" /> Recommandé · Meilleure Valeur
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    {plan.popular ? 'Formule Complète' : 'Option Flexible'}
                  </span>
                  <h2 className="text-3xl font-display font-black text-black">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">{plan.desc}</p>
                </div>

                <div className="space-y-2 text-center sm:text-left py-2 border-y border-slate-100">
                  <div className="flex items-baseline justify-center sm:justify-start gap-1">
                    <span className={`font-mono text-5xl sm:text-6xl font-black tracking-tight ${plan.popular ? 'text-orange-500' : 'text-black'}`}>
                      {isYearly ? plan.yearly : plan.monthly}€
                    </span>
                    <span className="text-slate-400 text-sm font-bold">/mois</span>
                  </div>
                  
                  <div>
                    {isYearly && plan.monthly > plan.yearly ? (
                      <p className="text-xs font-bold text-rose-600 bg-rose-50 inline-block px-3 py-1 rounded-full">
                        Économisez {(plan.monthly - plan.yearly) * 12}€ sur 1 an vs facturation mensuelle
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">Facturation mensuelle sans engagement</p>
                    )}
                  </div>
                </div>

                {/* Key Benefits */}
                <ul className="space-y-4 pt-2">
                  {(Object.entries(plan.features) as [FeatureKey, string | boolean][])
                    .filter(([_, val]) => val !== false)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <li key={key} className="flex items-start gap-3">
                        <div className="bg-orange-100 rounded-full p-1 shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-orange-600 stroke-[3]" />
                        </div>
                        <span className="text-sm text-slate-700 leading-snug">
                          {value === true ? (
                            <span className="font-bold text-slate-900">{featureLabels[key]}</span>
                          ) : (
                            <span><strong className="text-slate-900">{value}</strong> ({featureLabels[key]})</span>
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Action & Transparent Disclosure */}
              <div className="pt-8 space-y-3">
                <Button
                  href={`${plan.ctaHref}&billing=${isYearly ? 'yearly' : 'monthly'}`}
                  onClick={() => {
                    const isPro = plan.id === 'pro' || plan.name.toLowerCase().includes('pro');
                    trackBeginCheckout({
                      planId: isPro ? 'pro' : 'starter',
                      billing: isYearly ? 'yearly' : 'monthly',
                      value: isYearly ? (isPro ? 190 : 140) : (isPro ? 29 : 19),
                    });
                  }}
                  className={`w-full py-4 text-base font-bold rounded-2xl transition-transform hover:scale-[1.02] shadow-md ${
                    plan.popular 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30' 
                      : 'bg-black hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
                >
                  {plan.cta}
                </Button>
                <p className="text-[11px] text-center text-slate-400 leading-relaxed">
                  {plan.popular
                    ? "7 jours offerts. Carte requise. Annulation en 1 clic sans frais avant expiration."
                    : "Accès instantané. Annulable à tout moment depuis vos paramètres."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Section "Avant de choisir" (Transparence & Sécurité) */}
        <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/90 max-w-5xl mx-auto space-y-8">
          <div className="text-center sm:text-left space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-600 font-bold">
              Transparence & Sérénité
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-black">
              Avant de choisir votre offre
            </h2>
            <p className="text-slate-600 text-sm">
              Voici tout ce qui est garanti pour que vous puissiez tester et vous abonner en toute confiance.
            </p>
          </div>

          {/* Desktop 4 columns */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {BEFORE_YOU_CHOOSE.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden space-y-2">
            {BEFORE_YOU_CHOOSE.map((item, idx) => {
              const isOpen = openConditionIndex === idx;
              return (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCondition(idx)}
                    className="w-full px-4 py-3.5 text-left font-bold text-sm text-slate-900 flex items-center justify-between"
                  >
                    <span>{item.title}</span>
                    <span>{isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                      {item.desc}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Comprehensive Comparison Table */}
        <div className="space-y-8 max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/40">
          <div className="text-center space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-black">
              {t('comparisonTitle')}
            </h2>
            <p className="text-slate-500 text-sm">
              Découvrez en détail ce qui est inclus dans chaque formule.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left px-4 sm:px-6 py-5 text-slate-500 font-bold uppercase tracking-wider text-xs w-1/3">
                    {t('featureColumnLabel')}
                  </th>
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
                      <td colSpan={3} className="px-4 sm:px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-800 bg-slate-100/70 rounded-lg mt-4 inline-block w-full border-l-4 border-orange-500">
                        {group.label}
                      </td>
                    </tr>
                    {group.keys.map((key) => (
                      <tr key={key} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 text-slate-700 font-medium">{featureLabels[key]}</td>
                        {plans.map((p) => (
                          <td key={p.id} className={`px-4 sm:px-6 py-4 text-center ${p.popular ? 'bg-orange-50/20' : ''}`}>
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

        {/* 8. Pricing FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-8 pt-6">
          <div className="text-center space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-black">
              {t('faqTitle')}
            </h2>
            <p className="text-slate-500 text-sm">
              Toutes les réponses à vos questions de facturation et d'accès.
            </p>
          </div>

          <div className="space-y-3">
            {faq.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4.5 text-left font-bold text-slate-900 flex items-center justify-between gap-4"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base">{item.q}</span>
                    <span className="p-1 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 9. Final CTA Card */}
        <div className="text-center space-y-8 bg-slate-950 rounded-[2.5rem] py-16 px-6 sm:px-12 shadow-2xl shadow-black/20 text-white max-w-5xl mx-auto relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3.5 py-1 rounded-full">
              Commencez aujourd'hui
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl leading-tight text-white">
              {t('finalCta.title')}
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              {t('finalCta.note')}
            </p>
            <div className="pt-2">
              <Button
                href="/onboarding"
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white border-none px-10 py-5 text-base sm:text-lg font-bold rounded-2xl shadow-xl shadow-orange-500/25 hover:scale-105 transition-transform"
              >
                {t('finalCta.cta')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 10. Footer */}
      <footer className="border-t border-slate-200 py-12 mt-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-6 text-sm text-slate-500 font-medium">
            <Link href="/#demo" className="hover:text-slate-900 transition">Générateur</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition font-bold text-slate-900">Tarifs</Link>
            <Link href="/login" className="hover:text-slate-900 transition">Connexion</Link>
          </div>
          <p className="text-center text-slate-400 text-xs font-medium">{t('copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
