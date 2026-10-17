import { NextRequest, NextResponse } from 'next/server';
import {
  clearSessionCookies,
  createSessionFromIdToken,
  getRequestSession,
  SessionError,
  setSessionCookies,
} from '@/lib/auth/session';

/** Utilisateur de la session vérifiée (rôle calculé côté serveur). */
export async function GET(request: NextRequest) {
  const user = await getRequestSession(request);
  if (!user) {
    const response = NextResponse.json({ user: null }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }
  return NextResponse.json({ user });
}

/**
 * Ouverture de session : le client s'authentifie avec Firebase Auth (Google ou
 * lien magique e-mail) puis envoie son ID token, échangé ici contre un cookie de
 * session httpOnly vérifiable côté serveur.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json().catch(() => ({}));
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Jeton manquant' }, { status: 400 });
    }

    const { user, sessionCookie, isNewUser, displayName } = await createSessionFromIdToken(idToken);

    const response = NextResponse.json({
      message: isNewUser ? 'Compte créé avec succès' : 'Connecté',
      user,
      isNewUser,
    });
    setSessionCookies(response, sessionCookie, { email: user.email, displayName });
    return response;
  } catch (error) {
    if (error instanceof SessionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Session error:', error);
    return NextResponse.json({ error: "Erreur d'authentification" }, { status: 500 });
  }
}
