'use client';

import { Zap, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-500">in</span>
            <span className="text-xl font-bold">LinkedInForge</span>
            <span className="text-xs bg-orange-600 px-2 py-1 rounded-full">Beta</span>
          </div>
          <Link href="/onboarding" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold">
            Commencer
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <span className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/50">
              ✨ Générez des posts LinkedIn comme un pro
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Posts LinkedIn<br />qui génèrent des <span className="text-orange-500">leads</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            LinkedInForge combine l'artisanat humain et la puissance de l'IA pour créer des posts LinkedIn à haute autorité.
            Parfait pour les freelances, entrepreneurs et e-commerçants.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/onboarding" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2">
              Créer mon premier post <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 border-2 border-slate-600 text-white rounded-lg hover:border-slate-500 transition font-semibold">
              📹 Voir la démo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800/50 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-orange-500">+50%</p>
              <p className="text-slate-400">Engagement moyen</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-500">2x</p>
              <p className="text-slate-400">Temps gagné par post</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-500">100+</p>
              <p className="text-slate-400">Posts créés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Pourquoi choisir LinkedInForge ?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "IA Intelligente",
                desc: "Claude 3 génère 3 variantes optimisées de votre post"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Score d'Engagement",
                desc: "Chaque variante reçoit un score prédictif 0-100"
              },
              {
                icon: <span className="text-2xl">🌐</span>,
                title: "Multicanal",
                desc: "Créez pour LinkedIn et Facebook en même temps"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Plan Éditorial",
                desc: "Planifiez vos posts pour les 4 prochaines semaines"
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Analytics",
                desc: "Suivez impressions, engagements et taux de conversion"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Équipe",
                desc: "Collaborez avec votre équipe (à venir)"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-blue-600 transition space-y-4">
                <div className="text-orange-500">{feature.icon}</div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-800/50 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Tarifs simples et transparents
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Gratuit",
                price: "0€",
                desc: "Pour tester",
                features: ["5 posts/mois", "Génération simple", "Pas de scoring"]
              },
              {
                name: "Founder",
                price: "49€",
                desc: "/mois ou 490€/an",
                features: ["Illimité", "3 variantes par post", "Scoring d'engagement", "Plan éditorial", "Analytics"],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "Pour les équipes",
                features: ["Tout Founder +", "Multi-user", "API", "Support prioritaire"]
              }
            ].map((plan, idx) => (
              <div key={idx} className={`rounded-xl p-8 transition ${plan.popular ? 'bg-orange-500 scale-105' : 'bg-slate-800 border border-slate-700'}`}>
                {plan.popular && (
                  <span className="inline-block bg-white text-orange-500 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    PLUS POPULAIRE
                  </span>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-3xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-orange-500'}`}>
                  {plan.price}
                </p>
                <p className="text-sm mb-6 opacity-90">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-2">
                      <span>✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className={`block text-center py-3 rounded-lg font-semibold transition ${plan.popular ? 'bg-white text-orange-500 hover:bg-slate-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Prêt à transformer votre présence LinkedIn ?
          </h2>
          <p className="text-xl text-slate-300">
            Rejoignez les freelances et entrepreneurs qui utilisent LinkedInForge pour générer des leads qualifiés.
          </p>
          <Link href="/onboarding" className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
            Commencer gratuitement
          </Link>
          <p className="text-slate-500 text-sm">
            Aucune carte de crédit requise • Accès immédiat
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-lg">in</span> LinkedInForge
              </h4>
              <p className="text-slate-500 text-sm">Posts LinkedIn qui convertissent.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-slate-500"><li><a href="#" className="hover:text-white">Fonctionnalités</a></li><li><a href="#" className="hover:text-white">Tarifs</a></li></ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-slate-500"><li><a href="#" className="hover:text-white">Confidentialité</a></li><li><a href="#" className="hover:text-white">CGU</a></li></ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Socials</h4>
              <ul className="space-y-2 text-sm text-slate-500"><li><a href="#" className="hover:text-white">Twitter</a></li><li><a href="#" className="hover:text-white">LinkedIn</a></li></ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© 2026 LinkedInForge. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
