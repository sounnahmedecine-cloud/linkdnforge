'use client';

import { getAnalyticsSafe } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';
import posthog from 'posthog-js';

// Anti-bot check to prevent bot traffic from skewing analytics & conversions
function isLikelyBot(): boolean {
  if (typeof window === 'undefined') return true;
  if ((navigator as any).webdriver || (window as any)._phantom || (window as any).__nightmare) {
    return true;
  }
  const ua = navigator.userAgent || '';
  if (/bot|crawler|spider|headless|puppeteer|selenium|slurp|googlebot|bingbot|bytespider/i.test(ua)) {
    return true;
  }
  return false;
}

/**
 * Envoie un événement de tracking unifié :
 * 1. Firebase Analytics (GA4)
 * 2. PostHog
 * 3. Meta / Facebook Pixel
 */
export async function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined' || isLikelyBot()) return;

  // 1. Firebase Analytics (GA4)
  try {
    const an = await getAnalyticsSafe();
    if (an) {
      logEvent(an, eventName, params);
    }
  } catch (e) {
    // Ignore adblocker / network issues
  }

  // 2. PostHog
  try {
    if (posthog && typeof posthog.capture === 'function') {
      posthog.capture(eventName, params);
    }
  } catch (e) {
    // Ignore PostHog silent errors
  }

  // 3. Meta (Facebook Pixel)
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      // Map standard GA4 events to Facebook standard events when applicable
      if (eventName === 'begin_checkout') {
        fbq('track', 'InitiateCheckout', {
          content_name: params.plan_id || 'Subscription',
          currency: params.currency || 'EUR',
          value: params.value || 0,
        });
      } else if (eventName === 'purchase') {
        fbq('track', 'Purchase', {
          currency: params.currency || 'EUR',
          value: params.value || 0,
          content_name: params.plan_id || 'Subscription',
        });
      } else if (eventName === 'sign_up') {
        fbq('track', 'CompleteRegistration', {
          status: 'success',
        });
      } else if (eventName === 'generate_post_success') {
        fbq('trackCustom', 'GeneratePostSuccess', params);
      } else {
        fbq('trackCustom', eventName, params);
      }
    }
  } catch (e) {
    // Ignore Meta pixel errors
  }
}

// === Événements Spécifiques Fortement Typés (Cycle de vie & Activation) ===

/** Visite de l'Atelier / Studio */
export function trackStudioView(currentTab: string = 'hub', postCount: number = 0) {
  trackEvent('studio_view', {
    current_tab: currentTab,
    post_count: postCount,
    is_new_user: postCount === 0,
  });
}

/** Clic sur un bouton d'action clé (CTA) */
export function trackCtaClick(ctaName: string, location: string, targetUrl?: string) {
  trackEvent('cta_click', {
    cta_name: ctaName,
    location,
    target_url: targetUrl || '',
  });
}

/** Début de génération d'un post (démo ou studio) */
export function trackGeneratePostStart(params: {
  inputType: 'topic' | 'url' | 'video' | 'idea';
  editorialStyle?: string;
  hasVideo?: boolean;
  hasUrl?: boolean;
}) {
  trackEvent('generation_started', {
    source_type: params.inputType,
    editorial_style: params.editorialStyle || 'auto',
    has_video: Boolean(params.hasVideo),
    has_url: Boolean(params.hasUrl),
  });
}

/** Succès de génération d'un post (conversion d'activation clé) */
export function trackGeneratePostSuccess(params: {
  inputType: 'topic' | 'url' | 'video' | 'idea';
  hasTiktok?: boolean;
  hasScreenshot?: boolean;
  postLength?: number;
  durationMs?: number;
}) {
  trackEvent('generation_completed', {
    source_type: params.inputType,
    has_tiktok: Boolean(params.hasTiktok),
    has_screenshot: Boolean(params.hasScreenshot),
    post_length: params.postLength || 0,
    duration_ms: params.durationMs || 0,
  });
}

/** Échec de génération */
export function trackGeneratePostError(params: {
  errorMessage: string;
  inputType?: string;
}) {
  trackEvent('generation_failed', {
    error_message: params.errorMessage.slice(0, 150),
    source_type: params.inputType || 'unknown',
  });
}

