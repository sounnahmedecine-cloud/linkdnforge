'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import { Check, ArrowRight, Zap } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const tNav = useTranslations('nav');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    linkedinUrl: '',
    linkedinProfile: '',
    personalExamples: '',
  });
  const [scraping, setScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    if (authCookie) {
      try {
        setUser(JSON.parse(decodeURIComponent(authCookie.split('=')[1])));
      } catch (e) {}
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const scrapeProfile = async () => {
    if (!formData.linkedinUrl.startsWith('http')) return;
    setScraping(true);
    setScrapeStatus('');
    try {
      const res = await fetch('/api/scrape-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.linkedinUrl }),
      });
      const data = await res.json();
      if (data.data) {
        setFormData(prev => ({ ...prev, linkedinProfile: data.data }));
        setScrapeStatus('✓ Profil extrait et connecté avec succès !');
      } else {
        setScrapeStatus('Profil privé — collez le contenu manuellement');
      }
    } catch {
      setScrapeStatus('Erreur lors de la connexion. Collez le contenu manuellement.');
    } finally {
      setScraping(false);
    }
  };

  const handleSaveAndContinue = () => {
    // Dans le futur : on sauvegarde `formData` dans Firestore associé à `user.email`.
    // Pour l'instant, on stocke en local et on redirige vers le dashboard.
    localStorage.setItem('user_setup_profile', JSON.stringify(formData));
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header variant="app" user={user} onLogout={handleLogout} logoutLabel={tNav('logout')} />
      
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-10 space-y-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <h1 className="font-display font-black text-4xl text-black">Bienvenue dans l'espace Pro !</h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Avant de commencer à générer, connectons vos réseaux et apprenons à l'IA votre style d'écriture pour activer le Mode Ghostwriter.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. Connectez votre LinkedIn</h3>
              <p className="text-sm text-slate-500 mb-4">L'IA va extraire votre bio et vos expériences pour rédiger comme un expert de votre domaine.</p>
              
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.linkedin.com/in/..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Button onClick={scrapeProfile} disabled={scraping || !formData.linkedinUrl} className="bg-black hover:bg-slate-800 text-white rounded-xl whitespace-nowrap">
                  {scraping ? 'Connexion...' : 'Connecter'}
                </Button>
              </div>
              {scrapeStatus && (
                <p className={`text-sm font-medium ${scrapeStatus.includes('✓') ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {scrapeStatus}
                </p>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. Entraînez le Mode Ghostwriter</h3>
              <p className="text-sm text-slate-500 mb-4">Collez 2 ou 3 de vos meilleurs posts récents. L'IA va analyser votre ton, la longueur de vos phrases et vos emojis préférés pour cloner votre style.</p>
              
              <textarea
                name="personalExamples"
                value={formData.personalExamples}
                onChange={handleInputChange}
                placeholder="Post 1 : J'ai lancé mon SaaS sans lever de fonds... 🚀&#10;&#10;Post 2 : La vérité sur le cold outreach LinkedIn..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-none"
              />
            </div>

            <Button onClick={handleSaveAndContinue} size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-orange-500/30">
              Enregistrer et commencer <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
