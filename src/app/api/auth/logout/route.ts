import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Déconnecté' });
  response.cookies.set('auth_token', '', { maxAge: 0 });
  return response;
}
