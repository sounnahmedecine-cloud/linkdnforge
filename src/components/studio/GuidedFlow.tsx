'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Film,
  Globe2,
  Lightbulb,
  Loader2,
  Lock,
  PenLine,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import VideoDropzone from '@/components/autopilot/VideoDropzone';
import { trackDirectPublish, trackFlowStep, trackPostCopied } from '@/lib/analytics';

// ─── Types ────────────────────────────────────────────────────────────────

type SourceType = 'video' | 'url' | 'idea';

export interface FlowGenerateParams {
  sourceType: SourceType;
  videoUrl?: string;
  videoMeta?: { name: string; size: number } | null;
  targetUrl?: string;
  targetUrlContent?: string;
  postSubject?: string;
  tone?: string;
  postObjective?: string;
}

interface GuidedFlowProps {
  userEmail?: string;
  defaultTone?: string;
  initialText?: string;
  initialPost?: string;
  isGenerating: boolean;
  trialCount: number;
  isAdmin: boolean;
  onGenerate: (params: FlowGenerateParams) => Promise<{ post?: string; error?: string }>;
  onOpenAdvanced: (post?: string) => void;
}

type StepIndex = 1 | 2 | 3 | 4;

const STEPS: { index: StepIndex; label: string }[] = [
  { index: 1, label: 'Source' },
  { index: 2, label: 'Style' },
  { index: 3, label: 'Post' },
  { index: 4, label: 'Publication' },
];

const TONES = [
  { value: 'expert', label: 'Expert' },
  { value: 'pedagogique', label: 'Pédagogique' },
  { value: 'inspirant', label: 'Inspirant' },
  { value: 'direct', label: 'Direct' },
  { value: 'chaleureux', label: 'Chaleureux' },
  { value: 'humour', label: 'Avec humour' },
];

const OBJECTIVES = [
  { value: 'authority', label: 'Asseoir mon expertise' },
  { value: 'engagement', label: 'Faire réagir' },
  { value: 'leads', label: 'Attirer des clients' },
  { value: 'traffic', label: 'Envoyer vers mon site' },
];

const IDEA_STARTERS = [
  'Une erreur qui m’a appris quelque chose',
  'Mon avis à contre-courant sur mon métier',
  'Comment j’ai résolu le problème d’un client',
];

const LOADING_MESSAGES = [
  'Lecture de votre source…',
  'Recherche du meilleur angle…',
  'Rédaction de l’accroche…',
  'Mise en forme pour LinkedIn…',
];

const FREE_GENERATIONS = 5;
const LINKEDIN_MAX = 3000;
const DRAFT_KEY = 'linkdnforge_flow_draft';

// Une saisie sans espace qui ressemble à un domaine est traitée comme un lien
const URL_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;

const normalizeUrl = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

// ─── Primitives visuelles ────────────────────────────────────────────────

const btnBase =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 select-none disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4';

const btnPrimary = twMerge(
  btnBase,
  'h-12 px-6 rounded-xl text-[15px] text-white bg-orange-500 hover:bg-orange-600 active:translate-y-px',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_24px_-10px_rgba(249,115,22,0.7)]',
  'focus-visible:ring-orange-500/25 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
);

const btnSecondary = twMerge(
  btnBase,
  'h-12 px-5 rounded-xl text-[15px] text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:translate-y-px',
  'shadow-[0_1px_2px_rgba(16,24,40,0.05)] focus-visible:ring-slate-400/20 disabled:opacity-50'
);

const btnGhost = twMerge(
  btnBase,
  'h-9 px-3 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400/20'
);

function LinkedInMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="currentColor" />
      <path
        fill="#fff"
        d="M7.1 9.6h-2.4V18h2.4V9.6Zm-1.2-3.9a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM19.3 13.2c0-2.3-1.2-3.8-3.3-3.8-1.1 0-1.9.6-2.3 1.2V9.6h-2.3V18h2.4v-4.3c0-1.1.4-2 1.5-2s1.5.9 1.5 2V18h2.5v-4.8Z"
      />
    </svg>
  );
}

