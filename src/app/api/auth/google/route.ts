import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // TODO: Integrate with Firebase Google OAuth
    // For now, return mock Google OAuth URL

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID || 'mock_client_id');
    googleAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'openid email profile');

    return NextResponse.json({
      url: googleAuthUrl.toString()
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Erreur Google' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // TODO: Exchange code for token with Firebase
    // For now, mock authentication
    const mockUser = {
      uid: `google_${Date.now()}`,
      email: 'user@google.com',
      provider: 'google',
      createdAt: new Date().toISOString()
    };

    const response = NextResponse.redirect(new URL('/onboarding', request.url));
    response.cookies.set('auth_token', JSON.stringify(mockUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
