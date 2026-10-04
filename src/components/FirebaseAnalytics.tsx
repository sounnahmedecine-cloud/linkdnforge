'use client';

import { useEffect, useRef } from 'react';
import { getAnalyticsSafe } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * Filtre anti-bot pour Firebase Analytics :
 * Ne déclenche les événements que pour les VRAIS humains.
 * Élimine les bots US / datacenters, crawlers headless, Puppeteer et requêtes automatisées.
 */
export function FirebaseAnalytics() {
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    hasLoggedRef.current = false;

    // 1. Détection immédiate des bots headless ou scrapers
    const isHeadless = Boolean(
      (navigator as any).webdriver ||
      (window as any)._phantom ||
      (window as any).__nightmare ||
      (window as any).callPhantom
    );

    const userAgent = navigator.userAgent || '';
    const isBotUserAgent = /bot|crawler|spider|headless|puppeteer|selenium|slurp|bingbot|googlebot|yandex|semrush|ahrefs|facebookexternalhit|curl|wget|python|bytespider|mj12bot|dotbot|petalbot|censys|shodan/i.test(userAgent);

    // Résolution d'écran anormale typique des conteneurs headless sans écran
    const isZeroScreen = window.outerWidth === 0 && window.outerHeight === 0;

    if (isHeadless || isBotUserAgent || isZeroScreen) {
      // Ignorer totalement les bots : ils ne pollueront pas Firebase
      return;
    }

    const currentPath = window.location.pathname;

    // 2. Déclencheur sur véritable interaction humaine
    const logHumanVisit = async () => {
      if (hasLoggedRef.current) return;
      hasLoggedRef.current = true;

      // Nettoyer les écouteurs dès la première interaction
      cleanupListeners();

      try {
        const an = await getAnalyticsSafe();
        if (!an) return;

        // Analytics n'est initialisé qu'ici (plus d'init anticipée dans lib/firebase) :
        // getAnalytics() envoie alors lui-même le page_view de la page courante,
        // puis ceux des navigations côté client. Pas de page_view manuel.
        logEvent(an, 'human_verified_session', {
          page_path: currentPath,
          user_agent: userAgent.slice(0, 100),
          screen_res: `${window.innerWidth}x${window.innerHeight}`,
        });
      } catch (err) {
        // Ignorer les erreurs d'adblocker
      }
    };

    // Événements physiques réservés aux humains
    const humanEvents = ['scroll', 'mousemove', 'click', 'touchstart', 'keydown'];

    const attachListeners = () => {
      humanEvents.forEach((evt) => {
        window.addEventListener(evt, logHumanVisit, { passive: true, once: true });
      });
    };

    const cleanupListeners = () => {
      humanEvents.forEach((evt) => {
        window.removeEventListener(evt, logHumanVisit);
      });
    };

    attachListeners();

    // Dwell-time fallback : si un humain lit pendant 4 secondes sans toucher la souris, on valide s'il a le focus
    const timer = setTimeout(() => {
      if (!hasLoggedRef.current && document.visibilityState === 'visible' && document.hasFocus()) {
        logHumanVisit();
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      cleanupListeners();
    };
  }, []);

  return null;
}
