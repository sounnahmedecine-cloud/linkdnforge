'use client';

import { Film, Globe2, Sparkles, ArrowRight, CheckCircle2, Circle, Calendar, TrendingUp, Clock } from 'lucide-react';
import { StudioTab, RecentPost, GhostwriterProfile, SocialConnections, ScheduledPost } from '@/lib/studio/types';
import RecentPostsList from './RecentPostsList';
import { AnvilMark } from '@/components/ui/Logo';

interface StudioHubProps {
  onSelectTab: (tab: StudioTab) => void;
  recentPosts: RecentPost[];
  onSelectPost: (post: RecentPost) => void;
  onDeletePost: (id: string) => void;
  ghostwriterProfile: GhostwriterProfile;
  socialConnections?: SocialConnections;
  scheduledPosts?: ScheduledPost[];
  onOpenOnboarding?: () => void;
}

export default function StudioHub({
  onSelectTab,
  recentPosts,
  onSelectPost,
  onDeletePost,
  ghostwriterProfile,
  socialConnections,
  scheduledPosts = [],
  onOpenOnboarding,
}: StudioHubProps) {
  const isPostForged = recentPosts.length > 0;
  const isProfileConfigured = !!ghostwriterProfile.linkedinUrl || !!ghostwriterProfile.personalExamples || (ghostwriterProfile.themes && ghostwriterProfile.themes.length > 0) || ghostwriterProfile.tone !== 'expert';
  const isSocialConfigured = !!socialConnections?.bufferToken || !!socialConnections?.linkedinProfileName || !!socialConnections?.facebookPageName || !!socialConnections?.xHandle || !!socialConnections?.redditUsername;
  const isCalendarConfigured = scheduledPosts.length > 0;

  // Calculate activation steps completed
  const steps = [
    {
      id: 'post',
      label: 'Forger votre 1er contenu IA',
      desc: 'Depuis une vidéo, un lien ou une simple idée',
      done: isPostForged,
      actionLabel: 'Forger mon post',
      actionTab: 'idea' as StudioTab,
    },
    {
      id: 'profile',
      label: 'Personnaliser votre Ghostwriter',
      desc: 'Définissez votre ton, vos exemples et votre style',
      done: isProfileConfigured,
      actionLabel: 'Configurer mon style',
      actionTab: 'profile' as StudioTab,
    },
    {
      id: 'social',
      label: 'Connecter vos comptes sociaux',
      desc: 'LinkedIn, X, Facebook pour diffuser en un clic',
      done: isSocialConfigured,
      actionLabel: 'Connecter mes comptes',
      actionTab: 'accounts' as StudioTab,
    },
    {
      id: 'calendar',
      label: 'Planifier votre première publication',
      desc: 'Structurez votre calendrier éditorial de la semaine',
      done: isCalendarConfigured,
      actionLabel: 'Ouvrir le calendrier',
      actionTab: 'calendar' as StudioTab,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);

  // Calculate posts created this week (last 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const postsThisWeek = recentPosts.filter((p) => {
    const time = p.createdAt ? new Date(p.createdAt).getTime() : 0;
    return !isNaN(time) && time >= oneWeekAgo;
  }).length;
  const weeklyGoal = 3;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Atelier Positioning */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-iron-700 bg-[#ECE7DF] border border-[#DDD5C7] px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <span className="text-ember-500 font-bold">✦</span> ATELIER DE CRÉATION & GHOSTWRITING
          </span>
          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="text-xs font-semibold text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-50 border border-stone-200/90 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Guide de démarrage</span>
            </button>
          )}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-bold text-iron-950 tracking-tight leading-snug">
          Vous apportez la matière. LinkedInForge forge vos publications.
        </h1>
        <p className="text-stone-500 text-sm">
          Choisissez votre matière première pour forger votre prochain post LinkedIn dans votre style.
        </p>
      </div>

      {/* 2. Three Main Entry Doors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Door 1: Video */}
        <div
          onClick={() => onSelectTab('video')}
          className="group bg-white hover:border-stone-400 border border-stone-200/90 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200/60 group-hover:bg-ember-50 group-hover:text-ember-600 transition-colors">
              <Film className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-iron-950 group-hover:text-ember-600 transition-colors">
              Vidéo → Contenu
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Importez une vidéo (TikTok, Reels, démo) pour extraire les moments clés et rédiger le post parfait.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-ember-600 group-hover:text-ember-500 transition-transform group-hover:translate-x-0.5">
            <span>Créer depuis une vidéo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Door 2: URL */}
        <div
          onClick={() => onSelectTab('url')}
          className="group bg-white hover:border-stone-400 border border-stone-200/90 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200/60 group-hover:bg-ember-50 group-hover:text-ember-600 transition-colors">
              <Globe2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-iron-950 group-hover:text-ember-600 transition-colors">
              URL → Contenu
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Collez un lien (site, article, produit) pour capturer le visuel et rédiger le post instantanément.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-ember-600 group-hover:text-ember-500 transition-transform group-hover:translate-x-0.5">
            <span>Transformer un lien</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Door 3: Idea */}
        <div
          onClick={() => onSelectTab('idea')}
          className="group bg-white hover:border-stone-400 border border-stone-200/90 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200/60 group-hover:bg-ember-50 group-hover:text-ember-600 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-iron-950 group-hover:text-ember-600 transition-colors">
              Une idée → Post
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tapez votre idée brute en deux lignes et laissez le Ghostwriter la forger selon votre style.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-ember-600 group-hover:text-ember-500 transition-transform group-hover:translate-x-0.5">
            <span>Rédiger une idée</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Guided Activation & Weekly Retention Loop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: 4-Step Activation Checklist (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-iron-950">
                Votre démarrage dans l'atelier
              </h3>
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                {progressPercentage}% complété
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-iron-900 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* 4 Interactive Checklist Steps */}
          <div className="space-y-2 pt-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                  step.done
                    ? 'bg-stone-50/60 border-stone-200 text-stone-600'
                    : 'bg-white border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-stone-300 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${step.done ? 'line-through text-stone-400' : 'text-iron-950'}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate">{step.desc}</p>
                  </div>
                </div>

                {!step.done && (
                  <button
                    type="button"
                    onClick={() => onSelectTab(step.actionTab)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-iron-900 hover:bg-black text-white shrink-0 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Weekly Retention Goal Loop (5 cols) */}
        <div className="lg:col-span-5 bg-iron-950 text-white border border-iron-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-ember-400 font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> BOUCLE DE RÉGULARITÉ
              </span>
              <span className="text-xs font-mono font-medium bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 text-white/90">
                {postsThisWeek} / {weeklyGoal} cette semaine
              </span>
            </div>

            <h3 className="font-bold text-lg text-white">
              Objectif LinkedIn de la semaine
            </h3>

            <p className="text-xs text-stone-300 leading-relaxed">
              L'algorithme LinkedIn récompense la régularité : deux à trois publications par semaine.
            </p>

            {/* 3-Segment Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((segmentIndex) => {
                  const isFilled = postsThisWeek >= segmentIndex;
                  return (
                    <div
                      key={segmentIndex}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isFilled ? 'bg-ember-500' : 'bg-iron-800'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                <span>0 post</span>
                <span className="text-stone-300 font-medium">
                  {postsThisWeek >= weeklyGoal ? '🎯 Objectif atteint !' : `Encore ${weeklyGoal - postsThisWeek} pour l'objectif`}
                </span>
                <span>3 posts</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('calendar')}
            className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-iron-950 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Voir mon calendrier de publication</span>
          </button>
        </div>
      </div>

      {/* 4. Mes Contenus Récents */}
      <div className="pt-2">
        <div className="mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 font-bold">
            CONTENUS RÉCENTS
          </span>
        </div>
        <RecentPostsList
          posts={recentPosts}
          onSelectPost={onSelectPost}
          onDeletePost={onDeletePost}
          onNewCreation={() => onSelectTab('video')}
        />
      </div>
    </div>
  );
}
