import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    const finalUrl = url.startsWith('http') ? url : `https://${url}`;

    // Use Jina Reader API to get markdown content
    const response = await fetch(`https://r.jina.ai/${finalUrl}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors du scraping de l\'URL');
    }

    const text = await response.text();
    return NextResponse.json({ data: text });

  } catch (error) {
    console.error('Scrape URL Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la lecture de l\'URL' },
      { status: 500 }
    );
  }
}
