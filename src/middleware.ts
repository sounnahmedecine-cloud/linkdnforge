import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

// Liste des scrapers agressifs, frameworks de scraping et bots de datacenters
const BAD_BOT_REGEX = /headlesschrome|puppeteer|selenium|playwright|phantomjs|python-requests|aiohttp|httpx|go-http-client|curl\/|wget\/|scrapy|bytespider|semrushbot|ahrefsbot|dotbot|mj12bot|petalbot|zoominfobot|dataforseobot|seekport|megaindex|censysinspect|zgrab|nmap/i;

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
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Filtrage strict des bots et scrapers agressifs
  if (BAD_BOT_REGEX.test(userAgent)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Automated scraping forbidden' }, { status: 403 });
    }
    return new NextResponse('Accès refusé aux robots automatisés.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // 2. Protection des routes API
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

  // 3. Redirection legacy /onboarding vers /dashboard
  const legacyOnboarding = pathname.match(/^\/(fr|en|es)\/onboarding(\/|$)/);
  if (legacyOnboarding) {
    const locale = legacyOnboarding[1];
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // 4. Protection des routes app privées
  const protectedMatch = pathname.match(/^\/(fr|en|es)\/(dashboard|setup|admin)(\/|$)/);
  if (protectedMatch && !hasValidSession(request)) {
    const locale = protectedMatch[1];
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
