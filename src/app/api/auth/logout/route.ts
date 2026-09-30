import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Déconnecté' });
  const cookiesToClear = [
    'auth_token',
    'linkedin_user_token',
    'linkedin_oauth_state',
    'facebook_user_token',
    'facebook_oauth_state',
    'twitter_user_token',
    'twitter_oauth_state',
    'twitter_code_verifier',
    'reddit_user_token',
    'reddit_oauth_state',
  ];

  cookiesToClear.forEach((cookieName) => {
    response.cookies.set(cookieName, '', { maxAge: 0, path: '/' });
  });

  return response;
}


