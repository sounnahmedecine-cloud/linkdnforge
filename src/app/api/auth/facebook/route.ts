import { NextRequest, NextResponse } from 'next/server';
import { getFacebookAuthUrl, getPublicOrigin } from '@/lib/facebook/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const origin = getPublicOrigin(request);
    const state = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const appId = process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId) {
      return NextResponse.json(
        {
          error: 'Configuration Facebook OAuth manquante.',
          help: 'Veuillez configurer FACEBOOK_APP_ID et FACEBOOK_APP_SECRET dans vos variables d’environnement (.env.local ou Vercel).',
          documentation: 'Créez une application sur developers.facebook.com de type "Business" avec les permissions pages_manage_posts et pages_show_list.',
        },
        { status: 503 }
      );
    }

    const authUrl = getFacebookAuthUrl(state, origin);
    const response = NextResponse.redirect(authUrl);

    // Save state in a short-lived secure cookie for CSRF protection
    response.cookies.set('facebook_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Facebook Auth Init Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l’initialisation Facebook' }, { status: 500 });
  }
}