/** Copie du texte généré (action d'activation forte) */
export function trackPostCopied(network: string = 'linkedin', postLength: number = 0) {
  trackEvent('content_copied', {
    network,
    post_length: postLength,
  });
}

/** Publication directe sur un réseau social */
export function trackDirectPublish(network: 'linkedin' | 'facebook' | 'twitter' | 'reddit', isSuccess: boolean, postLength: number = 0) {
  trackEvent('direct_published', {
    network,
    status: isSuccess ? 'success' : 'failed',
    post_length: postLength,
  });
}

/** Configuration du profil Ghostwriter */
export function trackGhostwriterConfigured(params: {
  tone: string;
  hasLinkedin: boolean;
  hasExamples: boolean;
  editorialStyle: string;
}) {
  trackEvent('ghostwriter_configured', {
    tone: params.tone,
    has_linkedin: params.hasLinkedin,
    has_examples: params.hasExamples,
    editorial_style: params.editorialStyle,
  });
}

/** Connexion d'un compte réseau social */
export function trackSocialConnected(network: string) {
  trackEvent('social_connected', {
    network,
  });
}

/** Planification dans le calendrier */
export function trackCalendarScheduled(params: {
  date: string;
  network?: string;
}) {
  trackEvent('calendar_scheduled', {
    date: params.date,
    network: params.network || 'linkedin',
  });
}

/** Progression de la checklist d'activation */
export function trackOnboardingChecklistStep(stepName: string, stepNumber: number, progressPct: number) {
  trackEvent('onboarding_step_completed', {
    step_name: stepName,
    step_number: stepNumber,
    progress_percentage: progressPct,
  });
}

/** Changement d'onglet d'aperçu (LinkedIn <-> TikTok) */
export function trackNetworkTabSwitched(network: 'linkedin' | 'tiktok') {
  trackEvent('network_tab_switched', {
    network,
  });
}

/** Affichage du paywall (limite gratuite atteinte) */
export function trackPaywallViewed(trialCount: number) {
  trackEvent('paywall_viewed', {
    trial_count: trialCount,
  });
}

/** Consultation de la page des tarifs */
export function trackViewPricing(source: string = 'direct') {
  trackEvent('view_pricing', {
    source,
  });
}

/** Changement de modalité de facturation (mensuel vs annuel) */
export function trackBillingToggled(billing: 'monthly' | 'yearly') {
  trackEvent('billing_toggled', {
    billing,
  });
}

/** Clic sur un plan tarifaire pour démarrer l'abonnement / l'essai (Standard GA4) */
export function trackBeginCheckout(params: {
  planId: string;
  billing: 'monthly' | 'yearly';
  value: number;
  currency?: string;
}) {
  trackEvent('begin_checkout', {
    plan_id: params.planId,
    billing: params.billing,
    value: params.value,
    currency: params.currency || 'EUR',
    items: [
      {
        item_id: `${params.planId}_${params.billing}`,
        item_name: `LinkdnForge ${params.planId.toUpperCase()}`,
        price: params.value,
        quantity: 1,
      },
    ],
  });
}

/** Achat ou démarrage d'abonnement confirmé (Standard GA4) */
export function trackPurchase(params: {
  transactionId?: string;
  planId: string;
  billing?: string;
  value: number;
  currency?: string;
}) {
  trackEvent('purchase', {
    transaction_id: params.transactionId || `tx_${Date.now()}`,
    plan_id: params.planId,
    billing: params.billing || 'yearly',
    value: params.value,
    currency: params.currency || 'EUR',
    items: [
      {
        item_id: `${params.planId}_${params.billing || 'yearly'}`,
        item_name: `LinkdnForge ${params.planId.toUpperCase()}`,
        price: params.value,
        quantity: 1,
      },
    ],
  });
}

/** Inscription ou Connexion utilisateur (Standard GA4) */
export function trackAuth(method: 'email' | 'google' | 'linkedin', isSignUp: boolean) {
  trackEvent(isSignUp ? 'sign_up' : 'login', {
    method,
  });
}
