import { NextRequest, NextResponse } from 'next/server';
import { exchangeRedditCode, getRedditUserProfile, getPublicOrigin } from '@/lib/reddit/client';

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
    console.error('Reddit OAuth Error from provider:', error, errorDescription);
    redirectTarget.searchParams.set('reddit_error', errorDescription || error);
    return NextResponse.redirect(redirectTarget);
  }

  if (!code) {
    redirectTarget.searchParams.set('reddit_error', 'Code d’autorisation manquant');
    return NextResponse.redirect(redirectTarget);
  }

  // Validate state
  const savedState = request.cookies.get('reddit_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    console.warn('Reddit OAuth State mismatch:', { savedState, state });
  }

  try {
    // Exchange code for token
    const tokenData = await exchangeRedditCode(code, origin);

    // Fetch user profile info
    const userProfile = await getRedditUserProfile(tokenData.accessToken);

    redirectTarget.searchParams.set('reddit_connected', 'true');
    const response = NextResponse.redirect(redirectTarget);

    const tokenPayload = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: Date.now() + tokenData.expiresIn * 1000,
      userProfile,
    };

    // Store token securely in an HTTP-only cookie
    response.cookies.set('reddit_user_token', JSON.stringify(tokenPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expiresIn || 60 * 24 * 60 * 60,
      path: '/',
    });

    // Clear temporary state cookie
    response.cookies.set('reddit_oauth_state', '', { maxAge: 0, path: '/' });

    return response;
  } catch (err: any) {
    console.error('Reddit Token Exchange Error:', err);
    redirectTarget.searchParams.set('reddit_error', err.message || 'Échec de la connexion Reddit');
    return NextResponse.redirect(redirectTarget);
  }
}
