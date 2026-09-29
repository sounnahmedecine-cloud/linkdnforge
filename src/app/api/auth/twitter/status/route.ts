import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const hasAppConfigured = !!(
    process.env.TWITTER_CLIENT_ID || process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID
  );
  const cookieValue = request.cookies.get('twitter_user_token')?.value;

  if (!cookieValue) {
    return NextResponse.json({
      connected: false,
      hasAppConfigured,
    });
  }

  try {
    const data = JSON.parse(cookieValue);
    if (!data.accessToken || (data.expiresAt && Date.now() > data.expiresAt)) {
      const response = NextResponse.json({ connected: false, hasAppConfigured, expired: true });
      response.cookies.set('twitter_user_token', '', { maxAge: 0, path: '/' });
      return response;
    }

    return NextResponse.json({
      connected: true,
      hasAppConfigured,
      user: data.userProfile,
    });
  } catch (e) {
    return NextResponse.json({ connected: false, hasAppConfigured });
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, connected: false, message: 'Compte X (Twitter) déconnecté' });
  response.cookies.set('twitter_user_token', '', { maxAge: 0, path: '/' });
  return response;
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, connected: false, message: 'Compte X (Twitter) déconnecté' });
  response.cookies.set('twitter_user_token', '', { maxAge: 0, path: '/' });
  return response;
}
