import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBO5VB2ImMiUPlgL1uw1QJrWhZzUaidzeQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'studio-8127417460-db3b2.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-8127417460-db3b2',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'studio-8127417460-db3b2.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '124686847779',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:124686847779:web:6ce9e932981f089c0d8696',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-9ZX02HRM95'
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics: ReturnType<typeof getAnalytics> | null = null;
let analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null;

// Exclusion du trafic interne : visiter le site avec ?lf_internal=1 marque
// ce navigateur comme interne (plus aucune donnée GA4), ?lf_internal=0 annule.
const INTERNAL_KEY = "lf_internal";

const isInternalTraffic = (): boolean => {
  try {
    const flag = new URLSearchParams(window.location.search).get(INTERNAL_KEY);
    if (flag === "1") localStorage.setItem(INTERNAL_KEY, "1");
    if (flag === "0") localStorage.removeItem(INTERNAL_KEY);
    return localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
};

export const getAnalyticsSafe = async (): Promise<ReturnType<typeof getAnalytics> | null> => {
  if (typeof window === "undefined") return null;
  if (analytics) return analytics;
  if (isInternalTraffic()) return null;
  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        return analytics;
      }
      return null;
    }).catch(() => null);
  }
  return analyticsPromise;
};

// Pas d'initialisation anticipée : getAnalytics() envoie automatiquement
// page_view / session_start / first_visit dès son appel, bots compris.
// L'init est déclenchée par <FirebaseAnalytics /> une fois le visiteur
// vérifié comme humain (ou par trackEvent, qui a son propre filtre anti-bot).

// Helper for guest login
export const loginAsGuest = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

export { app, auth, db, storage, analytics };

