import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: any;

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  'studio-8127417460-db3b2';

if (getApps().length > 0) {
  adminApp = getApps()[0];
} else {
  const adminSdkKey = process.env.FIREBASE_ADMIN_SDK_KEY;

  if (adminSdkKey) {
    try {
      adminApp = initializeApp({
        credential: cert(JSON.parse(adminSdkKey)),
        projectId,
      });
    } catch (error) {
      console.error('FIREBASE_ADMIN_SDK_KEY invalide, bascule sur les identifiants par défaut:', error);
    }
  } else {
    console.warn('FIREBASE_ADMIN_SDK_KEY non configurée, utilisation des identifiants par défaut (ADC)');
  }

  // Sur Firebase App Hosting (Cloud Run), le compte de service du backend fournit
  // les identifiants par défaut : l'Admin SDK fonctionne sans clé JSON.
  if (!adminApp) {
    try {
      adminApp = initializeApp({ projectId });
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  }
}

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const adminAppInstance = adminApp;

export default adminApp;

