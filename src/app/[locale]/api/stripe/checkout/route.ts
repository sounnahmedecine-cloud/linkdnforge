import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Remove the locale prefix (e.g. /fr/api -> /api)
  const newPath = url.pathname.replace(/^\/(fr|en|es)\//, '/');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const baseUrl = `${proto}://${host}`;
  const newUrl = new URL(newPath + url.search, baseUrl);
  return NextResponse.redirect(newUrl);
}
