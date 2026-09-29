'use client';

import { StudioTab } from '@/lib/studio/types';
import {
  LayoutDashboard,
  Film,
  Globe2,
  Sparkles,
  BookOpen,
  User,
  Share2,
  Calendar,
  Crown,
  LogOut,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
} from 'lucide-react';
import Logo, { AnvilMark } from '@/components/ui/Logo';

interface StudioSidebarProps {
  currentTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  recentCount: number;
  isAdmin?: boolean;
  userEmail?: string;
  onLogout?: () => void;
  trialCount?: number;
  onOpenPaywall?: () => void;
  ghostwriterTone?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function StudioSidebar({
  currentTab,
  onSelectTab,
  recentCount,
  isAdmin = false,
  userEmail,
  onLogout,
  trialCount = 0,
  onOpenPaywall,
  ghostwriterTone = 'expert',
  isCollapsed = false,
  onToggleCollapse,
}: StudioSidebarProps) {
  const mainNavItems: { id: StudioTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'hub', label: 'Studio Accueil', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'video', label: 'Vidéo → Contenu', icon: <Film className="w-4 h-4 text-orange-500" /> },
    { id: 'url', label: 'URL → Contenu', icon: <Globe2 className="w-4 h-4 text-blue-500" /> },
    { id: 'idea', label: 'Idée Ghostwriter', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    {
      id: 'history',
      label: 'Contenus récents',
      icon: <BookOpen className="w-4 h-4 text-slate-500" />,
      badge: recentCount > 0 ? String(recentCount) : undefined,
    },
  ];

  const proNavItems: { id: StudioTab; label: string; icon: React.ReactNode; isPro?: boolean }[] = [
    {
      id: 'accounts',
      label: 'Réseaux Connectés',
      icon: <Share2 className="w-4 h-4 text-emerald-500" />,
      isPro: true,
    },
    {
      id: 'calendar',
      label: 'Calendrier & Planning',
      icon: <Calendar className="w-4 h-4 text-blue-500" />,
      isPro: true,
    },
    {
      id: 'profile',
      label: 'Mon Profil Ghostwriter',
      icon: <User className="w-4 h-4 text-indigo-500" />,
    },
  ];

  return (
    <aside
      className={`bg-white border-b lg:border-b-0 lg:border-r border-slate-200 transition-all duration-300 flex flex-col justify-between shrink-0 ${
        isCollapsed ? 'w-full lg:w-20 p-3 lg:p-4' : 'w-full lg:w-64 p-4 lg:p-6'
      }`}
    >
      <div className="space-y-6">
        {/* Brand & Collapse Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'}`}>
          {isCollapsed ? (
            <div title="LinkedInForge">
              <AnvilMark className="w-7 h-7" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Logo />
              {isAdmin && (
                <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-200">
                  <Crown className="w-3 h-3 text-orange-600" />
                  Admin
                </span>
              )}
            </div>
          )}

          {/* Toggle Collapse Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition hidden lg:flex items-center justify-center cursor-pointer"
              title={isCollapsed ? 'Agrandir le menu latéral' : 'Réduire le panneau latéral'}
              aria-label={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-orange-500" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Ghostwriter & Distribution Status Widget (Transféré depuis le bandeau noir) */}
        {!isCollapsed ? (
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Ghostwriter
              </span>
              <button
                type="button"
                onClick={() => onSelectTab('profile')}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline capitalize"
                title="Modifier mon profil Ghostwriter"
              >
                {ghostwriterTone || 'Expert'} ▾
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('accounts')}
              className="w-full flex items-center justify-between py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
              title="Gérer les connexions réseaux sociaux"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Passerelle Réseaux</span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                4 canaux
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-1 pb-1 border-y border-slate-100">
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className="p-2 rounded-xl hover:bg-orange-50 text-orange-600 transition"
              title={`Ghostwriter actif : ${ghostwriterTone || 'Expert'}`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('accounts')}
              className="p-2 rounded-xl hover:bg-slate-100 text-amber-500 transition"
              title="Passerelle 4 Réseaux Sociaux"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Studio Core Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold px-3">
              Création IA
            </span>
          )}
          <nav className={`flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none ${isCollapsed ? 'items-center' : ''}`}>
            {mainNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                  className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-left ${
                    isCollapsed
                      ? `p-3 justify-center ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`
                      : `gap-3 px-3.5 py-2.5 ${isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}`
                  }`}
                >
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  {!isCollapsed && <span className="flex-1">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pro Distribution & Settings Section */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {!isCollapsed && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold px-3">
              Distribution & Identité
            </span>
          )}
          <nav className={`flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none ${isCollapsed ? 'items-center' : ''}`}>
            {proNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                  className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-left ${
                    isCollapsed
                      ? `p-3 justify-center ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`
                      : `gap-3 px-3.5 py-2.5 ${isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}`
                  }`}
                >
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  {!isCollapsed && <span className="flex-1">{item.label}</span>}
                  {!isCollapsed && item.isPro && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 border border-orange-200">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Free trial status card for non-admin */}
        {!isAdmin && onOpenPaywall && (
          isCollapsed ? (
            <div className="hidden lg:flex flex-col items-center pt-2">
              <button
                type="button"
                onClick={onOpenPaywall}
                title={`Essai gratuit : ${Math.max(0, 5 - trialCount)} / 5 restants. Cliquez pour débloquer.`}
                className="p-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-orange-600 transition"
              >
                <Crown className="w-4 h-4 text-orange-500" />
              </button>
            </div>
          ) : (
            <div className="hidden lg:block bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  Essai gratuit
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-white text-orange-600 border border-orange-200">
                  {Math.max(0, 5 - trialCount)} / 5 offerts
                </span>
              </div>
              <div className="w-full bg-orange-200/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (trialCount / 5) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                onClick={onOpenPaywall}
                className="w-full py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-200" />
                <span>Passer en Illimité</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* User footer */}
      <div className="hidden lg:block pt-6 border-t border-slate-100 space-y-3">
        {!isCollapsed && userEmail && (
          <div className="px-1">
            <span className="text-[11px] text-slate-400 block">Connecté en tant que</span>
            <p className="text-xs font-semibold text-slate-800 truncate">{userEmail}</p>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            type="button"
            className={`w-full flex items-center rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'
            }`}
            title="Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
