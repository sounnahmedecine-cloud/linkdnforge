export interface ScrapedPageData {
  success: boolean;
  title: string;
  description: string;
  content: string;
  ogImage: string | null;
  screenshotUrl: string | null;
  detectedCategory: 'gaming' | 'ecommerce' | 'education' | 'saas' | 'creative' | 'general';
  source: 'jina' | 'direct-html' | 'meta-only' | 'fallback';
  warning?: string;
}

/**
 * Robust in-process URL scraper.
 * Extracts OpenGraph metadata, HTML body content, and Jina Reader markdown
 * without any internal HTTP self-fetch loops or dependency on serverless network routing.
 */
export async function scrapeUrlContent(rawUrl: string): Promise<ScrapedPageData> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      success: false,
      title: '',
      description: '',
      content: '',
      ogImage: null,
      screenshotUrl: null,
      detectedCategory: 'general',
      source: 'fallback',
      warning: 'URL vide ou invalide.',
    };
  }

  const finalUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl.trim()
    : `https://${rawUrl.trim()}`;

  const screenshotUrl = `https://image.thum.io/get/width/1200/crop/675/${finalUrl}`;

  let extractedTitle = '';
  let extractedDescription = '';
  let ogImage: string | null = null;
  let htmlCleanText = '';
  let jinaContent = '';

  // 1. Direct HTML fetch with modern User-Agent and realistic headers
  try {
    const htmlController = new AbortController();
    const htmlTimeout = setTimeout(() => htmlController.abort(), 8000);

    const htmlRes = await fetch(finalUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: htmlController.signal,
    });
    clearTimeout(htmlTimeout);

    if (htmlRes.ok) {
      const html = await htmlRes.text();

      // OpenGraph & Twitter Image extraction
      const ogImgMatch =
        html.match(/<meta[^>]*property=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:image|twitter:image)["']/i) ||
        html.match(/<meta[^>]*name=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);

      if (ogImgMatch?.[1]) {
        const rawImg = ogImgMatch[1].trim();
        try {
          ogImage = new URL(rawImg, finalUrl).href;
        } catch {
          ogImage = rawImg;
        }
      }

      // Title extraction
      const titleMatch =
        html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<title[^>]*>([^<]+)<\/title>/i);

      extractedTitle = (titleMatch?.[1] || '').trim();

      // Description extraction
      const descMatch =
        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*name=["'](?:description|twitter:description)["'][^>]*content=["']([^"']+)["']/i);

      extractedDescription = (descMatch?.[1] || '').trim();

      // Clean HTML textual body
      htmlCleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4000);
    }
  } catch (err: any) {
    console.warn('[url-scraper] Direct HTML fetch failed or timed out:', err?.message || err);
  }

  // 2. Jina Reader for rich markdown extraction
  try {
    const jinaController = new AbortController();
    const jinaTimeout = setTimeout(() => jinaController.abort(), 9000);

    const jinaRes = await fetch(`https://r.jina.ai/${finalUrl}`, {
      headers: {
        'Accept': 'text/plain',
        'X-With-Generated-Alt': 'true',
      },
      signal: jinaController.signal,
    });
    clearTimeout(jinaTimeout);

    if (jinaRes.ok) {
      const text = await jinaRes.text();
      if (text && text.trim().length > 60) {
        jinaContent = text.slice(0, 10000);

        // Try extracting an image from Jina markdown if og:image was missing
        if (!ogImage) {
          const imgMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s\)]+?\.(?:jpg|jpeg|png|webp|avif|gif)[^\s\)]*)\)/i);
          if (imgMatch?.[1]) {
            ogImage = imgMatch[1];
          }
        }

        // Try extracting title from Jina markdown if missing
        if (!extractedTitle) {
          const jinaTitleMatch = text.match(/^Title:\s*(.+)$/m);
          if (jinaTitleMatch?.[1]) {
            extractedTitle = jinaTitleMatch[1].trim();
          }
        }
      }
    }
  } catch (jinaErr: any) {
    console.warn('[url-scraper] Jina Reader failed or timed out:', jinaErr?.message || jinaErr);
  }

  // 3. Combine into rich text representation for the AI
  const combinedContent = jinaContent || [
    extractedTitle ? `Titre de la page : ${extractedTitle}` : '',
    extractedDescription ? `Description : ${extractedDescription}` : '',
    htmlCleanText ? `Extrait textuel du site :\n${htmlCleanText}` : '',
  ].filter(Boolean).join('\n\n') || `Page web : ${finalUrl}`;

  // 4. Heuristic Category Detection
  const combinedLower = (
    finalUrl +
    ' ' +
    extractedTitle +
    ' ' +
    extractedDescription +
    ' ' +
    combinedContent
  ).toLowerCase();

  let detectedCategory: ScrapedPageData['detectedCategory'] = 'general';

  if (
    combinedLower.includes('rpg') ||
    combinedLower.includes('jeu') ||
    combinedLower.includes('game') ||
    combinedLower.includes('pixel-art') ||
    combinedLower.includes('pixel art') ||
    combinedLower.includes('nour') ||
    combinedLower.includes('gaming') ||
    combinedLower.includes('gameplay')
  ) {
    detectedCategory = 'gaming';
  } else if (
    combinedLower.includes('parfum') ||
    combinedLower.includes('produit') ||
    combinedLower.includes('panier') ||
    combinedLower.includes('boutique') ||
    combinedLower.includes('livraison') ||
    combinedLower.includes('shop') ||
    combinedLower.includes('prix')
  ) {
    detectedCategory = 'ecommerce';
  } else if (
    combinedLower.includes('cours') ||
    combinedLower.includes('formation') ||
    combinedLower.includes('apprendre') ||
    combinedLower.includes('enfant') ||
    combinedLower.includes('école') ||
    combinedLower.includes('adab') ||
    combinedLower.includes('sagesse')
  ) {
    detectedCategory = 'education';
  } else if (
    combinedLower.includes('saas') ||
    combinedLower.includes('logiciel') ||
    combinedLower.includes('crm') ||
    combinedLower.includes('workflow') ||
    combinedLower.includes('b2b')
  ) {
    detectedCategory = 'saas';
  }

  const success = !!(extractedTitle || extractedDescription || jinaContent || htmlCleanText);

  return {
    success,
    title: extractedTitle || (detectedCategory === 'gaming' ? 'Jeu vidéo / Expérience interactive' : 'Page Web'),
    description: extractedDescription,
    content: combinedContent,
    ogImage,
    screenshotUrl,
    detectedCategory,
    source: jinaContent ? 'jina' : htmlCleanText ? 'direct-html' : extractedTitle ? 'meta-only' : 'fallback',
    warning: success ? undefined : 'Impossible d’extraire le contenu automatique de cette adresse.',
  };
}
