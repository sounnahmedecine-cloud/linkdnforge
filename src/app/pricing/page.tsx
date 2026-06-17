'use client';

import { useState } from 'react';
import { Check, Minus, Zap } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionLabel from '@/components/ui/SectionLabel';

const plans = [
  {
    name: 'Gratuit',
    monthly: 0,
    yearly: 0,
    desc: 'Pour découvrir LinkedInForge',
    cta: 'Commencer gratuitement',
    ctaHref: '/onboarding',
    popular: false,
    features: {
      'Génération de posts': '5 posts / mois',
      'Mode Ghostwriter': false,
      'Styles vocaux': '1 style',
      'Variantes par post': false,
      'Génération de visuels': false,
      'Extraction de profil auto': false,
      'Posts précédents (style perso)': false,
      'Historique des posts': false,
      'Calendrier éditorial': false,
      'Analytics': false,
      'Multi-comptes LinkedIn': false,
      'Support': 'Email',
    },
  },
  {
    name: 'Solo',
    monthly: 9,
    yearly: 7,
    desc: 'Pour les créateurs réguliers',
    cta: 'Essayer Solo',
    ctaHref: '/onboarding',
    popular: false,
    features: {
      'Génération de posts': '30 posts / mois',
      'Mode Ghostwriter': true,
      'Styles vocaux': 'Tous les styles',
      'Variantes par post': false,
      'Génération de visuels': '10 visuels / mois',
      'Extraction de profil auto': true,
      'Posts précédents (style perso)': true,
      'Historique des posts': false,
      'Calendrier éditorial': false,
      'Analytics': false,
      'Multi-comptes LinkedIn': false,
      'Support': 'Email prioritaire',
    },
  },
  {
    name: 'Pro',
    monthly: 19,
    yearly: 15,
    desc: 'Pour les entrepreneurs sérieux',
    cta: 'Passer Pro',
    ctaHref: '/onboarding',
    popular: true,
    features: {
      'Génération de posts': 'Illimité',
      'Mode Ghostwriter': true,
      'Styles vocaux': 'Tous les styles',
      'Variantes par post': '3 variantes',
      'Génération de visuels': 'Illimité',
      'Extraction de profil auto': true,
      'Posts précédents (style perso)': true,
      'Historique des posts': true,
      'Calendrier éditorial': 'Bientôt',
      'Analytics': 'Bientôt',
      'Multi-comptes LinkedIn': false,
      'Support': 'Chat prioritaire',
    },
  },
  {
    name: 'Agence',
    monthly: 49,
    yearly: 39,
    desc: 'Pour les équipes et agences',
    cta: 'Contacter les ventes',
    ctaHref: 'mailto:contact@linkdnforge.com',
    popular: false,
    features: {
      'Génération de posts': 'Illimité',
      'Mode Ghostwriter': true,
      'Styles vocaux': 'Tous les styles',
      'Variantes par post': '5 variantes',
      'Génération de visuels': 'Illimité',
      'Extraction de profil auto': true,
      'Posts précédents (style perso)': true,
      'Historique des posts': true,
      'Calendrier éditorial': 'Bientôt',
      'Analytics': 'Avancés — Bientôt',
      'Multi-comptes LinkedIn': '5 comptes',
      'Support': 'Account manager dédié',
    },
  },
];

