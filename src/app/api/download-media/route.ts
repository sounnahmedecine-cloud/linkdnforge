import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaUrl = searchParams.get('url');
    const customFilename = searchParams.get('filename') || `media-preview-${Date.now()}.jpg`;

    if (!mediaUrl) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    // Validate protocol
    if (!mediaUrl.startsWith('http://') && !mediaUrl.startsWith('https://')) {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    const response = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Impossible de récupérer le média distant (${response.status})` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    // Clean safe filename
    const safeFilename = customFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    console.error('Erreur API download-media:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du téléchargement du média.' },
      { status: 500 }
    );
  }
}
