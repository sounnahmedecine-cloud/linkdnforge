import { NextRequest, NextResponse } from 'next/server';
import { publishTweet } from '@/lib/twitter/client';

export async function POST(request: NextRequest) {
  try {
    const cookieValue = request.cookies.get('twitter_user_token')?.value;

    if (!cookieValue) {
      return NextResponse.json(
        {
          success: false,
          error: 'Votre compte X (Twitter) n’est pas encore connecté.',
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
          error: 'Session X (Twitter) invalide. Veuillez reconnecter votre compte.',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    if (!tokenData?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Jeton d’accès X manquant. Veuillez reconnecter votre compte.',
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
          error: 'Le contenu du tweet est vide.',
        },
        { status: 400 }
      );
    }

    // Call Twitter API v2
    const publishResult = await publishTweet(
      tokenData.accessToken,
      post.trim(),
      targetUrl?.trim() || undefined
    );

    const username = tokenData.userProfile?.username || '';
    const userViewUrl = username ? `https://twitter.com/${username}/status/${publishResult.id}` : publishResult.url;

    return NextResponse.json({
      success: true,
      message: `Tweet publié avec succès sur votre compte X @${username || 'Twitter'} !`,
      tweetId: publishResult.id,
      tweetUrl: userViewUrl,
      username: username,
    });
  } catch (error: any) {
    console.error('Twitter Direct Publish Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la publication directe sur X (Twitter).',
      },
      { status: 500 }
    );
  }
}
