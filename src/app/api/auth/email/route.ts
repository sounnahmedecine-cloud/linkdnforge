import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, isSignUp } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit avoir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // For now, mock authentication - in production, use Firebase
    // TODO: Integrate with Firebase Authentication
    const mockUser = {
      uid: `user_${Date.now()}`,
      email,
      createdAt: new Date().toISOString()
    };

    // Set auth cookie
    const response = NextResponse.json({
      message: isSignUp ? 'Compte créé avec succès' : 'Connecté',
      user: mockUser
    });

    response.cookies.set('auth_token', JSON.stringify(mockUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Erreur d\'authentification' },
      { status: 500 }
    );
  }
}
