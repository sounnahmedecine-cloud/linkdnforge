'use client';

import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
export { getClientProfile, type ClientProfile } from './profile';

const EMAIL_FOR_SIGN_IN_KEY = 'linkdnforge_email_for_signin';

export interface VerifiedUser {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  unlimited: boolean;
}

/** Utilisateur de la session vérifiée par le serveur (rôle inclus), ou null. */
export async function fetchSessionUser(): Promise<VerifiedUser | null> {
  try {
    const res = await fetch('/api/auth/session', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

/** Échange l'identité Firebase contre le cookie de session httpOnly du serveur. */
async function openServerSession(user: User): Promise<{ isNewUser: boolean }> {
  const idToken = await user.getIdToken();
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await response.json().catch(() => ({}));

  // La session de l'app repose sur le cookie serveur : inutile de garder
  // une session Firebase Auth côté client.
  signOut(auth).catch(() => {});

  if (!response.ok) {
    throw new Error(data.error || "Erreur d'authentification");
  }
  return { isNewUser: Boolean(data.isNewUser) };
}

export async function signInWithGoogle(): Promise<{ isNewUser: boolean }> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return openServerSession(result.user);
}

/**
 * Envoie un lien magique de connexion (Firebase email link sign-in). Le lien
 * ramène sur /{locale}/login/finish, qui ouvre la session puis redirige vers `next`.
 */
export async function sendMagicLink(email: string, locale: string, next = `/${locale}/dashboard`) {
  const url = new URL(`/${locale}/login/finish`, window.location.origin);
  url.searchParams.set('next', next);
  await sendSignInLinkToEmail(auth, email, { url: url.toString(), handleCodeInApp: true });
  try {
    localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
  } catch {
    // l'e-mail sera redemandé à l'ouverture du lien
  }
}

export function isMagicLink(href: string): boolean {
  return isSignInWithEmailLink(auth, href);
}

export function getPendingMagicLinkEmail(): string {
  try {
    return localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY) || '';
  } catch {
    return '';
  }
}

export async function completeMagicLink(email: string, href: string): Promise<{ isNewUser: boolean }> {
  const result = await signInWithEmailLink(auth, email, href);
  try {
    localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
  } catch {
    // ignore
  }
  return openServerSession(result.user);
}

/** Destination interne uniquement (évite les redirections ouvertes). */
export function safeNextPath(next: string | null, fallback: string): string {
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) return next;
  return fallback;
}
