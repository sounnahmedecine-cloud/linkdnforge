import { NextRequest, NextResponse } from 'next/server';
import adminsConfig from '@/config/admins.json';

/**
 * Connexion Google : le client s'authentifie via Firebase Auth (popup Google),
 * puis envoie son ID token ici. On le vérifie avec l'Admin SDK, on enregistre
 * l'email dans Firestore (collection users) et on pose le même cookie de session
 * que la connexion par email.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Jeton Google manquant' }, { status: 400 });
    }

    const { adminAuth, adminDb } = await import('@/lib/firebase-admin');

    if (!adminAuth) {
      console.error('[Google Auth] FIREBASE_ADMIN_SDK_KEY non configurée : impossible de vérifier le jeton');
      return NextResponse.json({ error: 'Connexion Google indisponible' }, { status: 503 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch (verifyErr) {
      console.warn('[Google Auth] Jeton invalide:', verifyErr);
      return NextResponse.json({ error: 'Jeton Google invalide' }, { status: 401 });
    }

    const email = decoded.email?.trim();
    if (!email) {
      return NextResponse.json({ error: 'Aucun email associé à ce compte Google' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase();
    const adminData = adminsConfig.admins.find(
      (admin: any) => admin.email.toLowerCase() === cleanEmail
    );

    let isNewUser = false;

    // Profil Firestore (même clé que la connexion email : l'email en minuscules)
    if (adminDb) {
      try {
        const userRef = adminDb.collection('users').doc(cleanEmail);
        const existing = await userRef.get();
        if (!existing.exists) {
          isNewUser = true;
          await userRef.set({
            uid: decoded.uid,
            email: cleanEmail,
            displayName: decoded.name || cleanEmail.split('@')[0],
            photoURL: decoded.picture || null,
            emailVerified: Boolean(decoded.email_verified),
            provider: 'google',
            role: adminData ? 'admin' : 'user',
            plan: 'free',
            createdAt: new Date(),
            lastLogin: new Date(),
          });
        } else {
          await userRef.update({
            uid: decoded.uid,
            displayName: decoded.name || existing.get('displayName') || null,
            photoURL: decoded.picture || existing.get('photoURL') || null,
            emailVerified: Boolean(decoded.email_verified),
            lastLogin: new Date(),
          });
        }
      } catch (dbErr) {
        console.warn('Firestore user sync non bloquant:', dbErr);
      }
    }

    const sessionUser = {
      uid: decoded.uid,
      email: cleanEmail,
      role: adminData ? 'admin' : 'user',
      unlimited: adminData?.unlimited || false,
      createdAt: new Date().toISOString()
    };

    const response = NextResponse.json({
      message: isNewUser ? 'Compte créé avec succès' : 'Connecté',
      user: sessionUser,
      isNewUser,
    });

    response.cookies.set('auth_token', JSON.stringify(sessionUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Erreur d\'authentification Google' }, { status: 500 });
  }
}
