'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Sparkles, 
  Film, 
  Globe2, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Zap,
  Lock
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Header from '@/components/layout/Header';
import LandingLeadCapture from '@/components/landing/LandingLeadCapture';
import Logo from '@/components/ui/Logo';

interface FaqItem {
  q: string;
  a: string;
}

const FORGE_FAQS: FaqItem[] = [
  {
    q: "Comment LinkdnForge analyse-t-il une URL ou un produit ?",
    a: "Lorsque vous collez un lien (site web, e-commerce, article ou landing page), notre moteur extrait en direct les arguments clés, la proposition de valeur et capture l'image Hero en haute définition pour illustrer votre post sans effort."
  },
  {
    q: "Puis-je déposer une vidéo brute (TikTok, Reels, mp4) ?",
    a: "Absolument. Déposez votre fichier vidéo (jusqu'à 100 Mo) : LinkdnForge en extrait la voix, comprend les moments forts et génère un post LinkedIn structuré ainsi qu'un script court adapté."
  },
  {
    q: "Le contenu généré ressemble-t-il aux textes plats de ChatGPT ?",
    a: "Non. Contrairement aux IA généralistes qui utilisent des templates verbeux et des clichés robotiques (« À l'ère du digital... »), LinkdnForge applique des règles strictes de Ghostwriting : accroches courtes, rythme aéré, langage parlé naturel et appel à l'action authentique."
  },
  {
    q: "Combien de posts puis-je générer gratuitement ?",
    a: "Vous bénéficiez de 5 générations complètes offertes, sans aucune carte bancaire requise et sans engagement, pour tester la puissance de la forge sur vos propres contenus."
  },
  {
    q: "Mes publications et mes liens restent-ils privés ?",
    a: "Oui, totalement. Vos contenus ne sont jamais partagés publiquement et ne servent pas à entraîner des modèles tiers. Vous gardez 100% de la propriété intellectuelle de chaque post."
  }
];

export default function ForgePage() {
  const tNav = useTranslations('nav');
  const tLanding = useTranslations('landing');
  const tPricing = useTranslations('pricing');

  const plans = tLanding.raw('pricingTeaser.plans') as any[];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* 1. Header with active generator indication */}
      <Header
        variant="marketing"
        pricingLabel={tNav('pricing')}
        ctaLabel={tNav('cta')}
        ctaHref="#demo"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 w-full">
        {/* 2. Intro Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto animate-rise">
          <h1 className="font-display font-black text-4xl sm:text-6xl text-black tracking-tight leading-tight">
            Générateur de Posts LinkedIn
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal">
            Transformez vos liens, vos vidéos ou vos idées en publications captivantes, formatées pour l’algorithme LinkedIn et prêtes à poster.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs sm:text-sm text-slate-700 font-semibold shadow-xs">
              <span>🎁 5 générations offertes · Sans carte bancaire requise</span>
            </span>
          </div>
        </div>

        {/* 3. The Lead Capture Workspace */}
        <section id="demo" className="relative scroll-mt-24">
          <LandingLeadCapture />
        </section>

        {/* 4. Reassurance badges under workspace */}
        <section className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 py-6 border-y border-slate-200/80 text-slate-600 text-sm font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Formatage certifié LinkedIn</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-700" />
            <span>Contenu 100% privé & sécurisé</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Génération en moins de 10 secondes</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span>Copie directe en 1 clic</span>
          </div>
        </section>

        {/* 5. Dedicated FAQ Section on Generator Page (MoroAI inspired) */}
        <section className="max-w-3xl mx-auto space-y-8 pt-6">
          <div className="text-center space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-black">
              Questions fréquentes sur le générateur
            </h2>
            <p className="text-slate-500 text-sm">
              Tout ce que vous devez savoir pour forger des posts performants.
            </p>
          </div>

          <div className="space-y-3">
            {FORGE_FAQS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm transition hover:border-slate-300"
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
        </section>

        {/* 6. Upsell Teaser Card to Full Pricing */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-orange-500/20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="inline-block text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Passez à la vitesse supérieure
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
              Besoin de publications illimitées et de calendrier éditorial ?
            </h3>
            <p className="text-orange-100 text-sm leading-relaxed">
              Débloquez le studio complet avec le Pilote Vidéo sans limite, le multi-comptes et la planification automatique Buffer.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-extrabold rounded-2xl shadow-lg hover:bg-orange-50 transition transform hover:scale-105 text-base"
            >
              <span>Voir les offres & tarifs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <Logo showBeta={false} />
            <span>— Le Ghostwriter IA taillé pour LinkedIn</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/forge" className="hover:text-slate-900 transition">Générateur</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Tarifs</Link>
            <Link href="/login" className="hover:text-slate-900 transition">Connexion</Link>
          </div>
          <p className="text-xs text-slate-400">© 2026 LinkdnForge. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
