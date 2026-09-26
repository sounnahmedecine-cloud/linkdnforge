import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Remove the locale prefix (e.g. /fr/api -> /api)
  const newPath = url.pathname.replace(/^\/(fr|en|es)\//, '/');
  const newUrl = new URL(newPath + url.search, request.url);
  return NextResponse.redirect(newUrl);
}
