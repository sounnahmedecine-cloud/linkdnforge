import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrlContent } from '@/lib/services/url-scraper';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    const result = await scrapeUrlContent(url);

    return NextResponse.json({
      data: result.content,
      title: result.title,
      description: result.description,
      screenshotUrl: result.screenshotUrl,
      ogImage: result.ogImage,
      detectedCategory: result.detectedCategory,
      source: result.source,
      warning: result.warning,
    });
  } catch (error: any) {
    console.error('[Scrape URL] Erreur fatale:', error);
    return NextResponse.json(
      {
        data: '',
        title: '',
        description: '',
        screenshotUrl: null,
        ogImage: null,
        detectedCategory: 'general',
        source: 'fallback',
        warning: 'Impossible d’accéder à l’URL renseignée.',
      },
      { status: 200 }
    );
  }
}
