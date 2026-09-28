/**
 * LinkedIn OAuth 2.0 & Publishing Client
 * Handles authorization URL generation, token exchange, user profile fetching,
 * and direct UGC/Rest posting to LinkedIn.
 */

export interface LinkedInProfile {
  sub: string; // The user ID, used for author URN "urn:li:person:<sub_id>"
  name: string;
  email?: string;
  picture?: string;
}

export interface LinkedInTokenData {
  accessToken: string;
  expiresIn: number;
  expiresAt: number;
  profile: LinkedInProfile;
}

export function getLinkedInRedirectUri(origin?: string): string {
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return `${origin.replace(/\/$/, '')}/api/auth/linkedin/callback`;
  }
  if (process.env.LINKEDIN_REDIRECT_URI) {
    return process.env.LINKEDIN_REDIRECT_URI;
  }
  const base = origin || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/api/auth/linkedin/callback`;
}

export function getLinkedInAuthUrl(state: string, origin?: string): string {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    throw new Error('LINKEDIN_CLIENT_ID is not configured');
  }

  const redirectUri = getLinkedInRedirectUri(origin);
  // Requested scopes: openid profile email for identity, w_member_social for publishing
  const scope = encodeURIComponent('openid profile email w_member_social');

  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${scope}`;
}

export async function exchangeLinkedInCode(code: string, origin?: string): Promise<{ accessToken: string; expiresIn: number }> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = getLinkedInRedirectUri(origin);

  if (!clientId || !clientSecret) {
    throw new Error('LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET is missing');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Échec de la récupération du jeton LinkedIn');
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000, // 60 days standard
  };
}

export async function getLinkedInUserProfile(accessToken: string): Promise<LinkedInProfile> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Impossible de récupérer le profil LinkedIn : ${errorText}`);
  }

  const data = await res.json();
  return {
    sub: data.sub,
    name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || 'Membre LinkedIn',
    email: data.email,
    picture: data.picture,
  };
}

/**
 * Publishes a post to LinkedIn feed using LinkedIn REST Posts API (Version: 202401).
 * Falls back to ugcPosts if needed.
 */
export async function publishToLinkedInFeed(
  accessToken: string,
  personSub: string,
  text: string,
  targetUrl?: string
): Promise<{ id: string; url: string }> {
  const authorUrn = personSub.startsWith('urn:li:') ? personSub : `urn:li:person:${personSub}`;

  // First try the modern LinkedIn REST Posts API
  const restPayload: any = {
    author: authorUrn,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  if (targetUrl) {
    restPayload.content = {
      article: {
        source: targetUrl,
        title: 'LinkedInForge Publication',
      },
    };
  }

  const restRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202401',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(restPayload),
  });

  if (restRes.ok) {
    const postId = restRes.headers.get('x-restli-id') || restRes.headers.get('x-linkedin-id') || 'ok';
    return {
      id: postId,
      url: 'https://www.linkedin.com/feed/',
    };
  }

  // Fallback to classic UGC Posts API if Rest Posts returned an error
  const ugcPayload: any = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text,
        },
        shareMediaCategory: targetUrl ? 'ARTICLE' : 'NONE',
        media: targetUrl
          ? [
              {
                status: 'READY',
                originalUrl: targetUrl,
                title: { text: 'LinkedInForge Publication' },
              },
            ]
          : undefined,
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const ugcRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(ugcPayload),
  });

  if (!ugcRes.ok) {
    const errText = await ugcRes.text();
    throw new Error(`Erreur lors de la publication sur LinkedIn : ${errText}`);
  }

  const ugcData = await ugcRes.json();
  return {
    id: ugcData.id || 'ugc-published',
    url: 'https://www.linkedin.com/feed/',
  };
}
