'use client';

import { Film, Globe2, Sparkles, ArrowRight, Zap, CheckCircle2, Circle, Calendar, User, Share2, TrendingUp } from 'lucide-react';
import { StudioTab, RecentPost, GhostwriterProfile, SocialConnections, ScheduledPost } from '@/lib/studio/types';
import RecentPostsList from './RecentPostsList';

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
      desc: 'Depuis une vidéo, un lien de site ou une simple idée',
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
      desc: 'LinkedIn, X, Facebook pour diffuser en 1 clic',
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
  const weeklyGoalProgress = Math.min(100, Math.round((postsThisWeek / weeklyGoal) * 100));

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* 1. Header with Atelier Positioning */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full inline-block">
            ✨ Atelier de création & Ghostwriting
          </span>
          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guide de démarrage</span>
            </button>
          )}
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Vous apportez la matière. LinkedInForge forge vos publications.
        </h1>
        <p className="text-slate-500 text-sm">
          Choisissez votre matière première pour forger votre prochain post LinkedIn dans votre style.
        </p>
      </div>

      {/* 2. Three Main Entry Doors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Door 1: Video */}
        <div
          onClick={() => onSelectTab('video')}
          className="group relative bg-white hover:bg-orange-50/20 border border-slate-200 hover:border-orange-500 rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-orange-100 group-hover:bg-orange-500 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                🎥 Vidéo → Contenu
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Importez une vidéo (TikTok, Reels, Démo) pour extraire les moments clés et rédiger le post parfait.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
            <span>Créer depuis une vidéo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Door 2: URL */}
        <div
          onClick={() => onSelectTab('url')}
          className="group relative bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-500 rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                🔗 URL → Contenu
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Collez un lien (site, article, produit) pour capturer le visuel et rédiger le post instantanément.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Transformer un lien</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Door 3: Idea */}
        <div
          onClick={() => onSelectTab('idea')}
          className="group relative bg-white hover:bg-amber-50/20 border border-slate-200 hover:border-amber-500 rounded-2xl p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 group-hover:bg-amber-500 text-amber-700 group-hover:text-white flex items-center justify-center transition-colors duration-200 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                ✍️ Une Idée → Post
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tapez votre idée brute en 2 lignes et laissez le Ghostwriter la forger selon votre style unique.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
            <span>Rédiger une idée</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Guided Activation & Weekly Retention Loop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: 4-Step Activation Checklist (60% width) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <h3 className="font-display font-bold text-base text-slate-900">
                Votre démarrage dans l'Atelier
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              {progressPercentage}% complété
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* 4 Interactive Checklist Steps */}
          <div className="space-y-2.5 pt-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  step.done
                    ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${step.done ? 'line-through text-slate-600' : 'text-slate-900'}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{step.desc}</p>
                  </div>
                </div>

                {!step.done && (
                  <button
                    type="button"
                    onClick={() => onSelectTab(step.actionTab)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white shrink-0 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Weekly Retention Goal Loop (40% width) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Boucle de régularité
              </span>
              <span className="text-[11px] font-bold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                {postsThisWeek} / {weeklyGoal} cette semaine
              </span>
            </div>

            <h3 className="font-display font-bold text-lg text-white">
              Objectif LinkedIn de la semaine
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              L'algorithme LinkedIn récompense la régularité (2 à 3 publications par semaine).
            </p>

            {/* Weekly Goal Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${weeklyGoalProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 post</span>
                <span>{postsThisWeek >= weeklyGoal ? '🎯 Objectif atteint !' : `Encore ${weeklyGoal - postsThisWeek} pour l'objectif`}</span>
                <span>3 posts</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('calendar')}
            className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Voir mon calendrier de publication →</span>
          </button>
        </div>
      </div>

      {/* 4. Mes Contenus Récents */}
      <div className="pt-2">
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
