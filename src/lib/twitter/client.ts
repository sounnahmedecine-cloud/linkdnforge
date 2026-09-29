import { NextRequest } from 'next/server';
import crypto from 'crypto';

export interface TwitterUserProfile {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

export interface TwitterTokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
  userProfile: TwitterUserProfile;
}

export function getPublicOrigin(request?: NextRequest): string {
  if (request) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host');
    if (host && !host.includes('0.0.0.0')) {
      const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  }

  if (process.env.TWITTER_REDIRECT_URI) {
    try {
      const parsed = new URL(process.env.TWITTER_REDIRECT_URI);
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

export function getTwitterRedirectUri(origin?: string): string {
  if (origin && !origin.includes('0.0.0.0') && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return `${origin.replace(/\/$/, '')}/api/auth/twitter/callback`;
  }
  if (process.env.TWITTER_REDIRECT_URI) {
    return process.env.TWITTER_REDIRECT_URI;
  }
  if (origin && !origin.includes('0.0.0.0')) {
    return `${origin.replace(/\/$/, '')}/api/auth/twitter/callback`;
  }
  const base = process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('0.0.0.0')
    ? process.env.NEXTAUTH_URL
    : 'https://linkedinforge.fr';
  return `${base.replace(/\/$/, '')}/api/auth/twitter/callback`;
}

/**
 * Generate PKCE code_verifier and code_challenge (S256)
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge };
}

export function getTwitterAuthUrl(state: string, codeChallenge: string, origin?: string): string {
  const clientId = process.env.TWITTER_CLIENT_ID || process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
  if (!clientId) {
    throw new Error('TWITTER_CLIENT_ID is not configured');
  }

  const redirectUri = getTwitterRedirectUri(origin);
  // Requested scopes: tweet.read, tweet.write, users.read, offline.access
  const scope = encodeURIComponent('tweet.read tweet.write users.read offline.access');

  return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${encodeURIComponent(
    state
  )}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;
}

export async function exchangeTwitterCode(
  code: string,
  codeVerifier: string,
  origin?: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
  const clientId = process.env.TWITTER_CLIENT_ID || process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = getTwitterRedirectUri(origin);

  if (!clientId) {
    throw new Error('TWITTER_CLIENT_ID is missing');
  }

  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // If Twitter app has confidential client secret configured
  if (clientSecret) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers,
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || data.detail || 'Échec de la récupération du jeton X (Twitter)');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 7200, // standard 2h
  };
}

export async function getTwitterUserProfile(accessToken: string): Promise<TwitterUserProfile> {
  const res = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Impossible de récupérer le profil X (Twitter) : ${errorText}`);
  }

  const json = await res.json();
  const user = json.data;

  if (!user || !user.id) {
    throw new Error('Données utilisateur X (Twitter) invalides');
  }

  return {
    id: user.id,
    name: user.name || user.username || 'Utilisateur X',
    username: user.username || '',
    profile_image_url: user.profile_image_url,
  };
}

/**
 * Publishes a tweet to X (Twitter) using Twitter API v2.
 */
export async function publishTweet(
  accessToken: string,
  text: string,
  targetUrl?: string
): Promise<{ id: string; url: string; text: string }> {
  if (!accessToken) {
    throw new Error('Jeton d’accès X (Twitter) manquant');
  }

  // Format message, append targetUrl if not in text
  let messageText = text.trim();
  if (targetUrl && !messageText.includes(targetUrl)) {
    messageText = `${messageText}\n\n${targetUrl}`;
  }

  const payload = {
    text: messageText,
  };

  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok || !json.data?.id) {
    const errMsg = json.detail || json.title || json.errors?.[0]?.message || 'Erreur lors de la publication sur X (Twitter)';
    throw new Error(errMsg);
  }

  const tweetId = json.data.id;
  const tweetUrl = `https://twitter.com/i/web/status/${tweetId}`;

  return {
    id: tweetId,
    url: tweetUrl,
    text: json.data.text || messageText,
  };
}
