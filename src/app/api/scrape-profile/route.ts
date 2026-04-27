import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ data: null, blocked: true }, { status: 200 });
    }

    const html = await response.text();

    const extract = (patterns: RegExp[]) => {
      for (const p of patterns) {
        const m = html.match(p);
        if (m?.[1]) return decodeHTML(m[1]);
      }
      return null;
    };

    const ogTitle = extract([
      /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i,
      /<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i,
    ]);
    const ogDesc = extract([
      /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i,
      /<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i,
      /<meta[^>]+name="description"[^>]+content="([^"]+)"/i,
    ]);
    const title = extract([/<title[^>]*>([^<]+)<\/title>/i]);

    const parts = [ogTitle, ogDesc].filter(Boolean);
    const data = parts.length > 0 ? parts.join('\n') : title;

    return NextResponse.json({ data: data || null, blocked: !data });
  } catch {
    return NextResponse.json({ data: null, blocked: true }, { status: 200 });
  }
}

function decodeHTML(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
