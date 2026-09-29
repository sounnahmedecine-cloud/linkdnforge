import { NextRequest, NextResponse } from 'next/server';
import { getRedditAuthUrl, getPublicOrigin } from '@/lib/reddit/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const origin = getPublicOrigin(request);
    const state = `rd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const clientId = process.env.REDDIT_CLIENT_ID || process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        {
          error: 'Configuration Reddit OAuth manquante.',
          help: 'Veuillez configurer REDDIT_CLIENT_ID et REDDIT_CLIENT_SECRET dans vos variables d’environnement (.env.local ou Vercel).',
          documentation: 'Créez une application sur reddit.com/prefs/apps de type "web app" avec redirect uri vers votre domaine.',
        },
        { status: 503 }
      );
    }

    const authUrl = getRedditAuthUrl(state, origin);
    const response = NextResponse.redirect(authUrl);

    // Save state in a short-lived secure cookie for CSRF protection
    response.cookies.set('reddit_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Reddit Auth Init Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l’initialisation Reddit' }, { status: 500 });
  }
}
