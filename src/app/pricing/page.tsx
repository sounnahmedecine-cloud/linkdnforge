'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Minus, Zap } from 'lucide-react';

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
  if (value === true) return <Check className="w-5 h-5 text-orange-400 mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-slate-600 mx-auto" />;
  if (typeof value === 'string' && value.includes('Bientôt')) {
    return (
      <span className="text-xs text-slate-500 font-medium bg-slate-800 px-2 py-0.5 rounded-full">
        {value}
      </span>
    );
  }
  return <span className="text-sm text-slate-300 font-light">{value}</span>;
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">in</span>
            <span className="text-lg font-semibold text-white">LinkedInForge</span>
            <span className="text-xs bg-orange-600/80 px-3 py-1 rounded-full font-medium">Beta</span>
          </Link>
          <Link href="/onboarding" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm">
            Commencer
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-20">

        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
            Des tarifs{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
              pensés pour vous
            </span>
          </h1>
          <p className="text-lg text-slate-400 font-light leading-relaxed">
            Pas d'abonnement à 100€/mois. LinkedInForge est conçu pour les entrepreneurs indépendants — des prix honnêtes, des fonctionnalités qui comptent.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-800/60 border border-slate-700 rounded-xl p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${!yearly ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${yearly ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Annuel
              <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">-20%</span>
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
                  ? 'bg-orange-500/8 border-orange-500 shadow-lg shadow-orange-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 bg-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
                    <Zap className="w-3 h-3" /> Le plus populaire
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="text-sm text-slate-400 font-light">{plan.desc}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-end gap-1">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-orange-400' : 'text-white'}`}>
                    {plan.monthly === 0 ? '0' : `${yearly ? plan.yearly : plan.monthly}`}€
                  </span>
                  {plan.monthly > 0 && (
                    <span className="text-slate-500 text-sm pb-2 font-light">/ mois</span>
                  )}
                </div>
                {yearly && plan.monthly > 0 && (
                  <p className="text-xs text-slate-500">
                    Facturé {(plan.yearly! * 12)}€ / an
                  </p>
                )}
              </div>

              <Link
                href={plan.ctaHref}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition ${
                  plan.popular
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : plan.monthly === 0
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'border border-slate-600 hover:border-slate-500 text-white hover:bg-slate-800'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3 flex-1">
                {Object.entries(plan.features).map(([key, value]) => (
                  value !== false && (
                    <li key={key} className="flex items-start gap-3">
                      {value === true ? (
                        <Check className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 mt-0.5 shrink-0 text-orange-400 text-xs font-bold flex items-center">→</span>
                      )}
                      <span className="text-sm text-slate-300 font-light leading-snug">
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
          <h2 className="text-3xl font-bold text-center">
            Comparaison{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
              détaillée
            </span>
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="text-left px-6 py-5 text-slate-400 font-medium w-1/3">Fonctionnalité</th>
                  {plans.map((p) => (
                    <th key={p.name} className={`px-6 py-5 text-center font-bold ${p.popular ? 'text-orange-400' : 'text-white'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureGroups.map((group) => (
                  <>
                    <tr key={group.label} className="bg-slate-900/40 border-b border-slate-800/60">
                      <td colSpan={5} className="px-6 py-3 text-xs font-semibold text-orange-400 uppercase tracking-widest">
                        {group.label}
                      </td>
                    </tr>
                    {group.keys.map((key) => (
                      <tr key={key} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition">
                        <td className="px-6 py-4 text-slate-300 font-light">{key}</td>
                        {plans.map((p) => (
                          <td key={p.name} className={`px-6 py-4 text-center ${p.popular ? 'bg-orange-500/5' : ''}`}>
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
          <h2 className="text-3xl font-bold text-center">
            Questions{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
              fréquentes
            </span>
          </h2>
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
              <div key={q} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-white">{q}</h3>
                <p className="text-slate-400 font-light leading-relaxed text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 bg-slate-900/50 border border-slate-800 rounded-2xl py-16 px-8">
          <h2 className="text-4xl font-bold">Commencez gratuitement</h2>
          <p className="text-slate-400 font-light">Aucune carte bancaire • Accès immédiat • 5 posts offerts</p>
          <Link
            href="/onboarding"
            className="inline-block px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition text-base"
          >
            Créer mon compte gratuit
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-8">
        <p className="text-center text-slate-600 text-sm font-light">© 2026 LinkedInForge. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