function Chip({
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

function StepCard({
  index,
  title,
  subtitle,
  state,
  summary,
  onEdit,
  innerRef,
  children,
}: {
  index: StepIndex;
  title: string;
  subtitle?: string;
  state: 'active' | 'done' | 'locked';
  summary?: ReactNode;
  onEdit?: () => void;
  innerRef: (el: HTMLElement | null) => void;
  children?: ReactNode;
}) {
  return (
    <section
      ref={innerRef}
      aria-current={state === 'active' ? 'step' : undefined}
      className={twMerge(
        'scroll-mt-40 rounded-2xl border bg-white transition-all duration-300',
        state === 'active' &&
          'border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-20px_rgba(16,24,40,0.18)]',
        state === 'done' && 'border-slate-200/80',
        state === 'locked' && 'border-dashed border-slate-200 bg-white/50'
      )}
    >
      <header className={twMerge('flex items-start gap-4 p-5 sm:p-7', state === 'active' && 'pb-0 sm:pb-0')}>
        <span
          className={twMerge(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
            state === 'active' && 'bg-orange-500 text-white shadow-[0_6px_16px_-6px_rgba(249,115,22,0.8)]',
            state === 'done' && 'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
            state === 'locked' && 'bg-slate-100 text-slate-400'
          )}
        >
          {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : index}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={twMerge(
              'text-[11px] font-semibold uppercase tracking-[0.12em]',
              state === 'locked' ? 'text-slate-400' : 'text-orange-600'
            )}
          >
            Étape {index}
          </p>
          <h2
            className={twMerge(
              'mt-0.5 text-lg sm:text-xl font-semibold tracking-tight',
              state === 'locked' ? 'text-slate-400' : 'text-slate-900'
            )}
          >
            {title}
          </h2>
          {state === 'active' && subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          {state === 'done' && summary && <div className="mt-1 text-sm text-slate-500 truncate">{summary}</div>}
          {state === 'locked' && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
              <Lock className="h-3.5 w-3.5" />
              Se débloque à l’étape précédente
            </p>
          )}
        </div>

        {state === 'done' && onEdit && (
          <button type="button" onClick={onEdit} className={btnGhost}>
            <PenLine className="h-4 w-4" />
            Modifier
          </button>
        )}
      </header>

      {state === 'active' && <div className="p-5 pt-6 sm:p-7 sm:pt-6">{children}</div>}
    </section>
  );
}

// ─── Parcours ────────────────────────────────────────────────────────────

export default function GuidedFlow({
  userEmail,
  defaultTone = 'expert',
  initialText = '',
  initialPost = '',
  isGenerating,
  trialCount,
  isAdmin,
  onGenerate,
  onOpenAdvanced,
}: GuidedFlowProps) {
  const [activeStep, setActiveStep] = useState<StepIndex>(initialPost ? 3 : 1);
  const [reachedStep, setReachedStep] = useState<StepIndex>(initialPost ? 3 : 1);

  // Étape 1
  const [sourceText, setSourceText] = useState(initialText);
  const [video, setVideo] = useState<{ url: string; meta: { name: string; size: number } } | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Étape 2
  const [tone, setTone] = useState(defaultTone);
  const [objective, setObjective] = useState('authority');
  const [angle, setAngle] = useState('');

  // Étape 3
  const [post, setPost] = useState(initialPost);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  // Étape 4
  const [linkedIn, setLinkedIn] = useState<{ connected: boolean; hasAppConfigured?: boolean; profile?: { name: string; picture?: string } } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stepRefs = useRef<Record<number, HTMLElement | null>>({});
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const isFirstRender = useRef(true);
  const sourceFocused = useRef(false);

  const trimmedSource = sourceText.trim();
  const isUrl = !video && URL_PATTERN.test(trimmedSource);
  const sourceType: SourceType = video ? 'video' : isUrl ? 'url' : 'idea';
  const canContinueSource = Boolean(video) || trimmedSource.length >= 3;
  const busy = isGenerating || isPreparing;
  const remaining = Math.max(0, FREE_GENERATIONS - trialCount);
  const authorName = linkedIn?.profile?.name || (userEmail ? userEmail.split('@')[0] : 'Vous');

  // Retour de la connexion LinkedIn : on reprend le brouillon à l'étape de publication
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as { post: string; sourceText?: string };
        localStorage.removeItem(DRAFT_KEY);
        if (draft.post) {
          setPost(draft.post);
          setSourceText(draft.sourceText || '');
          setReachedStep(4);
          setActiveStep(4);
        }
      }
    } catch {
      // brouillon illisible : on repart de zéro
    }
  }, []);

  // Brouillon arrivé après coup (générateur de la page d'accueil, extension) : on ouvre l'étape 3
  useEffect(() => {
    if (!initialPost) return;
    setPost(initialPost);
    setReachedStep((prev) => (prev < 3 ? 3 : prev));
    setActiveStep(3);
  }, [initialPost]);

  useEffect(() => {
    if (initialText) setSourceText(initialText);
  }, [initialText]);

  // Défilement automatique vers l'étape qui s'ouvre
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (activeStep === 1) return;
    }
    const el = stepRefs.current[activeStep];
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [activeStep]);

  // Messages de chargement qui tournent pendant la rédaction
  useEffect(() => {
    if (!busy) return;
    setLoadingIndex(0);
    const id = setInterval(() => setLoadingIndex((i) => (i + 1) % LOADING_MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, [busy]);

  // Statut LinkedIn chargé dès qu'on approche de la publication
  useEffect(() => {
    if (reachedStep < 3 || linkedIn) return;
    fetch('/api/auth/linkedin/status')
      .then((res) => res.json())
      .then(setLinkedIn)
      .catch(() => setLinkedIn({ connected: false }));
  }, [reachedStep, linkedIn]);

  // Hauteur de l'éditeur ajustée au contenu
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [post, activeStep]);

  const goTo = (step: StepIndex) => {
    setActiveStep(step);
    setReachedStep((prev) => (step > prev ? step : prev));
  };

  const handleSourceContinue = () => {
    if (!canContinueSource) return;
    if (isUrl && !trimmedSource.startsWith('http')) setSourceText(normalizeUrl(trimmedSource));
    // L'objectif par défaut suit la nature de la source
    setObjective(sourceType === 'idea' ? 'authority' : 'leads');
    trackFlowStep(1, 'source', { source_type: sourceType });
    goTo(2);
  };

  const handleGenerate = async () => {
    setError(null);
    goTo(3);

    const params: FlowGenerateParams = {
      sourceType,
      tone,
      postObjective: objective,
      postSubject: angle.trim() || undefined,
    };

    if (sourceType === 'video' && video) {
      params.videoUrl = video.url;
      params.videoMeta = video.meta;
      if (URL_PATTERN.test(trimmedSource)) params.targetUrl = normalizeUrl(trimmedSource);
      else if (trimmedSource) params.postSubject = [trimmedSource, angle.trim()].filter(Boolean).join('\n');
    } else if (sourceType === 'url') {
      const url = normalizeUrl(trimmedSource);
      params.targetUrl = url;
      setIsPreparing(true);
      try {
        const res = await fetch('/api/scrape-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data) params.targetUrlContent = data.data;
        }
      } catch {
        // la page sera relue côté serveur
      } finally {
        setIsPreparing(false);
      }
    } else {
      params.postSubject = [trimmedSource, angle.trim()].filter(Boolean).join('\n\nAngle souhaité : ');
    }

    trackFlowStep(2, 'style', { source_type: sourceType, tone, objective });
    const result = await onGenerate(params);

    if (result.post) {
      setPost(result.post);
    } else {
      setError(result.error || 'La génération n’a pas abouti. Réessayez dans un instant.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      trackPostCopied('linkedin', post.length);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // presse-papier refusé par le navigateur
    }
  };

  const handlePostReady = () => {
    trackFlowStep(3, 'post', { post_length: post.length });
    goTo(4);
  };

  const handleConnectLinkedIn = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ post, sourceText }));
    } catch {
      // stockage indisponible : le brouillon sera perdu après la connexion
    }
    window.location.href = '/api/auth/linkedin';
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      const res = await fetch('/api/publish/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post,
          targetUrl: URL_PATTERN.test(trimmedSource) ? normalizeUrl(trimmedSource) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'La publication a échoué.');
      setPublishedUrl(data.feedUrl || 'https://www.linkedin.com/feed/');
      trackDirectPublish('linkedin', true, post.length);
      trackFlowStep(4, 'published', { method: 'direct' });
    } catch (e: any) {
      trackDirectPublish('linkedin', false, post.length);
      setError(e.message || 'La publication a échoué.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyAndOpen = async () => {
    await handleCopy();
    trackFlowStep(4, 'published', { method: 'copy_open' });
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
  };

  const handleRestart = () => {
    setSourceText('');
    setVideo(null);
    setShowVideo(false);
    setAngle('');
    setPost('');
    setError(null);
    setPublishedUrl(null);
    setReachedStep(1);
    setActiveStep(1);
  };

  const stateOf = (step: StepIndex): 'active' | 'done' | 'locked' =>
    step === activeStep ? 'active' : step <= reachedStep ? 'done' : 'locked';

  const sourceSummary = useMemo(() => {
    if (video) return `Vidéo · ${video.meta.name}`;
    if (!trimmedSource) return '';
    return isUrl ? `Lien · ${trimmedSource.replace(/^https?:\/\//, '')}` : `Idée · ${trimmedSource}`;
  }, [video, trimmedSource, isUrl]);

  const SourceIcon = video ? Film : isUrl ? Globe2 : Lightbulb;

  return (
    <div className="mx-auto w-full max-w-3xl pb-24">
      {/* Progression */}
      <nav
        aria-label="Progression"
        className="sticky top-[72px] z-20 mb-6 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-md shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      >
        <ol className="flex items-center gap-2 sm:gap-3">
          {STEPS.map((s, i) => {
            const state = stateOf(s.index);
            const clickable = s.index <= reachedStep && !busy;
            return (
              <li key={s.index} className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && setActiveStep(s.index)}
                  className="flex items-center gap-2 min-w-0 disabled:cursor-default"
                >
                  <span
                    className={twMerge(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                      state === 'active' && 'bg-orange-500 text-white',
                      state === 'done' && 'bg-orange-100 text-orange-600',
                      state === 'locked' && 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.index}
                  </span>
                  <span
                    className={twMerge(
                      'hidden sm:block truncate text-sm font-medium',
                      state === 'locked' ? 'text-slate-400' : 'text-slate-800'
                    )}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className="h-0.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <span
                      className={twMerge(
                        'block h-full rounded-full bg-orange-500 transition-all duration-500',
                        reachedStep > s.index ? 'w-full' : 'w-0'
                      )}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="space-y-4">
        {/* ── Étape 1 · Source ── */}
        <StepCard
          index={1}
          title="Partez de ce que vous avez"
          subtitle="Collez un lien, écrivez une idée en quelques mots, ou importez une vidéo."
          state={stateOf(1)}
          summary={sourceSummary}
          onEdit={busy ? undefined : () => setActiveStep(1)}
          innerRef={(el) => (stepRefs.current[1] = el)}
        >
          <div className="space-y-4">
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/60 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10">
              <textarea
                ref={(el) => {
                  // Focus sans faire défiler la page (autoFocus la ferait sauter au chargement)
                  if (el && !sourceFocused.current) {
                    sourceFocused.current = true;
                    el.focus({ preventScroll: true });
                  }
                }}
                rows={4}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSourceContinue();
                }}
                placeholder={
                  video
                    ? 'Ajoutez un lien ou un contexte pour la vidéo (facultatif)'
                    : 'https://votre-article.com  —  ou  —  « La semaine dernière, un client m’a dit… »'
                }
                className="block w-full resize-none bg-transparent px-5 pt-4 pb-12 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                {trimmedSource || video ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    <SourceIcon className="h-3.5 w-3.5 text-orange-500" />
                    {video ? 'Vidéo' : isUrl ? 'Lien détecté' : 'Idée'}
                  </span>
                ) : (
                  <span />
                )}
                <span className="hidden sm:block text-xs text-slate-400">Ctrl + Entrée pour continuer</span>
              </div>
            </div>

            {!trimmedSource && !video && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Pour démarrer :</span>
                {IDEA_STARTERS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setSourceText(`${idea} : `)}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition hover:text-orange-700 hover:ring-orange-300"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            )}

            {showVideo || video ? (
              <div className="relative">
                {!video && (
                  <button
                    type="button"
                    onClick={() => setShowVideo(false)}
                    aria-label="Fermer l’import vidéo"
                    className="absolute -top-2 -right-2 z-10 rounded-full bg-white p-1 text-slate-400 ring-1 ring-slate-200 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <VideoDropzone
                  onVideoUploaded={(url, meta) => setVideo({ url, meta: { name: meta.name, size: meta.size } })}
                  onVideoRemoved={() => setVideo(null)}
                />
              </div>
            ) : (
              <button type="button" onClick={() => setShowVideo(true)} className={twMerge(btnGhost, '-ml-3')}>
                <Film className="h-4 w-4 text-orange-500" />
                Importer une vidéo à la place
              </button>
            )}

            <div className="flex justify-end pt-2">
              <button type="button" onClick={handleSourceContinue} disabled={!canContinueSource} className={btnPrimary}>
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </StepCard>

        {/* ── Étape 2 · Style ── */}
        <StepCard
          index={2}
          title="Choisissez le ton"
          subtitle="Nos réglages par défaut conviennent à la plupart des posts. Ajustez si besoin."
          state={stateOf(2)}
          summary={`${TONES.find((t) => t.value === tone)?.label || 'Expert'} · ${
            OBJECTIVES.find((o) => o.value === objective)?.label || ''
          }`}
          onEdit={busy ? undefined : () => setActiveStep(2)}
          innerRef={(el) => (stepRefs.current[2] = el)}
        >
          <div className="space-y-6">
            <fieldset>
              <legend className="mb-2.5 text-sm font-medium text-slate-700">Ton</legend>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <Chip key={t.value} selected={tone === t.value} onClick={() => setTone(t.value)}>
                    {t.label}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2.5 text-sm font-medium text-slate-700">Objectif du post</legend>
              <div className="flex flex-wrap gap-2">
                {OBJECTIVES.map((o) => (
                  <Chip key={o.value} selected={objective === o.value} onClick={() => setObjective(o.value)}>
                    {o.label}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="flow-angle" className="mb-2 block text-sm font-medium text-slate-700">
                Angle précis <span className="font-normal text-slate-400">(facultatif)</span>
              </label>
              <input
                id="flow-angle"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="Ex. : insister sur le gain de temps, mentionner notre offre de lancement…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              {!isAdmin ? (
                <p className="text-center text-xs text-slate-500 sm:text-left">
                  {remaining > 0
                    ? `${remaining} génération${remaining > 1 ? 's' : ''} gratuite${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`
                    : 'Générations gratuites épuisées'}
                </p>
              ) : (
                <span />
              )}
              <button type="button" onClick={handleGenerate} disabled={busy} className={btnPrimary}>
                <Sparkles className="h-4 w-4" />
                Générer mon post
              </button>
            </div>
          </div>
        </StepCard>

        {/* ── Étape 3 · Post ── */}
        <StepCard
          index={3}
          title="Relisez et ajustez"
          subtitle="Le texte est modifiable directement. Cliquez dedans pour le retoucher."
          state={stateOf(3)}
          summary={post ? `${post.split('\n')[0].slice(0, 90)}` : undefined}
          onEdit={busy ? undefined : () => setActiveStep(3)}
          innerRef={(el) => (stepRefs.current[3] = el)}
        >
          {busy ? (
            <div className="rounded-2xl border border-slate-200 p-5" aria-live="polite">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
              <div className="space-y-2.5">
                {[92, 100, 85, 96, 60].map((w, i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-slate-100" style={{ width: `${w}%` }} />
                ))}
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm font-medium text-orange-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {LOADING_MESSAGES[loadingIndex]}
              </p>
            </div>
          ) : error && !post ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={handleGenerate} className={btnSecondary}>
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </button>
                <button type="button" onClick={() => setActiveStep(1)} className={btnGhost}>
                  Modifier la source
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 px-5 pt-5">
                  {linkedIn?.profile?.picture ? (
                    <img src={linkedIn.profile.picture} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold uppercase text-white">
                      {authorName.charAt(0)}
                    </span>
                  )}
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-slate-900">{authorName}</p>
                    <p className="text-xs text-slate-400">Aperçu LinkedIn · Maintenant</p>
                  </div>
                </div>
                <textarea
                  ref={editorRef}
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  aria-label="Texte du post"
                  className="block w-full resize-none overflow-hidden bg-transparent px-5 py-4 text-[15px] leading-relaxed text-slate-800 focus:outline-none"
                />
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2.5">
                  <span className={twMerge('text-xs tabular-nums', post.length > LINKEDIN_MAX ? 'text-red-600' : 'text-slate-400')}>
                    {post.length.toLocaleString('fr-FR')} / {LINKEDIN_MAX.toLocaleString('fr-FR')} caractères
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={handleCopy} className={btnGhost}>
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copié' : 'Copier'}
                    </button>
                    <button type="button" onClick={handleGenerate} className={btnGhost}>
                      <RefreshCw className="h-4 w-4" />
                      Régénérer
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handlePostReady}
                  disabled={!post.trim() || post.length > LINKEDIN_MAX}
                  className={btnPrimary}
                >
                  Passer à la publication
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </StepCard>

        {/* ── Étape 4 · Publication ── */}
        <StepCard
          index={4}
          title={publishedUrl ? 'C’est en ligne' : 'Publiez'}
          subtitle={publishedUrl ? undefined : 'En un clic sur LinkedIn, ou copiez le texte pour le coller vous-même.'}
          state={stateOf(4)}
          summary={publishedUrl ? 'Publié sur LinkedIn' : 'Prêt à publier'}
          onEdit={busy ? undefined : () => setActiveStep(4)}
          innerRef={(el) => (stepRefs.current[4] = el)}
        >
          {publishedUrl ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
                <Check className="h-7 w-7 text-emerald-600" strokeWidth={3} />
              </span>
              <p className="mt-5 text-lg font-semibold text-slate-900">Votre post est publié sur LinkedIn</p>
              <p className="mt-1 text-sm text-slate-500">Revenez dans une heure pour répondre aux premiers commentaires.</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                  Voir sur LinkedIn
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button type="button" onClick={handleRestart} className={btnPrimary}>
                  <Sparkles className="h-4 w-4" />
                  Créer un nouveau post
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start gap-4">
                  <LinkedInMark className="h-10 w-10 shrink-0 text-[#0A66C2]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">Publier sur LinkedIn</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {linkedIn?.connected
                        ? `Connecté en tant que ${linkedIn.profile?.name || 'votre profil'}`
                        : 'Connectez votre compte une fois, publiez ensuite en un clic.'}
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  {linkedIn === null ? (
                    <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
                  ) : linkedIn.connected ? (
                    <button type="button" onClick={handlePublish} disabled={isPublishing} className={twMerge(btnPrimary, 'w-full')}>
                      {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isPublishing ? 'Publication en cours…' : 'Publier maintenant'}
                      {!isPublishing && <ArrowRight className="h-4 w-4" />}
                    </button>
                  ) : linkedIn.hasAppConfigured !== false ? (
                    <button type="button" onClick={handleConnectLinkedIn} className={twMerge(btnPrimary, 'w-full')}>
                      Connecter LinkedIn et publier
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              </div>

              <button type="button" onClick={handleCopyAndOpen} className={twMerge(btnSecondary, 'w-full')}>
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Texte copié — collez-le dans LinkedIn' : 'Copier le texte et ouvrir LinkedIn'}
              </button>

              <div className="flex flex-col items-center gap-1 pt-3 sm:flex-row sm:justify-between">
                <button type="button" onClick={() => onOpenAdvanced(post)} className={btnGhost}>
                  Facebook, X, Reddit et options avancées
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={handleRestart} className={btnGhost}>
                  Recommencer
                </button>
              </div>
            </div>
          )}
        </StepCard>
      </div>
    </div>
  );
}
