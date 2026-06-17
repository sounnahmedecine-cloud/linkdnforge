'use client';

import { ArrowRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import Logo, { AnvilMark } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionLabel from '@/components/ui/SectionLabel';
import Divider from '@/components/ui/Divider';
import StampNumber from '@/components/ui/StampNumber';

const guideSteps = [
  {
    title: 'Renseignez votre profil',
    body: "Collez l'URL de votre profil LinkedIn — LinkedInForge en extrait l'essentiel pour personnaliser chaque post à votre image. Ajoutez 2 ou 3 anciens posts et l'IA reproduit votre rythme, votre vocabulaire, votre voix.",
  },
  {
    title: 'Définissez votre stratégie',
    body: 'Choisissez vos thématiques, votre ton (Expert, Storytelling, Pédagogique, Humour ou Inspirant) et votre fréquence de publication. Le contenu s\'adapte à votre positionnement réel, pas à un template générique.',
  },
  {
    title: 'Choisissez le type de post',
    body: 'Story personnelle, conseils actionnables, carrousel ou mode Ghostwriter (Hook + 3 insights contre-intuitifs + CTA). Précisez votre objectif et le sujet, si vous en avez un en tête.',
  },
  {
    title: 'Générez et publiez',
    body: 'En un clic, LinkedInForge forge votre post. Copiez-le, publiez-le sur LinkedIn ou Facebook, et téléchargez le visuel généré par IA qui l\'accompagne. Zéro friction, résultat professionnel.',
  },
];

const plans = [
  {
    name: 'Gratuit',
    price: '0€',
    desc: 'Pour tester',
    features: ['5 posts / mois', 'Génération simple', '1 style de ton'],
  },
  {
    name: 'Pro',
    price: '19€',
    desc: '/ mois',
    features: ['Posts illimités', '3 variantes par post', 'Visuels illimités', 'Mode Ghostwriter'],
    popular: true,
  },
  {
    name: 'Agence',
    price: '49€',
    desc: '/ mois',
    features: ['Tout Pro, plus :', 'Multi-comptes LinkedIn', 'Support dédié'],
  },
];

export default function Home() {
  return (
    <div className="w-full bg-iron-950 text-smoke-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-iron-950/90 backdrop-blur-md border-b border-iron-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-smoke-500 hover:text-smoke-100 transition font-medium">
              Tarifs
            </Link>
            <Button href="/login" size="md">
              Commencer
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: pitch */}
          <div className="space-y-8 animate-rise">
            <SectionLabel>Génération IA · Posts LinkedIn</SectionLabel>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[4.2rem] leading-[1.05] tracking-tight">
              Des posts LinkedIn{' '}
              <span className="text-ember-500">forgés</span>, pas écrits.
            </h1>
            <p className="text-lg text-smoke-300 max-w-xl leading-relaxed">
              LinkedInForge transforme une idée brute en post à haute autorité, prêt à publier.
              Pensé pour les freelances, entrepreneurs et e-commerçants francophones qui n&apos;ont
              pas une heure à perdre devant une page blanche.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/login" size="lg">
                Forger mon post <ArrowRight className="w-5 h-5" />
              </Button>
              <Button href="#comment-ca-marche" variant="outline" size="lg">
                <PlayCircle className="w-5 h-5" /> Voir la démo
              </Button>
            </div>
          </div>

          {/* Right: the forge — raw note becomes a finished post */}
          <div className="relative">
            <div className="rounded-xl border border-dashed border-iron-700 bg-iron-900/40 p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-smoke-500 mb-3">
                Brouillon — 23h41
              </p>
              <p className="text-smoke-500 leading-relaxed text-[15px]">
                jai lancé un truc hier, bcp de taff dessus, faut que jen parle mais
                jsp comment le dire sans que ça sonne creux...
              </p>
            </div>

            <div className="flex items-center gap-3 my-3 pl-5">
              <div className="w-px h-8 bg-gradient-to-b from-iron-700 to-ember-500/60" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-ember-400">
                Forgé en 6s
              </span>
            </div>

            <div className="rounded-xl border border-ember-500/40 bg-iron-900 shadow-[0_0_40px_-12px_rgba(255,90,31,0.35)] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-iron-800 flex items-center justify-center">
                  <AnvilMark className="w-5 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-smoke-100 text-sm">Vous</p>
                  <p className="text-xs text-smoke-500">À l&apos;instant · 🌐</p>
                </div>
              </div>
              <p className="text-smoke-100 text-[15px] leading-relaxed">
                Hier, j&apos;ai lancé un produit sur lequel je travaille depuis 3 mois.
                <br />
                <br />
                Voici les 3 choses que j&apos;aurais aimé savoir avant de commencer 👇
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-iron-800 text-xs text-smoke-500">
                <span>👍 482</span>
                <span>💬 37 commentaires</span>
                <span>↗️ Partager</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro band */}
      <section className="py-16 bg-iron-900/40 border-y border-iron-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xl sm:text-2xl font-display font-bold leading-snug">
            Alimentez votre calendrier de contenu en quelques secondes.
          </p>
          <p className="text-smoke-500 leading-relaxed">
            Renseignez votre profil, choisissez votre style, obtenez un post prêt à publier — et
            le visuel qui va avec. Sans passer vos soirées devant une page blanche.
          </p>
        </div>
      </section>

      {/* Guide */}
      <section id="comment-ca-marche" className="py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="space-y-5">
            <SectionLabel>Pourquoi LinkedInForge</SectionLabel>
            <h2 className="font-display font-bold text-4xl sm:text-5xl leading-tight">
              Négliger LinkedIn, c&apos;est laisser des prospects sur la table
            </h2>
            <p className="text-smoke-300 leading-relaxed">
              Les entrepreneurs et freelances le savent : produire du contenu régulier, percutant
              et authentique reste l&apos;une des tâches les plus redoutées du métier.
              LinkedInForge change la donne — alimentez votre calendrier éditorial, promouvez un
              lancement, ou positionnez-vous comme la référence de votre secteur.
            </p>
          </div>

          <Divider />

          <div className="space-y-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl">Comment ça marche</h2>
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
            <SectionLabel>La règle d&apos;or</SectionLabel>
            <h2 className="font-display font-bold text-3xl sm:text-4xl">
              Conçu pour sonner humain, pas pour sonner IA
            </h2>
            <p className="text-smoke-300 leading-relaxed">
              Pas de formules bateau, pas de tournures détectables, pas de « j&apos;ai réalisé
              que ». LinkedInForge est calibré pour les entrepreneurs tech et freelances
              francophones — pas pour le marché généraliste. Chaque post est pensé pour vous
              faire gagner du temps tout en générant de vrais résultats.
            </p>
            <div className="pt-2">
              <Button href="/onboarding" size="lg">
                Essayer gratuitement
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-28 bg-iron-900/30 border-y border-iron-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <SectionLabel className="justify-center">Tarifs</SectionLabel>
            <h2 className="font-display font-bold text-4xl sm:text-5xl">
              Simples et transparents
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
                    Plus populaire
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
                  Commencer
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
            Prêt à forger votre prochain post ?
          </h2>
          <p className="text-lg text-smoke-300">
            Rejoignez les freelances et entrepreneurs qui utilisent LinkedInForge pour générer des
            leads qualifiés.
          </p>
          <Button href="/onboarding" size="lg">
            Commencer gratuitement
          </Button>
          <p className="text-smoke-500 text-sm">Aucune carte bancaire requise · Accès immédiat</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-iron-950 border-t border-iron-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo showBeta={false} className="mb-4" />
              <p className="text-smoke-500 text-sm">Posts LinkedIn qui convertissent.</p>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-smoke-500 mb-4">
                Produit
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#comment-ca-marche" className="text-smoke-500 hover:text-smoke-100 transition">Fonctionnalités</a></li>
                <li><Link href="/pricing" className="text-smoke-500 hover:text-smoke-100 transition">Tarifs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-smoke-500 mb-4">
                Légal
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-smoke-500 hover:text-smoke-100 transition">Confidentialité</a></li>
                <li><a href="#" className="text-smoke-500 hover:text-smoke-100 transition">CGU</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-smoke-500 mb-4">
                Socials
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-smoke-500 hover:text-smoke-100 transition">Twitter</a></li>
                <li><a href="#" className="text-smoke-500 hover:text-smoke-100 transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-iron-800 pt-8 text-center text-sm text-smoke-500/70">
            <p>© 2026 LinkedInForge. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