const featureGroups = [
  {
    label: 'Génération de contenu',
    keys: ['Génération de posts', 'Mode Ghostwriter', 'Styles vocaux', 'Variantes par post'],
  },
  {
    label: 'Personnalisation',
    keys: ['Extraction de profil auto', 'Posts précédents (style perso)', 'Génération de visuels'],
  },
  {
    label: 'Productivité',
    keys: ['Historique des posts', 'Calendrier éditorial', 'Analytics', 'Multi-comptes LinkedIn'],
  },
  {
    label: 'Support',
    keys: ['Support'],
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-5 h-5 text-ember-400 mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-iron-600 mx-auto" />;
  if (typeof value === 'string' && value.includes('Bientôt')) {
    return (
      <span className="font-mono text-[11px] text-smoke-500 bg-iron-800 px-2 py-0.5 rounded-full">
        {value}
      </span>
    );
  }
  return <span className="text-sm text-smoke-300">{value}</span>;
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-iron-950 text-smoke-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-iron-950/90 backdrop-blur-md border-b border-iron-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <Button href="/onboarding">Commencer</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-20">
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <SectionLabel className="justify-center">Tarification</SectionLabel>
          <h1 className="font-display font-bold text-5xl sm:text-6xl leading-tight">
            Des tarifs pensés pour vous
          </h1>
          <p className="text-lg text-smoke-500 leading-relaxed">
            Pas d&apos;abonnement à 100€/mois. LinkedInForge est conçu pour les entrepreneurs
            indépendants — des prix honnêtes, des fonctionnalités qui comptent.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 bg-iron-900/60 border border-iron-800 rounded-xl p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${!yearly ? 'bg-iron-800 text-smoke-100' : 'text-smoke-500 hover:text-smoke-100'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${yearly ? 'bg-iron-800 text-smoke-100' : 'text-smoke-500 hover:text-smoke-100'}`}
            >
              Annuel
              <span className="font-mono text-[11px] bg-quench-500/15 text-quench-400 border border-quench-500/30 px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 flex flex-col gap-6 border transition ${
                plan.popular
                  ? 'bg-ember-500/[0.06] border-ember-500/50 shadow-[0_0_40px_-16px_rgba(255,90,31,0.4)]'
                  : 'bg-iron-900/50 border-iron-800 hover:border-iron-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge tone="ember">
                    <Zap className="w-3 h-3" /> Le plus populaire
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
                    <span className="text-smoke-500 text-sm pb-2">/ mois</span>
                  )}
                </div>
                {yearly && plan.monthly > 0 && (
                  <p className="text-xs text-smoke-500">
                    Facturé {(plan.yearly! * 12)}€ / an
                  </p>
                )}
              </div>

              <Button
                href={plan.ctaHref}
                variant={plan.popular ? 'primary' : plan.monthly === 0 ? 'outline' : 'outline'}
                className="w-full"
              >
                {plan.cta}
              </Button>

              <ul className="space-y-3 flex-1">
                {Object.entries(plan.features).map(([key, value]) => (
                  value !== false && (
                    <li key={key} className="flex items-start gap-3">
                      {value === true ? (
                        <Check className="w-4 h-4 text-ember-400 mt-0.5 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 mt-0.5 shrink-0 text-ember-400 text-xs font-bold flex items-center">→</span>
                      )}
                      <span className="text-sm text-smoke-300 leading-snug">
                        {value === true ? key : `${key} : ${value}`}
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
          <h2 className="font-display font-bold text-3xl text-center">Comparaison détaillée</h2>

          <div className="overflow-x-auto rounded-2xl border border-iron-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-iron-800 bg-iron-900/80">
                  <th className="text-left px-6 py-5 text-smoke-500 font-medium w-1/3">Fonctionnalité</th>
                  {plans.map((p) => (
                    <th key={p.name} className={`px-6 py-5 text-center font-display font-bold ${p.popular ? 'text-ember-400' : 'text-smoke-100'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureGroups.map((group) => (
                  <>
                    <tr key={group.label} className="bg-iron-900/40 border-b border-iron-800/60">
                      <td colSpan={5} className="px-6 py-3 font-mono text-xs font-semibold text-ember-400 uppercase tracking-widest">
                        {group.label}
                      </td>
                    </tr>
                    {group.keys.map((key) => (
                      <tr key={key} className="border-b border-iron-800/40 hover:bg-iron-800/20 transition">
                        <td className="px-6 py-4 text-smoke-300">{key}</td>
                        {plans.map((p) => (
                          <td key={p.name} className={`px-6 py-4 text-center ${p.popular ? 'bg-ember-500/5' : ''}`}>
                            <FeatureValue value={p.features[key as keyof typeof p.features]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="font-display font-bold text-3xl text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement."
              },
              {
                q: "Est-ce que le plan gratuit expire ?",
                a: "Non. Le plan gratuit est permanent — pas de période d'essai, pas de carte bancaire requise. Vous avez 5 posts par mois pour toujours."
              },
              {
                q: "Quelle IA est utilisée pour générer les posts ?",
                a: "LinkedInForge est propulsé par Gemini de Google, l'un des modèles de langage les plus avancés du marché."
              },
              {
                q: "Les fonctionnalités 'Bientôt' sont-elles incluses dans le prix ?",
                a: "Oui. Toutes les fonctionnalités listées comme 'Bientôt' seront incluses dans votre plan sans surcoût dès leur sortie."
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-iron-900/50 border border-iron-800 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-smoke-100">{q}</h3>
                <p className="text-smoke-500 leading-relaxed text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 bg-iron-900/50 border border-iron-800 rounded-2xl py-16 px-8">
          <h2 className="font-display font-bold text-4xl">Commencez gratuitement</h2>
          <p className="text-smoke-500">Aucune carte bancaire · Accès immédiat · 5 posts offerts</p>
          <Button href="/onboarding" size="lg">
            Créer mon compte gratuit
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-iron-800 py-8 mt-8">
        <p className="text-center text-smoke-500/70 text-sm">© 2026 LinkedInForge. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
