import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookies, getRequestSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  // Révoque les sessions Firebase de l'utilisateur : un cookie copié ailleurs
  // cesse d'être accepté par les vérifications avec contrôle de révocation.
  const user = await getRequestSession(request);
  if (user) {
    try {
      const { adminAuth } = await import('@/lib/firebase-admin');
      await adminAuth?.revokeRefreshTokens(user.uid);
    } catch (err) {
      console.warn('Révocation de session non bloquante:', err);
    }
  }

  const response = NextResponse.json({ message: 'Déconnecté' });
  clearSessionCookies(response);
  const cookiesToClear = [
    'linkedin_user_token',
    'linkedin_oauth_state',
    'facebook_user_token',
    'facebook_oauth_state',
    'twitter_user_token',
    'twitter_oauth_state',
    'twitter_code_verifier',
    'reddit_user_token',
    'reddit_oauth_state',
  ];

  cookiesToClear.forEach((cookieName) => {
    response.cookies.set(cookieName, '', { maxAge: 0, path: '/' });
  });

  return response;
}
