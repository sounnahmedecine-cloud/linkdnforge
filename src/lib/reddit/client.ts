import { NextRequest } from 'next/server';

export interface RedditUserProfile {
  id: string;
  name: string;
  icon_img?: string;
  total_karma?: number;
}

export interface RedditTokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
  userProfile: RedditUserProfile;
}

const REDDIT_USER_AGENT = 'web:linkedinforge:v1.0.0 (by /u/linkedinforge)';

export function getPublicOrigin(request?: NextRequest): string {
  if (request) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host');
    if (host && !host.includes('0.0.0.0')) {
      const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  }

  if (process.env.REDDIT_REDIRECT_URI) {
    try {
      const parsed = new URL(process.env.REDDIT_REDIRECT_URI);
      return parsed.origin;
    } catch {}
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('0.0.0.0')) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }

  if (request) {
    const raw = request.nextUrl.origin;
    if (raw && !raw.includes('0.0.0.0')) {
      return raw;
    }
  }

  return 'https://linkedinforge.fr';
}

export function getRedditRedirectUri(origin?: string): string {
  if (origin && !origin.includes('0.0.0.0') && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return `${origin.replace(/\/$/, '')}/api/auth/reddit/callback`;
  }
  if (process.env.REDDIT_REDIRECT_URI) {
    return process.env.REDDIT_REDIRECT_URI;
  }
  if (origin && !origin.includes('0.0.0.0')) {
    return `${origin.replace(/\/$/, '')}/api/auth/reddit/callback`;
  }
  const base = process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('0.0.0.0')
    ? process.env.NEXTAUTH_URL
    : 'https://linkedinforge.fr';
  return `${base.replace(/\/$/, '')}/api/auth/reddit/callback`;
}

export function getRedditAuthUrl(state: string, origin?: string): string {
  const clientId = process.env.REDDIT_CLIENT_ID || process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
  if (!clientId) {
    throw new Error('REDDIT_CLIENT_ID is not configured');
  }

  const redirectUri = getRedditRedirectUri(origin);
  // Requested scopes: identity (profile), submit (post to subreddit), mysubreddits (fetch communities)
  const scope = encodeURIComponent('identity submit mysubreddits');

  return `https://www.reddit.com/api/v1/authorize?client_id=${encodeURIComponent(
    clientId
  )}&response_type=code&state=${encodeURIComponent(
    state
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&duration=permanent&scope=${scope}`;
}

export async function exchangeRedditCode(
  code: string,
  origin?: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
  const clientId = process.env.REDDIT_CLIENT_ID || process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const redirectUri = getRedditRedirectUri(origin);

  if (!clientId || !clientSecret) {
    throw new Error('REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET is missing');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': REDDIT_USER_AGENT,
    },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || data.message || 'Échec de la récupération du jeton Reddit');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 3600,
  };
}

export async function getRedditUserProfile(accessToken: string): Promise<RedditUserProfile> {
  const res = await fetch('https://oauth.reddit.com/api/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': REDDIT_USER_AGENT,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Impossible de récupérer le profil Reddit : ${errorText}`);
  }

  const user = await res.json();

  if (!user || !user.name) {
    throw new Error('Données utilisateur Reddit invalides');
  }

  return {
    id: user.id || user.name,
    name: user.name,
    icon_img: user.icon_img?.split('?')?.[0],
    total_karma: user.total_karma,
  };
}

/**
 * Publishes a post to Reddit in a given subreddit (or user's own profile).
 */
export async function publishToReddit(
  accessToken: string,
  subreddit: string,
  text: string,
  title?: string,
  targetUrl?: string
): Promise<{ id: string; url: string; subreddit: string }> {
  if (!accessToken) {
    throw new Error('Jeton d’accès Reddit manquant');
  }

  // Clean subreddit name (remove r/, u/, etc.)
  let cleanSub = (subreddit || '').trim().replace(/^r\//, '').replace(/^\/r\//, '');
  if (!cleanSub) {
    // If no subreddit provided, try posting to user profile or default
    cleanSub = 'u_' + (await getRedditUserProfile(accessToken)).name;
  }

  // Extract title if not provided (take the first line or headline, max 250 chars)
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  const derivedTitle = title?.trim() || lines[0]?.replace(/^[#* \-_]+/, '').slice(0, 250) || 'Nouvelle publication';

  // Format body text
  let bodyText = text.trim();
  if (targetUrl && !bodyText.includes(targetUrl)) {
    bodyText = `${bodyText}\n\n🔗 ${targetUrl}`;
  }

  const params = new URLSearchParams({
    api_type: 'json',
    kind: 'self',
    sr: cleanSub,
    title: derivedTitle,
    text: bodyText,
    resubmit: 'true',
    sendreplies: 'true',
  });

  const res = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': REDDIT_USER_AGENT,
    },
    body: params.toString(),
  });

  const json = await res.json();

  if (!res.ok || json.json?.errors?.length > 0) {
    const err = json.json?.errors?.[0];
    const errMsg = Array.isArray(err) ? `${err[0]}: ${err[1]}` : (json.message || 'Erreur lors de la publication sur Reddit');
    throw new Error(errMsg);
  }

  const postData = json.json?.data;
  const postUrl = postData?.url || `https://www.reddit.com/r/${cleanSub}/`;
  const postId = postData?.id || postData?.name || 'reddit-post';

  return {
    id: postId,
    url: postUrl,
    subreddit: cleanSub,
  };
}
