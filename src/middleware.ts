import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    if (hasValidSession(request)) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const intlResponse = handleI18nRouting(request);
  if (intlResponse.headers.get('location')) {
    return intlResponse;
  }

  const onboardingMatch = pathname.match(/^\/(fr|en|es)\/onboarding(\/|$)/);
  if (onboardingMatch && !hasValidSession(request)) {
    const locale = onboardingMatch[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/api/forge-post',
    '/api/generate-visual',
    '/api/generate-variants',
  ],
};
