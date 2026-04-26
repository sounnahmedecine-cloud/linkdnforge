'use client';

import { Zap, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">in</span>
            <span className="text-lg font-semibold text-white">LinkedInForge</span>
            <span className="text-xs bg-orange-600/80 px-3 py-1 rounded-full font-medium">Beta</span>
          </div>
          <Link href="/onboarding" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm">
            Commencer
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-40">
        <div className="text-center space-y-10">
          <div className="inline-block">
            <span className="bg-orange-500/15 text-orange-300 px-4 py-2 rounded-full text-xs font-semibold border border-orange-500/40 uppercase tracking-wide">
              ✨ Générez des posts LinkedIn comme un pro
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            Posts LinkedIn<br />qui <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">génèrent des leads</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            LinkedInForge combine l'artisanat humain et la puissance de l'IA pour créer des posts LinkedIn à haute autorité.
            Parfait pour les freelances, entrepreneurs et e-commerçants.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/onboarding" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2 text-base">
              Créer mon premier post <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 border-2 border-slate-700 text-slate-200 hover:border-slate-600 hover:text-white rounded-lg transition font-semibold text-base">
              📹 Voir la démo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <p className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">+50%</p>
              <p className="text-slate-400 text-base font-light">Engagement moyen</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">2x</p>
              <p className="text-slate-400 text-base font-light">Temps gagné par post</p>
            </div>
            <div className="space-y-2">
              <p className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">100+</p>
              <p className="text-slate-400 text-base font-light">Posts créés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-20 leading-tight">
            Pourquoi choisir<br /><span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">LinkedInForge</span> ?
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
              <div key={idx} className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 hover:border-blue-600 transition space-y-4 group">
                <div className="text-orange-500 text-2xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-20">
            Tarifs <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">simples et transparents</span>
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
              <div key={idx} className={`rounded-xl p-8 transition border ${plan.popular ? 'bg-orange-500/10 border-orange-500 scale-105' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                {plan.popular && (
                  <span className="inline-block bg-orange-600/80 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wide">
                    Plus populaire
                  </span>
                )}
                <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                <p className={`text-4xl font-bold mb-2 ${plan.popular ? 'text-orange-400' : 'text-orange-500'}`}>
                  {plan.price}
                </p>
                <p className="text-sm text-slate-400 mb-8 font-light">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-orange-500 font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className={`block text-center py-3 rounded-lg font-semibold transition text-sm ${plan.popular ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <h2 className="text-5xl sm:text-6xl font-bold leading-tight">
            Prêt à transformer<br />votre présence LinkedIn ?
          </h2>
          <p className="text-xl text-slate-300 font-light">
            Rejoignez les freelances et entrepreneurs qui utilisent LinkedInForge pour générer des leads qualifiés.
          </p>
          <Link href="/onboarding" className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-base">
            Commencer gratuitement
          </Link>
          <p className="text-slate-500 text-sm font-light">
            Aucune carte de crédit requise • Accès immédiat
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-slate-300">
                <span className="text-lg bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">in</span> LinkedInForge
              </h4>
              <p className="text-slate-500 text-sm font-light">Posts LinkedIn qui convertissent.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-300">Produit</h4>
              <ul className="space-y-2 text-sm"><li><a href="#" className="text-slate-500 hover:text-white transition font-light">Fonctionnalités</a></li><li><a href="#" className="text-slate-500 hover:text-white transition font-light">Tarifs</a></li></ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-300">Légal</h4>
              <ul className="space-y-2 text-sm"><li><a href="#" className="text-slate-500 hover:text-white transition font-light">Confidentialité</a></li><li><a href="#" className="text-slate-500 hover:text-white transition font-light">CGU</a></li></ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-300">Socials</h4>
              <ul className="space-y-2 text-sm"><li><a href="#" className="text-slate-500 hover:text-white transition font-light">Twitter</a></li><li><a href="#" className="text-slate-500 hover:text-white transition font-light">LinkedIn</a></li></ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-600 font-light">
            <p>© 2026 LinkedInForge. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
