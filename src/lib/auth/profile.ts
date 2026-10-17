import { PROFILE_COOKIE } from './constants';

export interface ClientProfile {
  email: string;
  displayName?: string | null;
}

/**
 * Profil d'affichage (e-mail, nom) posé à la connexion. Ne donne aucun droit :
 * le rôle et l'authentification sont vérifiés côté serveur (fetchSessionUser).
 */
export function getClientProfile(): ClientProfile | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${PROFILE_COOKIE}=([^;]*)`));
    if (!match?.[1]) return null;
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (parsed && typeof parsed.email === 'string' && parsed.email.length > 0) {
      return { email: parsed.email.toLowerCase().trim(), displayName: parsed.displayName ?? null };
    }
  } catch {
    // cookie illisible
  }
  return null;
}
