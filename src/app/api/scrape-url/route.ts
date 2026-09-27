import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    // Reliable screenshot URL (thum.io provides high availability and CORS support)
    const screenshotUrl = `https://image.thum.io/get/width/1200/crop/675/${finalUrl}`;

    let extractedTitle = '';
    let extractedDescription = '';
    let ogImage: string | null = null;
    let htmlCleanText = '';

    // Step 1: Always extract authentic HTML OpenGraph metadata (og:image, twitter:image, titles)
    try {
      const metaController = new AbortController();
      const metaTimeout = setTimeout(() => metaController.abort(), 5000);

      const htmlRes = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: metaController.signal,
      });
      clearTimeout(metaTimeout);

      if (htmlRes.ok) {
        const html = await htmlRes.text();

        // Extract og:image or twitter:image
        const ogImageMatch = html.match(/<meta[^>]*property=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:image|twitter:image)["']/i)
          || html.match(/<meta[^>]*name=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);

        if (ogImageMatch?.[1]) {
          const rawImg = ogImageMatch[1].trim();
          try {
            ogImage = new URL(rawImg, finalUrl).href;
          } catch {
            ogImage = rawImg;
          }
        }

        // Extract title & description
        const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

        extractedTitle = titleMatch?.[1]?.trim() || '';
        extractedDescription = descMatch?.[1]?.trim() || '';

        // Extract clean text snippets
        htmlCleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 4000);
      }
    } catch (metaErr) {
      console.warn('[Scrape URL] Erreur extraction meta HTML directe:', metaErr);
    }

    // Step 2: Try Jina Reader for high quality article markdown extraction
    let jinaContent = '';
    try {
      const jinaController = new AbortController();
      const jinaTimeout = setTimeout(() => jinaController.abort(), 7000);

      const jinaResponse = await fetch(`https://r.jina.ai/${finalUrl}`, {
        headers: { 'Accept': 'text/plain' },
        signal: jinaController.signal,
      });
      clearTimeout(jinaTimeout);

      if (jinaResponse.ok) {
        const text = await jinaResponse.text();
        if (text && text.trim().length > 50) {
          jinaContent = text.slice(0, 10000);

          // If no og:image found yet, check if Jina found an image
          if (!ogImage) {
            const imgMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s\)]+?\.(?:jpg|jpeg|png|webp|avif)[^\s\)]*)\)/i);
            if (imgMatch?.[1]) {
              ogImage = imgMatch[1];
            }
          }
        }
      }
    } catch (jinaErr) {
      console.warn('[Scrape URL] Jina indisponible, utilisation du contenu direct:', jinaErr);
    }

    // Combine extracted content
    const finalContent = jinaContent || [
      extractedTitle ? `Titre : ${extractedTitle}` : '',
      extractedDescription ? `Description : ${extractedDescription}` : '',
      htmlCleanText ? `Contenu : ${htmlCleanText}` : '',
    ].filter(Boolean).join('\n\n') || `Site web : ${finalUrl}`;

    return NextResponse.json({
      data: finalContent,
      screenshotUrl,
      ogImage: ogImage || null,
      source: jinaContent ? 'jina' : 'direct-html'
    });

  } catch (error: any) {
    console.error('[Scrape URL] Erreur fatale:', error);
    return NextResponse.json({
      data: '',
      screenshotUrl: null,
      ogImage: null,
      warning: 'Impossible d’accéder à l’URL renseignée.',
    }, { status: 200 });
  }
}
