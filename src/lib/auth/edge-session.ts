import { importX509, jwtVerify, decodeProtectedHeader, type KeyLike } from 'jose';
import { FIREBASE_PROJECT_ID, SESSION_COOKIE } from './constants';

/**
 * Vérification du cookie de session Firebase dans le runtime Edge (middleware),
 * où firebase-admin n'est pas disponible. Le cookie est un JWT RS256 signé par
 * Google : on vérifie signature, émetteur, audience et expiration avec les
 * certificats publics de Google. Cette vérification sert au routage ; les routes
 * API et pages serveur revérifient avec firebase-admin (verifySessionCookie).
 */

const CERTS_URL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys';
const ISSUER = `https://session.firebase.google.com/${FIREBASE_PROJECT_ID}`;

let cachedKeys: Map<string, KeyLike> | null = null;
let cachedUntil = 0;

async function getPublicKeys(): Promise<Map<string, KeyLike>> {
  if (cachedKeys && Date.now() < cachedUntil) return cachedKeys;

  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`Certificats Firebase indisponibles (${res.status})`);
  const certs = (await res.json()) as Record<string, string>;

  const keys = new Map<string, KeyLike>();
  for (const [kid, pem] of Object.entries(certs)) {
    keys.set(kid, await importX509(pem, 'RS256'));
  }

  const maxAge = Number(res.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 3600);
  cachedKeys = keys;
  cachedUntil = Date.now() + maxAge * 1000;
  return keys;
}

export async function hasValidEdgeSession(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  try {
    const { kid, alg } = decodeProtectedHeader(cookieValue);
    if (alg !== 'RS256' || !kid) return false;
    const key = (await getPublicKeys()).get(kid);
    if (!key) return false;
    const { payload } = await jwtVerify(cookieValue, key, {
      algorithms: ['RS256'],
      issuer: ISSUER,
      audience: FIREBASE_PROJECT_ID,
    });
    return typeof payload.sub === 'string' && payload.sub.length > 0;
  } catch {
    return false;
  }
}

export { SESSION_COOKIE };
