import { NextRequest, NextResponse } from 'next/server';
import { exchangeFacebookCode, getFacebookUserAndPages, getPublicOrigin } from '@/lib/facebook/client';

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
    console.error('Facebook OAuth Error from provider:', error, errorDescription);
    redirectTarget.searchParams.set('facebook_error', errorDescription || error);
    return NextResponse.redirect(redirectTarget);
  }

  if (!code) {
    redirectTarget.searchParams.set('facebook_error', 'Code d’autorisation manquant');
    return NextResponse.redirect(redirectTarget);
  }

  // Validate state
  const savedState = request.cookies.get('facebook_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    console.warn('Facebook OAuth State mismatch:', { savedState, state });
  }

  try {
    // Exchange code for user access token
    const tokenData = await exchangeFacebookCode(code, origin);

    // Fetch user profile info and user's Facebook Pages
    const { userProfile, pages } = await getFacebookUserAndPages(tokenData.accessToken);

    if (!pages || pages.length === 0) {
      redirectTarget.searchParams.set(
        'facebook_error',
        'Aucune Page Facebook trouvée sur ce compte. Veuillez créer ou gérer au moins une Page Facebook pour publier automatiquement.'
      );
      return NextResponse.redirect(redirectTarget);
    }

    // Default to the first page (or page with highest category/role)
    const primaryPage = pages[0];

    redirectTarget.searchParams.set('facebook_connected', 'true');
    const response = NextResponse.redirect(redirectTarget);

    const tokenPayload = {
      userAccessToken: tokenData.accessToken,
      pageAccessToken: primaryPage.access_token,
      pageId: primaryPage.id,
      pageName: primaryPage.name,
      userProfile,
      pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        picture: p.picture,
      })),
      expiresAt: Date.now() + tokenData.expiresIn * 1000,
    };

    // Store token securely in an HTTP-only cookie
    response.cookies.set('facebook_user_token', JSON.stringify(tokenPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expiresIn || 60 * 24 * 60 * 60, // 60 days
      path: '/',
    });

    // Clear temporary state cookie
    response.cookies.set('facebook_oauth_state', '', { maxAge: 0, path: '/' });

    return response;
  } catch (err: any) {
    console.error('Facebook Token Exchange Error:', err);
    redirectTarget.searchParams.set('facebook_error', err.message || 'Échec de la connexion Facebook');
    return NextResponse.redirect(redirectTarget);
  }
}
