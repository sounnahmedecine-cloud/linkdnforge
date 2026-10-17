import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

// Styles et réglages partagés par le parcours guidé du studio et celui de la page d'accueil

const btnBase =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 select-none disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4';

export const btnPrimary = twMerge(
  btnBase,
  'h-12 px-6 rounded-xl text-[15px] text-white bg-orange-500 hover:bg-orange-600 active:translate-y-px',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_24px_-10px_rgba(249,115,22,0.7)]',
  'focus-visible:ring-orange-500/25 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
);

export const btnSecondary = twMerge(
  btnBase,
  'h-12 px-5 rounded-xl text-[15px] text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:translate-y-px',
  'shadow-[0_1px_2px_rgba(16,24,40,0.05)] focus-visible:ring-slate-400/20 disabled:opacity-50'
);

export const btnGhost = twMerge(
  btnBase,
  'h-9 px-3 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400/20'
);

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={twMerge(
        'h-9 px-3.5 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/20',
        selected
          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      {children}
    </button>
  );
}

export const TONES = [
  { value: 'expert', label: 'Expert' },
  { value: 'pedagogique', label: 'Pédagogique' },
  { value: 'inspirant', label: 'Inspirant' },
  { value: 'direct', label: 'Direct' },
  { value: 'chaleureux', label: 'Chaleureux' },
  { value: 'humour', label: 'Avec humour' },
];

export const OBJECTIVES = [
  { value: 'authority', label: 'Asseoir mon expertise' },
  { value: 'engagement', label: 'Faire réagir' },
  { value: 'leads', label: 'Attirer des clients' },
  { value: 'traffic', label: 'Envoyer vers mon site' },
];

export const IDEA_STARTERS = [
  'Une erreur qui m’a appris quelque chose',
  'Mon avis à contre-courant sur mon métier',
  'Comment j’ai résolu le problème d’un client',
];

// Une saisie sans espace qui ressemble à un domaine est traitée comme un lien
export const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;

export const normalizeUrl = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

// Saisie faite sur la page d'accueil avant l'inscription, reprise et générée par le studio
export const FLOW_AUTOSTART_KEY = 'linkdnforge_flow_autostart';

export interface FlowAutostart {
  sourceText: string;
  tone: string;
  objective: string;
}
