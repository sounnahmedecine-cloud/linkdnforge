'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isSignUp })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur d\'authentification');
      }

      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch('/api/auth/google', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('Erreur Google');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">in</span>
            <span className="text-2xl font-bold">LinkedInForge</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            {isSignUp ? 'Créer un compte' : 'Se connecter'}
          </h1>
          <p className="text-slate-400">
            {isSignUp ? 'Rejoignez LinkedInForge' : 'Accédez à votre compte'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Min. 8 caractères' : ''}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition text-base"
            >
              {isLoading ? '⏳ Traitement...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400">Ou</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleAuth}
            className="w-full border-2 border-slate-700 hover:border-slate-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            🔵 Google
          </button>

          {/* Toggle */}
          <div className="text-center text-sm text-slate-400">
            {isSignUp ? (
              <>
                Vous avez un compte?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 transition"
                >
                  Se connecter
                </button>
              </>
            ) : (
              <>
                Pas encore de compte?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 transition"
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          En continuant, vous acceptez nos{' '}
          <a href="#" className="hover:text-white transition">
            Conditions d'utilisation
          </a>
        </p>
      </div>
    </div>
  );
}
