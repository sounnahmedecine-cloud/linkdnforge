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
          <Link href="/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm">
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
            <Link href="/login" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2 text-base">
              Créer mon premier post <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 border-2 border-slate-700 text-slate-200 hover:border-slate-600 hover:text-white rounded-lg transition font-semibold text-base">
              📹 Voir la démo
            </button>
          </div>
        </div>
      </section>

      {/* Intro Band */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <p className="text-xl sm:text-2xl font-semibold text-white leading-snug">
            Créez des publications LinkedIn percutantes en quelques secondes.
          </p>
          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            LinkedInForge vous aide à alimenter votre calendrier de contenu, à mettre en avant vos projets et à bâtir votre autorité sur LinkedIn — sans passer des heures devant une page blanche. Renseignez votre profil, choisissez votre style, et obtenez instantanément des posts prêts à publier.
          </p>
        </div>
      </section>

      {/* Guide Section */}
      <section className="py-32 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          {/* Intro */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
              Pourquoi utiliser{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                LinkedInForge ?
              </span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              Les entrepreneurs et freelances savent que négliger LinkedIn, c'est laisser des centaines de prospects sur la table chaque mois. Pourtant, produire du contenu régulier, percutant et authentique reste l'une des tâches les plus redoutées.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              LinkedInForge change la donne. Utilisez-le pour alimenter votre calendrier éditorial, promouvoir un lancement, partager une expertise, ou simplement vous positionner comme la référence de votre secteur. En clair : c'est l'outil qu'il vous faut pour devenir la voix qui compte sur LinkedIn.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          {/* How to use */}
          <div className="space-y-14">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Comment utiliser{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                LinkedInForge
              </span>
            </h2>

            {[
              {
                step: '01',
                title: 'Renseignez votre profil',
                body: 'Entrez l\'URL de votre profil LinkedIn — LinkedInForge extrait automatiquement vos informations pour personnaliser chaque post à votre image. Vous pouvez aussi coller 2 ou 3 de vos anciens posts : l\'IA apprend votre style, votre rythme, votre voix.'
              },
              {
                step: '02',
                title: 'Définissez votre stratégie',
                body: 'Sélectionnez vos thématiques d\'expertise, votre ton (Expert, Storytelling, Pédagogique, Humour ou Inspirant) et votre fréquence de publication. LinkedInForge adapte le contenu à votre positionnement, pas à un template générique.'
              },
              {
                step: '03',
                title: 'Choisissez le type de post',
                body: 'Story personnelle, conseils actionnables, carrousel ou mode Ghostwriter (Hook + 3 insights contre-intuitifs + CTA). Définissez votre objectif — générer des leads ou booster la visibilité — et précisez le sujet du post si vous en avez un en tête.'
              },
              {
                step: '04',
                title: 'Générez et publiez',
                body: 'En un clic, LinkedInForge forge votre post. Copiez-le, publiez-le directement sur LinkedIn ou Facebook, et téléchargez le visuel généré par IA pour accompagner votre contenu. Zéro friction, résultat professionnel.'
              }
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-8 items-start">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                  <span className="text-orange-400 font-bold text-sm">{step}</span>
                </div>
                <div className="space-y-3 pt-1">
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <p className="text-slate-400 leading-relaxed font-light">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          {/* How it works */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Comment fonctionne{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                l'IA derrière LinkedInForge ?
              </span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              LinkedInForge est propulsé par Gemini, le modèle d'IA avancé de Google, entraîné sur des milliards de contenus professionnels. Il ne génère pas du texte au hasard : il analyse votre profil, votre style, vos thématiques et votre objectif pour produire un post calibré pour l'engagement LinkedIn.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              Contrairement aux générateurs génériques, LinkedInForge applique des règles strictes : pas de formules bateau, pas de tournures IA détectables, pas de "j'ai réalisé que". Chaque post est conçu pour sonner humain, personnel et crédible — parce que c'est ce qui performe sur LinkedIn.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          {/* Best tool */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Le meilleur outil IA pour{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                rédiger vos posts LinkedIn
              </span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              LinkedInForge est conçu spécifiquement pour les entrepreneurs tech et freelances francophones — pas pour le marché généraliste. Chaque fonctionnalité (mode Ghostwriter, extraction de profil, génération de visuels) est pensée pour une seule chose : vous faire gagner du temps tout en publiant du contenu qui génère de vrais résultats.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed font-light">
              Que vous démarriez sur LinkedIn ou cherchiez à passer à la vitesse supérieure, LinkedInForge s'adapte à votre niveau et à votre rythme. Commencez gratuitement, sans carte bancaire.
            </p>
            <div className="pt-4">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition text-base"
              >
                Essayer LinkedInForge gratuitement
              </Link>
            </div>
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
