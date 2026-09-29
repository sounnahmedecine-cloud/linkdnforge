import { NextRequest, NextResponse } from 'next/server';
import { publishToFacebookPage } from '@/lib/facebook/client';

export async function POST(request: NextRequest) {
  try {
    const cookieValue = request.cookies.get('facebook_user_token')?.value;

    if (!cookieValue) {
      return NextResponse.json(
        {
          success: false,
          error: 'Votre Page Facebook n’est pas encore connectée.',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    let tokenData: any;
    try {
      tokenData = JSON.parse(cookieValue);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Session Facebook invalide. Veuillez reconnecter votre Page.',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    if (!tokenData?.pageAccessToken || !tokenData?.pageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Informations de publication Facebook incomplètes. Veuillez reconnecter votre Page.',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { post, targetUrl, mediaUrl } = body;

    if (!post || typeof post !== 'string' || !post.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le contenu du post est vide.',
        },
        { status: 400 }
      );
    }

    // Call Facebook Graph API
    const publishResult = await publishToFacebookPage(
      tokenData.pageAccessToken,
      tokenData.pageId,
      post.trim(),
      targetUrl?.trim() || undefined,
      mediaUrl?.trim() || undefined
    );

    return NextResponse.json({
      success: true,
      message: `Publication effectuée avec succès sur votre Page Facebook « ${tokenData.pageName || 'Facebook'} » !`,
      postId: publishResult.id,
      feedUrl: publishResult.url,
      pageName: tokenData.pageName,
    });
  } catch (error: any) {
    console.error('Facebook Direct Publish Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la publication directe sur Facebook.',
      },
      { status: 500 }
    );
  }
}
