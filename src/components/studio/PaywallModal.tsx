'use client';

import { useState } from 'react';
import { X, Check, Sparkles, Crown, Zap, ShieldCheck } from 'lucide-react';
import { trackBeginCheckout } from '@/lib/analytics';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function PaywallModal({ isOpen, onClose, userEmail }: PaywallModalProps) {
  const [isYearly, setIsYearly] = useState(true);

  if (!isOpen) return null;

  const starterPrice = isYearly ? '12€' : '19€';
  const proPrice = isYearly ? '16€' : '29€';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 max-h-[92vh] overflow-y-auto space-y-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Vos 5 générations gratuites ont été atteintes
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
            Passez à la vitesse supérieure avec l'offre Pro
          </h2>

          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Ne laissez plus votre visibilité LinkedIn au hasard. Débloquez les générations illimitées, le pilote vidéo multimodal et la capture automatique.
          </p>

          {/* Billing Switch */}
          <div className="flex justify-center items-center gap-3 pt-3">
            <span className={`text-xs sm:text-sm font-bold transition ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
              Mensuel
            </span>
            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-orange-500 transition-colors focus:outline-none shadow-inner"
              aria-label="Changer de facturation"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                  isYearly ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-xs sm:text-sm font-bold transition flex items-center gap-2 ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
              Annuel
              <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                PROMO -45%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-slate-300 transition">
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">Starter</h3>
                <p className="text-xs text-slate-500 mt-1">Pour les créateurs et solopreneurs réguliers.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-4xl text-slate-950">{starterPrice}</span>
                <span className="text-xs text-slate-500 font-medium">/ mois</span>
                {isYearly && <span className="text-[11px] text-slate-400 ml-1">(140€ facturés / an)</span>}
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  <span><strong>30 posts LinkedIn</strong> par mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Analyse d'URLs & Scraping produit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Style Ghostwriter & tons personnalisés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Historique des posts & brouillons</span>
                </li>
              </ul>
            </div>

            <a
              href={`/api/stripe/checkout?plan=starter&billing=${isYearly ? 'yearly' : 'monthly'}${userEmail ? `&email=${encodeURIComponent(userEmail)}` : ''}`}
              onClick={() => {
                trackBeginCheckout({
                  planId: 'starter',
                  billing: isYearly ? 'yearly' : 'monthly',
                  value: isYearly ? 140 : 19,
                });
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-black text-white text-center transition shadow-sm hover:shadow"
            >
              Choisir Starter
            </a>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="relative bg-gradient-to-b from-orange-50/70 to-white border-2 border-orange-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl shadow-orange-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              Recommandé • Offre Complète
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-xl text-slate-950">Pro Studio</h3>
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xs text-slate-500 mt-1">L'atelier omnicanal complet sans limites.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display font-black text-4xl text-orange-600">{proPrice}</span>
                <span className="text-xs text-slate-500 font-medium">/ mois</span>
                {isYearly && <span className="text-[11px] text-slate-400 ml-1">(190€ facturés / an)</span>}
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 font-bold shrink-0" />
                  <span><strong>Posts illimités</strong> chaque mois</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 font-bold shrink-0" />
                  <span><strong>Autopilot Vidéo Multimodal</strong> (IA voix & vidéo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 font-bold shrink-0" />
                  <span><strong>Capture Hero HD automatique</strong> du produit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 font-bold shrink-0" />
                  <span>Scripts <strong>TikTok & Instagram Reels</strong> inclus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600 font-bold shrink-0" />
                  <span>Connexion <strong>Buffer & publication LinkedIn</strong></span>
                </li>
              </ul>
            </div>

            <a
              href={`/api/stripe/checkout?plan=pro&billing=${isYearly ? 'yearly' : 'monthly'}${userEmail ? `&email=${encodeURIComponent(userEmail)}` : ''}`}
              onClick={() => {
                trackBeginCheckout({
                  planId: 'pro',
                  billing: isYearly ? 'yearly' : 'monthly',
                  value: isYearly ? 190 : 29,
                });
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white text-center transition shadow-lg shadow-orange-500/25 hover:scale-[1.01]"
            >
              Essai Pro 7 jours gratuit →
            </a>
          </div>
        </div>

        {/* Reassurance Footer */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Paiement 100% sécurisé via Stripe
          </span>
          <span>•</span>
          <span>Sans engagement, résiliable en 1 clic</span>
          <span>•</span>
          <span>Facture avec TVA automatique</span>
        </div>
      </div>
    </div>
  );
}
