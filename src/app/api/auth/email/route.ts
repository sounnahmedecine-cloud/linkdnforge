import { NextRequest, NextResponse } from 'next/server';
import adminsConfig from '@/config/admins.json';

export async function POST(request: NextRequest) {
  try {
    const { email, password, isSignUp } = await request.json();

    const cleanEmail = typeof email === 'string' ? email.trim() : '';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Adresse email valide requise' },
        { status: 400 }
      );
    }

    if (password && isSignUp && password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit avoir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const adminData = adminsConfig.admins.find(
      (admin: any) => admin.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    let firebaseUid = `user_${Date.now()}`;

    // 1. Create or fetch user in Firebase Authentication & Firestore
    try {
      const { adminAuth, adminDb } = await import('@/lib/firebase-admin');
      
      // Firebase Authentication creation
      if (adminAuth) {
        try {
          const existingUser = await adminAuth.getUserByEmail(cleanEmail.toLowerCase());
          firebaseUid = existingUser.uid;
        } catch (notFoundError) {
          const newUser = await adminAuth.createUser({
            email: cleanEmail.toLowerCase(),
            emailVerified: false,
            password: password || 'GuestAutoUser123!',
            displayName: cleanEmail.split('@')[0],
          });
          firebaseUid = newUser.uid;
          console.log(`[Firebase Auth] Utilisateur créé avec succès: ${cleanEmail} (${newUser.uid})`);
        }
      }

      // Firestore Database profile persistence
      if (adminDb) {
        const userRef = adminDb.collection('users').doc(cleanEmail.toLowerCase());
        const existing = await userRef.get();
        if (!existing.exists) {
          await userRef.set({
            uid: firebaseUid,
            email: cleanEmail,
            role: adminData ? 'admin' : 'user',
            plan: 'free',
            createdAt: new Date(),
            lastLogin: new Date(),
          });
        } else {
          await userRef.update({
            uid: firebaseUid,
            lastLogin: new Date(),
          });
        }
      }
    } catch (fbErr) {
      console.warn('Firebase user sync non bloquant:', fbErr);
    }

    const mockUser = {
      uid: firebaseUid,
      email: cleanEmail,
      role: adminData ? 'admin' : 'user',
      unlimited: adminData?.unlimited || false,
      createdAt: new Date().toISOString()
    };

    // Set auth cookie
    const response = NextResponse.json({
      message: isSignUp ? 'Compte créé avec succès' : 'Connecté',
      user: mockUser
    });

    response.cookies.set('auth_token', JSON.stringify(mockUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Erreur d\'authentification' },
      { status: 500 }
    );
  }
}

