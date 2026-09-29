import { NextRequest, NextResponse } from 'next/server';
import { buildNetworkAdaptationPrompt, formatTweetSafe, SocialNetworkType } from '@/lib/prompts/network-adaptation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { post, network = 'x', locale = 'fr' } = await request.json();

    if (!post || typeof post !== 'string' || !post.trim()) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback if no API key: safe extraction
      const adapted = network === 'x' ? formatTweetSafe(post, 275) : post;
      return NextResponse.json({
        post: adapted,
        charCount: adapted.length,
        network,
      });
    }

    const prompt = buildNetworkAdaptationPrompt(post, network as SocialNetworkType, locale);

    // If target is LinkedIn and prompt is unchanged, return original
    if (network === 'linkedin') {
      return NextResponse.json({
        post,
        charCount: post.length,
        network,
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: network === 'x' ? 150 : 2000,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini adaptation API error:', response.status);
      const fallback = network === 'x' ? formatTweetSafe(post, 275) : post;
      return NextResponse.json({ post: fallback, charCount: fallback.length, network });
    }

    const data = await response.json();
    let adaptedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Enforce strict safety limit for X (Twitter) so it is NEVER > 280 characters
    if (network === 'x') {
      if (!adaptedText) {
        adaptedText = formatTweetSafe(post, 275);
      } else if (adaptedText.length > 280) {
        adaptedText = formatTweetSafe(adaptedText, 275);
      }
    }

    return NextResponse.json({
      post: adaptedText || post,
      charCount: (adaptedText || post).length,
      network,
    });
  } catch (error: any) {
    console.error('Adapt post error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l’adaptation du post' },
      { status: 500 }
    );
  }
}
