import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const hasAppConfigured = !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
  const cookieValue = request.cookies.get('linkedin_user_token')?.value;

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
      response.cookies.set('linkedin_user_token', '', { maxAge: 0, path: '/' });
      return response;
    }

    return NextResponse.json({
      connected: true,
      hasAppConfigured,
      profile: data.profile || { name: 'Membre LinkedIn Connecté' },
    });
  } catch (e) {
    return NextResponse.json({ connected: false, hasAppConfigured });
  }
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, connected: false, message: 'Compte LinkedIn déconnecté' });
  response.cookies.set('linkedin_user_token', '', { maxAge: 0, path: '/' });
  return response;
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, connected: false, message: 'Compte LinkedIn déconnecté' });
  response.cookies.set('linkedin_user_token', '', { maxAge: 0, path: '/' });
  return response;
}
