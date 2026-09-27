import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export function getPostHogServer(): PostHog {
  if (!posthogClient) {
    const token =
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
      process.env.NEXT_PUBLIC_POSTHOG_KEY ||
      'phc_tCtVFr38mF6zoRaDVaiQgGWWe6GhzoPbctxKdbNWDgbr';
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

    posthogClient = new PostHog(token, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}
