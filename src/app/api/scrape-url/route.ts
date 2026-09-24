import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    // Use Jina Reader API to get markdown content
    const response = await fetch(`https://r.jina.ai/${url}`);
    
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
