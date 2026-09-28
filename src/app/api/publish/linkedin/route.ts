import { NextRequest, NextResponse } from 'next/server';
import { publishToLinkedInFeed } from '@/lib/linkedin/client';

export async function POST(request: NextRequest) {
  try {
    const cookieValue = request.cookies.get('linkedin_user_token')?.value;

    if (!cookieValue) {
      return NextResponse.json(
        {
          success: false,
          error: 'Votre compte LinkedIn n’est pas encore connecté.',
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
          error: 'Session LinkedIn invalide. Veuillez vous reconnecter.',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    if (!tokenData?.accessToken || !tokenData?.profile?.sub) {
      return NextResponse.json(
        {
          success: false,
          error: 'Informations d’authentification incomplètes. Veuillez reconnecter votre compte.',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { post, targetUrl } = body;

    if (!post || typeof post !== 'string' || !post.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le contenu du post est vide.',
        },
        { status: 400 }
      );
    }

    // Call LinkedIn API
    const publishResult = await publishToLinkedInFeed(
      tokenData.accessToken,
      tokenData.profile.sub,
      post.trim(),
      targetUrl?.trim() || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Publication effectuée avec succès sur votre profil LinkedIn !',
      postId: publishResult.id,
      feedUrl: publishResult.url,
      authorName: tokenData.profile.name,
    });
  } catch (error: any) {
    console.error('LinkedIn Direct Publish Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la publication directe sur LinkedIn.',
      },
      { status: 500 }
    );
  }
}
