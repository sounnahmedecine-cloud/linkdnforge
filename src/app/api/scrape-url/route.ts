import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    // Strategy 1: Jina Reader API (clean markdown extraction)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const jinaResponse = await fetch(`https://r.jina.ai/${finalUrl}`, {
        headers: { 'Accept': 'text/plain' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (jinaResponse.ok) {
        const text = await jinaResponse.text();
        if (text && text.trim().length > 50) {
          return NextResponse.json({ data: text.slice(0, 10000), source: 'jina' });
        }
      }
    } catch (jinaErr) {
      console.warn('Jina Reader indisponible ou timeout, bascule sur fetch direct:', jinaErr);
    }

    // Strategy 2: Direct Fetch with basic HTML meta extraction
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const directRes = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (directRes.ok) {
        const html = await directRes.text();

        // Extract title, og:title, og:description, meta description
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

        const title = ogTitleMatch?.[1] || titleMatch?.[1] || '';
        const description = ogDescMatch?.[1] || metaDescMatch?.[1] || '';

        // Extract clean text snippets from headings and paragraphs
        const cleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 3000);

        const extractedSummary = [
          title ? `Titre: ${title}` : '',
          description ? `Description: ${description}` : '',
          cleanText ? `Contenu: ${cleanText}` : ''
        ].filter(Boolean).join('\n\n');

        return NextResponse.json({ data: extractedSummary, source: 'direct-html' });
      }
    } catch (directErr) {
      console.warn('Direct fetch non concluant:', directErr);
    }

    // Strategy 3: Graceful fallback so the generator never crashes
    return NextResponse.json({
      data: `Site web : ${finalUrl}`,
      warning: 'Le contenu de la page n’a pas pu être extrait automatiquement, génération basée sur le lien et les thématiques.',
      source: 'fallback'
    });

  } catch (error) {
    console.error('Scrape URL Error fatal:', error);
    return NextResponse.json({
      data: '',
      warning: 'Impossible d’accéder à l’URL renseignée.',
    }, { status: 200 }); // Return 200 with empty data instead of breaking the entire app!
  }
}


