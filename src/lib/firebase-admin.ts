import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: any;

try {
  const adminSdkKey = process.env.FIREBASE_ADMIN_SDK_KEY;

  if (!adminSdkKey) {
    console.warn('FIREBASE_ADMIN_SDK_KEY not configured');
  } else {
    const serviceAccount = JSON.parse(adminSdkKey);

    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      adminApp = getApps()[0];
    }
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const adminAppInstance = adminApp;

export default adminApp;
