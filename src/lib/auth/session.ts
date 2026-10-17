import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import adminsConfig from '@/config/admins.json';
import {
  LEGACY_COOKIE,
  PROFILE_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from './constants';

export interface SessionUser {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  unlimited: boolean;
}

type AdminEntry = { email: string; role?: string; unlimited?: boolean };

function findAdmin(email: string): AdminEntry | undefined {
  const clean = email.trim().toLowerCase();
  return (adminsConfig.admins as AdminEntry[]).find((a) => a.email.toLowerCase() === clean);
}

/**
 * Le rôle est calculé ici, côté serveur, à partir d'une session vérifiée et d'un
 * e-mail confirmé par Firebase (Google ou lien magique). Il n'est jamais lu depuis
 * un cookie ou une requête du client.
 */
function toSessionUser(claims: { uid: string; email?: string; email_verified?: boolean }): SessionUser | null {
  const email = claims.email?.trim().toLowerCase();
  if (!email) return null;
  const admin = claims.email_verified ? findAdmin(email) : undefined;
  return {
    uid: claims.uid,
    email,
    role: admin ? 'admin' : 'user',
    unlimited: Boolean(admin?.unlimited),
  };
}

async function getAdminAuth() {
  const { adminAuth } = await import('@/lib/firebase-admin');
  return adminAuth;
}

export async function verifySessionValue(value: string | undefined): Promise<SessionUser | null> {
  if (!value) return null;
  const adminAuth = await getAdminAuth();
  if (!adminAuth) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(value, true);
    return toSessionUser(decoded);
  } catch {
    return null;
  }
}

/** Session de la requête (routes API). */
export function getRequestSession(request: NextRequest): Promise<SessionUser | null> {
  return verifySessionValue(request.cookies.get(SESSION_COOKIE)?.value);
}

/** Session courante (Server Components, Server Actions). */
export function getServerSession(): Promise<SessionUser | null> {
  return verifySessionValue(cookies().get(SESSION_COOKIE)?.value);
}

/**
 * Garde pour les routes API : renvoie l'utilisateur, ou une réponse 401/403 à
 * retourner telle quelle.
 *   const auth = await requireSession(request);
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireSession(
  request: NextRequest,
  options: { admin?: boolean } = {}
): Promise<SessionUser | NextResponse> {
  const user = await getRequestSession(request);
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  if (options.admin && user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
  }
  return user;
}

export class SessionError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Échange un ID token Firebase (Google ou lien magique, connexion de moins de
 * 5 minutes) contre un cookie de session, et synchronise le profil Firestore.
 */
export async function createSessionFromIdToken(idToken: string) {
  const { adminAuth, adminDb } = await import('@/lib/firebase-admin');
  if (!adminAuth) {
    throw new SessionError('Authentification indisponible', 503);
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken, true);
  } catch {
    throw new SessionError('Jeton invalide', 401);
  }

  // Seules les identités dont l'e-mail est prouvé (Google, lien magique) ouvrent
  // une session : un compte e-mail/mot de passe non vérifié ne passe pas.
  if (!decoded.email || !decoded.email_verified) {
    throw new SessionError('Adresse e-mail non vérifiée', 403);
  }
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
    throw new SessionError('Connexion trop ancienne, reconnectez-vous', 401);
  }

  const user = toSessionUser(decoded)!;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });

  let isNewUser = false;
  if (adminDb) {
    try {
      const userRef = adminDb.collection('users').doc(user.email);
      const existing = await userRef.get();
      const provider = decoded.firebase?.sign_in_provider === 'google.com' ? 'google' : 'email_link';
      if (!existing.exists) {
        isNewUser = true;
        await userRef.set({
          uid: decoded.uid,
          email: user.email,
          displayName: decoded.name || user.email.split('@')[0],
          photoURL: decoded.picture || null,
          emailVerified: true,
          provider,
          role: user.role,
          plan: 'free',
          createdAt: new Date(),
          lastLogin: new Date(),
        });
      } else {
        await userRef.update({
          uid: decoded.uid,
          displayName: decoded.name || existing.get('displayName') || null,
          photoURL: decoded.picture || existing.get('photoURL') || null,
          emailVerified: true,
          role: user.role,
          lastLogin: new Date(),
        });
      }
    } catch (dbErr) {
      console.warn('Firestore user sync non bloquant:', dbErr);
    }
  }

  return { user, sessionCookie, isNewUser, displayName: (decoded.name as string | undefined) || null };
}

export function setSessionCookies(
  response: NextResponse,
  sessionCookie: string,
  profile: { email: string; displayName?: string | null }
) {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  // Affichage uniquement (voir PROFILE_COOKIE) : aucun rôle, aucun droit.
  response.cookies.set(PROFILE_COOKIE, JSON.stringify({ email: profile.email, displayName: profile.displayName || null }), {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.cookies.set(LEGACY_COOKIE, '', { maxAge: 0, path: '/' });
}

export function clearSessionCookies(response: NextResponse) {
  for (const name of [SESSION_COOKIE, PROFILE_COOKIE, LEGACY_COOKIE]) {
    response.cookies.set(name, '', { maxAge: 0, path: '/' });
  }
}
