import { NextRequest, NextResponse } from 'next/server';
import { exchangeTwitterCode, getTwitterUserProfile, getPublicOrigin } from '@/lib/twitter/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const origin = getPublicOrigin(request);
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const redirectTarget = new URL('/dashboard', origin);
  redirectTarget.searchParams.set('tab', 'social');

  if (error) {
    console.error('Twitter OAuth Error from provider:', error, errorDescription);
    redirectTarget.searchParams.set('twitter_error', errorDescription || error);
    return NextResponse.redirect(redirectTarget);
  }

  if (!code) {
    redirectTarget.searchParams.set('twitter_error', 'Code d’autorisation manquant');
    return NextResponse.redirect(redirectTarget);
  }

  // Validate state
  const savedState = request.cookies.get('twitter_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    console.warn('Twitter OAuth State mismatch:', { savedState, state });
  }

  const codeVerifier = request.cookies.get('twitter_oauth_verifier')?.value;
  if (!codeVerifier) {
    redirectTarget.searchParams.set('twitter_error', 'Code verifier PKCE manquant ou expiré. Veuillez réessayer.');
    return NextResponse.redirect(redirectTarget);
  }

  try {
    // Exchange code for token using PKCE verifier
    const tokenData = await exchangeTwitterCode(code, codeVerifier, origin);

    // Fetch user profile info
    const userProfile = await getTwitterUserProfile(tokenData.accessToken);

    redirectTarget.searchParams.set('twitter_connected', 'true');
    const response = NextResponse.redirect(redirectTarget);

    const tokenPayload = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: Date.now() + tokenData.expiresIn * 1000,
      userProfile,
    };

    // Store token securely in an HTTP-only cookie
    response.cookies.set('twitter_user_token', JSON.stringify(tokenPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expiresIn || 60 * 24 * 60 * 60,
      path: '/',
    });

    // Clear temporary state and verifier cookies
    response.cookies.set('twitter_oauth_state', '', { maxAge: 0, path: '/' });
    response.cookies.set('twitter_oauth_verifier', '', { maxAge: 0, path: '/' });

    return response;
  } catch (err: any) {
    console.error('Twitter Token Exchange Error:', err);
    redirectTarget.searchParams.set('twitter_error', err.message || 'Échec de la connexion X (Twitter)');
    return NextResponse.redirect(redirectTarget);
  }
}
