import { NextRequest, NextResponse } from 'next/server';
import { publishToReddit } from '@/lib/reddit/client';

export async function POST(request: NextRequest) {
  try {
    const cookieValue = request.cookies.get('reddit_user_token')?.value;

    if (!cookieValue) {
      return NextResponse.json(
        {
          success: false,
          error: 'Votre compte Reddit n’est pas encore connecté.',
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
          error: 'Session Reddit invalide. Veuillez reconnecter votre compte.',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    if (!tokenData?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Jeton d’accès Reddit manquant. Veuillez reconnecter votre compte.',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { post, title, subreddit, targetUrl } = body;

    if (!post || typeof post !== 'string' || !post.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le contenu du post Reddit est vide.',
        },
        { status: 400 }
      );
    }

    // Call Reddit API submit
    const publishResult = await publishToReddit(
      tokenData.accessToken,
      subreddit || 'u_' + (tokenData.userProfile?.name || 'me'),
      post.trim(),
      title?.trim() || undefined,
      targetUrl?.trim() || undefined
    );

    return NextResponse.json({
      success: true,
      message: `Publication réussie sur Reddit (${publishResult.subreddit.startsWith('u_') ? 'votre profil' : 'r/' + publishResult.subreddit}) !`,
      postId: publishResult.id,
      postUrl: publishResult.url,
      subreddit: publishResult.subreddit,
      username: tokenData.userProfile?.name,
    });
  } catch (error: any) {
    console.error('Reddit Direct Publish Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la publication directe sur Reddit.',
      },
      { status: 500 }
    );
  }
}
