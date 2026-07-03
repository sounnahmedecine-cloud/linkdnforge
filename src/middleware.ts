import { NextRequest, NextResponse } from 'next/server';

function hasValidSession(request: NextRequest): boolean {
  const authToken = request.cookies.get('auth_token');
  if (!authToken?.value) return false;
  try {
    const user = JSON.parse(authToken.value);
    return typeof user?.email === 'string';
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  if (hasValidSession(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/onboarding',
    '/api/forge-post',
    '/api/generate-visual',
    '/api/generate-variants',
  ],
};
