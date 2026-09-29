import { NextRequest } from 'next/server';

export interface FacebookPageInfo {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export interface FacebookUserProfile {
  id: string;
  name: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

export interface FacebookTokenData {
  userAccessToken: string;
  pageAccessToken: string;
  pageId: string;
  pageName: string;
  userProfile: FacebookUserProfile;
  pages: FacebookPageInfo[];
  expiresAt?: number;
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

  if (process.env.FACEBOOK_REDIRECT_URI) {
    try {
      const parsed = new URL(process.env.FACEBOOK_REDIRECT_URI);
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

export function getFacebookRedirectUri(origin?: string): string {
  if (origin && !origin.includes('0.0.0.0')) {
    return `${origin.replace(/\/$/, '')}/api/auth/facebook/callback`;
  }
  if (process.env.FACEBOOK_REDIRECT_URI) {
    return process.env.FACEBOOK_REDIRECT_URI;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/auth/facebook/callback`;
  }
  const base = process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('0.0.0.0')
    ? process.env.NEXTAUTH_URL
    : 'https://linkedinforge.fr';
  return `${base.replace(/\/$/, '')}/api/auth/facebook/callback`;
}

export function getFacebookAuthUrl(state: string, origin?: string): string {
  const appId = process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1824637551887356';

  const redirectUri = getFacebookRedirectUri(origin);
  const scope = encodeURIComponent('pages_show_list,pages_read_engagement,pages_manage_posts,public_profile');

  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
    appId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${scope}&response_type=code`;
}

export async function exchangeFacebookCode(code: string, origin?: string): Promise<{ accessToken: string; expiresIn: number }> {
  const appId = process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = getFacebookRedirectUri(origin);

  if (!appId || !appSecret) {
    throw new Error('FACEBOOK_APP_ID or FACEBOOK_APP_SECRET is missing');
  }

  const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', appId);
  tokenUrl.searchParams.set('client_secret', appSecret);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  const res = await fetch(tokenUrl.toString(), { method: 'GET' });
  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message || data.error_description || 'Échec de la récupération du jeton Facebook');
  }

  // Optionally exchange short-lived token for long-lived (60 days) token
  try {
    const longLivedUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longLivedUrl.searchParams.set('client_id', appId);
    longLivedUrl.searchParams.set('client_secret', appSecret);
    longLivedUrl.searchParams.set('fb_exchange_token', data.access_token);

    const longLivedRes = await fetch(longLivedUrl.toString(), { method: 'GET' });
    const longLivedData = await longLivedRes.json();
    if (longLivedRes.ok && longLivedData.access_token) {
      return {
        accessToken: longLivedData.access_token,
        expiresIn: longLivedData.expires_in || 5184000, // 60 days
      };
    }
  } catch (err) {
    console.warn('Long lived Facebook token exchange warning:', err);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000,
  };
}

export async function getFacebookUserAndPages(userAccessToken: string): Promise<{
  userProfile: FacebookUserProfile;
  pages: FacebookPageInfo[];
}> {
  // 1. Fetch user profile
  const userRes = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=id,name,picture.width(150).height(150)&access_token=${encodeURIComponent(
      userAccessToken
    )}`
  );
  const userData = await userRes.json();
  if (!userRes.ok || !userData.id) {
    throw new Error(userData.error?.message || 'Impossible de récupérer le profil utilisateur Facebook');
  }

  // 2. Fetch user's managed Facebook Pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,category,picture.width(150).height(150)&access_token=${encodeURIComponent(
      userAccessToken
    )}`
  );
  const pagesData = await pagesRes.json();
  if (!pagesRes.ok) {
    throw new Error(pagesData.error?.message || 'Impossible de récupérer vos Pages Facebook');
  }

  const pages: FacebookPageInfo[] = Array.isArray(pagesData.data) ? pagesData.data : [];

  return {
    userProfile: {
      id: userData.id,
      name: userData.name,
      picture: userData.picture,
    },
    pages,
  };
}

export async function publishToFacebookPage(
  pageAccessToken: string,
  pageId: string,
  text: string,
  targetUrl?: string,
  mediaUrl?: string
): Promise<{ id: string; url: string }> {
  if (!pageAccessToken || !pageId) {
    throw new Error('Identifiants de la Page Facebook manquants (pageAccessToken / pageId)');
  }

  // If mediaUrl is provided, post photo with caption
  if (mediaUrl) {
    const photoUrl = new URL(`https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}/photos`);
    const params = new URLSearchParams({
      url: mediaUrl,
      caption: text,
      access_token: pageAccessToken,
    });

    const res = await fetch(photoUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok || !data.id) {
      throw new Error(data.error?.message || 'Erreur lors de la publication de la photo sur Facebook');
    }

    const postId = data.post_id || data.id;
    return {
      id: postId,
      url: `https://www.facebook.com/${postId.replace(/^[0-9]+_/, '')}`,
    };
  }

  // Standard text or link feed post
  const feedUrl = new URL(`https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}/feed`);
  const bodyParams: Record<string, string> = {
    message: text,
    access_token: pageAccessToken,
  };

  if (targetUrl) {
    bodyParams.link = targetUrl;
  }

  const params = new URLSearchParams(bodyParams);
  const res = await fetch(feedUrl.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data.error?.message || 'Erreur lors de la publication sur la Page Facebook');
  }

  const postId = data.id;
  const postViewUrl = `https://www.facebook.com/${postId.replace(/^[0-9]+_/, '')}`;

  return {
    id: postId,
    url: postViewUrl,
  };
}
