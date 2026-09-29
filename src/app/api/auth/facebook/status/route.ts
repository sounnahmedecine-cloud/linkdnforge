import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const hasAppConfigured = !!(
    (process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) &&
    process.env.FACEBOOK_APP_SECRET
  );
  const cookieValue = request.cookies.get('facebook_user_token')?.value;

  if (!cookieValue) {
    return NextResponse.json({
      connected: false,
      hasAppConfigured,
    });
  }

  try {
    const data = JSON.parse(cookieValue);
    if (!data.pageAccessToken || !data.pageId || (data.expiresAt && Date.now() > data.expiresAt)) {
      const response = NextResponse.json({ connected: false, hasAppConfigured, expired: true });
      response.cookies.set('facebook_user_token', '', { maxAge: 0, path: '/' });
      return response;
    }

    return NextResponse.json({
      connected: true,
      hasAppConfigured,
      page: {
        id: data.pageId,
        name: data.pageName,
      },
      user: data.userProfile,
      pages: data.pages || [],
    });
  } catch (e) {
    return NextResponse.json({ connected: false, hasAppConfigured });
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, connected: false, message: 'Page Facebook déconnectée' });
  response.cookies.set('facebook_user_token', '', { maxAge: 0, path: '/' });
  return response;
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, connected: false, message: 'Page Facebook déconnectée' });
  response.cookies.set('facebook_user_token', '', { maxAge: 0, path: '/' });
  return response;
}
