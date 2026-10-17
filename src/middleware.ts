import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { hasValidEdgeSession, SESSION_COOKIE } from './lib/auth/edge-session';

const handleI18nRouting = createMiddleware(routing);

// Liste des scrapers agressifs, frameworks de scraping et bots de datacenters
const BAD_BOT_REGEX = /headlesschrome|puppeteer|selenium|playwright|phantomjs|python-requests|aiohttp|httpx|go-http-client|curl\/|wget\/|scrapy|bytespider|semrushbot|ahrefsbot|dotbot|mj12bot|petalbot|zoominfobot|dataforseobot|seekport|megaindex|censysinspect|zgrab|nmap/i;

// Signature du cookie de session Firebase vérifiée (certificats Google) :
// un cookie forgé à la main n'est plus accepté. Les handlers revérifient
// ensuite avec firebase-admin (révocation, rôle).
function hasValidSession(request: NextRequest): Promise<boolean> {
  return hasValidEdgeSession(request.cookies.get(SESSION_COOKIE)?.value);
}

export default async function middleware(request: NextRequest) {
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
    if (await hasValidSession(request)) {
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
  if (protectedMatch && !(await hasValidSession(request))) {
    const locale = protectedMatch[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Toutes les routes API sauf l'authentification, le webhook Stripe (signé)
    // et l'extension Chrome (CORS, sans cookie)
    '/api/((?!auth/|stripe/webhook|extension/).*)',
  ],
};
