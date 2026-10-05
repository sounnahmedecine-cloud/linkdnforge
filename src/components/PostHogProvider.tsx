'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { isInternalTraffic } from '@/lib/firebase';

const DEFAULT_POSTHOG_TOKEN = 'phc_tCtVFr38mF6zoRaDVaiQgGWWe6GhzoPbctxKdbNWDgbr';
const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';

function getPostHogToken() {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    DEFAULT_POSTHOG_TOKEN
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Avant l'init, le pageview initial est envoyé par le callback `loaded` :
    // le capturer aussi ici le comptait en double.
    if (pathname && typeof window !== 'undefined' && posthog.__loaded) {
      let url = window.origin + pathname;
      const searchString = searchParams?.toString();
      if (searchString) {
        url = `${url}?${searchString}`;
      }

      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogKey = getPostHogToken();
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_POSTHOG_HOST;

    if (posthogKey && typeof window !== 'undefined' && !posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: false, // Captured manually via PostHogPageView for accurate SPA tracking
        capture_pageleave: true,
        loaded: (ph) => {
          if (isInternalTraffic()) {
            ph.opt_out_capturing();
            return;
          }
          if (ph.has_opted_out_capturing()) ph.opt_in_capturing();
          ph.capture('$pageview');
        },
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
