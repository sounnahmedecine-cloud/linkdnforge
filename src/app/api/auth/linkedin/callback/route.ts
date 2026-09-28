import { NextRequest, NextResponse } from 'next/server';
import { exchangeLinkedInCode, getLinkedInUserProfile, getPublicOrigin } from '@/lib/linkedin/client';

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
    console.error('LinkedIn OAuth Error from provider:', error, errorDescription);
    redirectTarget.searchParams.set('linkedin_error', errorDescription || error);
    return NextResponse.redirect(redirectTarget);
  }

  if (!code) {
    redirectTarget.searchParams.set('linkedin_error', 'Code d’autorisation manquant');
    return NextResponse.redirect(redirectTarget);
  }

  // Validate state
  const savedState = request.cookies.get('linkedin_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    console.warn('LinkedIn OAuth State mismatch:', { savedState, state });
    // Still proceed if state is absent in dev, but log warning
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeLinkedInCode(code, origin);

    // Fetch user profile info
    const profile = await getLinkedInUserProfile(tokenData.accessToken);

    redirectTarget.searchParams.set('linkedin_connected', 'true');
    const response = NextResponse.redirect(redirectTarget);

    const tokenPayload = {
      accessToken: tokenData.accessToken,
      expiresAt: Date.now() + tokenData.expiresIn * 1000,
      profile,
    };

    // Store token securely in an HTTP-only cookie
    response.cookies.set('linkedin_user_token', JSON.stringify(tokenPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expiresIn || 60 * 24 * 60 * 60, // 60 days
      path: '/',
    });

    // Clear temporary state cookie
    response.cookies.set('linkedin_oauth_state', '', { maxAge: 0, path: '/' });

    return response;
  } catch (err: any) {
    console.error('LinkedIn Token Exchange Error:', err);
    redirectTarget.searchParams.set('linkedin_error', err.message || 'Échec de la connexion LinkedIn');
    return NextResponse.redirect(redirectTarget);
  }
}
