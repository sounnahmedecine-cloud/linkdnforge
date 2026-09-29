import { NextRequest, NextResponse } from 'next/server';
import { generatePKCE, getTwitterAuthUrl, getPublicOrigin } from '@/lib/twitter/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const origin = getPublicOrigin(request);
    const state = `tw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const clientId = process.env.TWITTER_CLIENT_ID || process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        {
          error: 'Configuration X (Twitter) OAuth manquante.',
          help: 'Veuillez configurer TWITTER_CLIENT_ID et TWITTER_CLIENT_SECRET dans vos variables d’environnement (.env.local ou Vercel).',
          documentation: 'Créez une application sur developer.x.com avec OAuth 2.0 (User authentication) et les permissions tweet.read, tweet.write, users.read, offline.access.',
        },
        { status: 503 }
      );
    }

    const { codeVerifier, codeChallenge } = generatePKCE();
    const authUrl = getTwitterAuthUrl(state, codeChallenge, origin);

    const response = NextResponse.redirect(authUrl);

    // Save state and code_verifier in short-lived secure cookies for PKCE & CSRF protection
    response.cookies.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });

    response.cookies.set('twitter_oauth_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Twitter Auth Init Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l’initialisation X (Twitter)' }, { status: 500 });
  }
}
