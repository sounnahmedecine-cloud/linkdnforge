'use client';

import { useState } from 'react';
import { GhostwriterProfile } from '@/lib/studio/types';
import { saveGhostwriterProfile } from '@/lib/studio/storage';
import { ArrowLeft, Save, Sparkles, Check, CheckCircle2, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { trackGhostwriterConfigured } from '@/lib/analytics';

interface GhostwriterProfileViewProps {
  profile: GhostwriterProfile;
  onUpdateProfile: (updated: GhostwriterProfile) => void;
  onBack: () => void;
}

export default function GhostwriterProfileView({
  profile,
  onUpdateProfile,
  onBack,
}: GhostwriterProfileViewProps) {
  const [formData, setFormData] = useState<GhostwriterProfile>(profile);
  const [scraping, setScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeUrl = (rawUrl: string): string => {
    let trimmed = rawUrl.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  const scrapeProfile = async () => {
    const cleanUrl = normalizeUrl(formData.linkedinUrl);
    if (!cleanUrl) return;
    if (cleanUrl !== formData.linkedinUrl) {
      setFormData((prev) => ({ ...prev, linkedinUrl: cleanUrl }));
    }
    setScraping(true);
    setScrapeStatus('');
    try {
      const res = await fetch('/api/scrape-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      if (data.data) {
        setFormData((prev) => ({ ...prev, linkedinProfile: data.data }));
        setScrapeStatus('✓ Profil extrait et synchronisé avec succès !');
      } else {
        setScrapeStatus('Profil privé — collez vos informations manuellement');
      }
    } catch {
      setScrapeStatus('Erreur de connexion. Vous pouvez coller le texte directement ci-dessous.');
    } finally {
      setScraping(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = normalizeUrl(formData.linkedinUrl);
    const updated = { ...formData, linkedinUrl: cleanUrl };
    saveGhostwriterProfile(updated);
    onUpdateProfile(updated);
    trackGhostwriterConfigured({
      tone: updated.tone || 'expert',
      hasLinkedin: Boolean(updated.linkedinUrl || updated.linkedinProfile),
      hasExamples: Boolean(updated.personalExamples),
      editorialStyle: updated.editorialStyle || 'auto',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Studio
        </button>
        <span className="text-xs bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Identité Ghostwriter
        </span>
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1.5 flex items-center gap-2">
          <span>⚙️</span> Votre Profil Ghostwriter
        </h2>
        <p className="text-sm text-slate-500">
          Configurez votre voix une seule fois. LinkedInForge mémorise votre personnalité, vos expressions et votre expertise pour les appliquer automatiquement à chaque contenu.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Ton de prédilection */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            1. Votre voix et tonalité par défaut
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: 'expert', label: '🎯 Expert', desc: 'Autoritaire et basé sur la preuve' },
              { value: 'pedagogique', label: '📚 Pédagogique', desc: 'Clair, simple et accessible' },
              { value: 'inspirant', label: '✨ Inspirant', desc: 'Visionnaire et motivant' },
              { value: 'chaleureux', label: '🤝 Chaleureux', desc: 'Humain et accessible' },
              { value: 'direct', label: '⚡ Direct', desc: 'Sans détour, percutant' },
              { value: 'premium', label: '💎 Premium', desc: 'Raffiné et soigné' },
              { value: 'humour', label: '😄 Humour', desc: 'Léger avec auto-dérision' },
              { value: 'professionnel', label: '👔 Pro', desc: 'Corporate et sérieux' },
            ].map((tItem) => (
              <button
                key={tItem.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, tone: tItem.value }))}
                className={`p-3 rounded-xl border text-left transition ${
                  formData.tone === tItem.value
                    ? 'bg-orange-50 border-orange-500 text-orange-900 ring-2 ring-orange-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{tItem.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{tItem.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* LinkedIn Connection */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <label className="block text-sm font-bold text-slate-800">
            2. Votre Profil LinkedIn (URL publique)
          </label>
          <p className="text-xs text-slate-500">
            Permet à l'IA d'analyser vos postes passés, votre secteur et votre bio professionnelle.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              inputMode="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              onBlur={() => {
                const normalized = normalizeUrl(formData.linkedinUrl);
                if (normalized && normalized !== formData.linkedinUrl) {
                  setFormData((prev) => ({ ...prev, linkedinUrl: normalized }));
                }
              }}
              placeholder="ex: linkedin.com/in/votre-nom"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={scrapeProfile}
              disabled={scraping || !formData.linkedinUrl}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Synchroniser
            </button>
          </div>

          {scrapeStatus && (
            <p className={`text-xs font-semibold ${scrapeStatus.startsWith('✓') ? 'text-emerald-600' : 'text-slate-600'}`}>
              {scrapeStatus}
            </p>
          )}

          {formData.linkedinProfile && (
            <div className="mt-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Contexte extrait de votre bio :
              </label>
              <textarea
                name="linkedinProfile"
                rows={3}
                value={formData.linkedinProfile}
                onChange={handleInputChange}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-700 resize-none font-mono"
              />
            </div>
          )}
        </div>

        {/* Personal writing examples */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800">
            3. Vos exemples de posts préférés ou expressions fétiches
          </label>
          <p className="text-xs text-slate-500">
            Collez 1 ou 2 posts LinkedIn que vous avez écrits et que vous adorez. L'IA reproduira votre rythme de phrase.
          </p>
          <textarea
            name="personalExamples"
            rows={4}
            value={formData.personalExamples}
            onChange={handleInputChange}
            placeholder="Collez ici vos meilleurs posts ou vos tournures de phrases habituelles..."
            className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Button
            type="submit"
            size="lg"
            className="py-3 px-6 text-sm font-bold bg-slate-900 hover:bg-black text-white rounded-xl flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Enregistrer mon profil Ghostwriter
          </Button>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Profil mis à jour avec succès !
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
