// Partagé entre le serveur Node, le middleware Edge et le client.

/** Cookie de session Firebase (httpOnly) : seule source de vérité de l'authentification. */
export const SESSION_COOKIE = '__session';

/**
 * Cookie d'affichage lisible côté client (e-mail, nom). Il n'accorde AUCUN droit :
 * le serveur ne le lit jamais, il sert seulement à l'UI (en-tête, stockage local par compte).
 */
export const PROFILE_COOKIE = 'lf_profile';

/** Ancien cookie JSON non signé, effacé à chaque connexion / déconnexion. */
export const LEGACY_COOKIE = 'auth_token';

/** Durée maximale autorisée par Firebase pour un cookie de session : 14 jours. */
export const SESSION_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

export const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  'studio-8127417460-db3b2';
