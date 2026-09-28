import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAuthUrl, getPublicOrigin } from '@/lib/linkedin/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const origin = getPublicOrigin(request);
    const state = `li_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (!process.env.LINKEDIN_CLIENT_ID) {
      return NextResponse.json(
        {
          error: 'Configuration LinkedIn OAuth manquante.',
          help: 'Veuillez configurer LINKEDIN_CLIENT_ID et LINKEDIN_CLIENT_SECRET dans vos variables d’environnement (.env.local ou Vercel).',
          documentation: 'Créez une application gratuite sur developer.linkedin.com avec le produit "Share on LinkedIn" et "Sign In with LinkedIn".',
        },
        { status: 503 }
      );
    }

    const authUrl = getLinkedInAuthUrl(state, origin);
    const response = NextResponse.redirect(authUrl);

    // Save state in a short-lived secure cookie for CSRF protection
    response.cookies.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
    });

    return response;
  } catch (error: any) {
    console.error('LinkedIn Auth Init Error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l’initialisation LinkedIn' }, { status: 500 });
  }
}
