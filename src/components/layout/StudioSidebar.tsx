'use client';

import { useState } from 'react';
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
import ChromeExtensionModal from '@/components/extension/ChromeExtensionModal';

interface StudioSidebarProps {
  currentTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  recentCount: number;
  isAdmin?: boolean;
  userEmail?: string;
  onLogout?: () => void;
  trialCount?: number;
  onOpenPaywall?: () => void;
  onOpenOnboarding?: () => void;
  ghostwriterTone?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
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
  onOpenOnboarding,
  ghostwriterTone = 'expert',
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: StudioSidebarProps) {
  const [showExtensionModal, setShowExtensionModal] = useState(false);

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
      icon: <Share2 className="w-4 h-4 text-purple-600" />,
      isPro: true,
    },
    {
      id: 'calendar',
      label: 'Calendrier & Planning',
      icon: <Calendar className="w-4 h-4 text-indigo-600" />,
      isPro: true,
    },
    {
      id: 'profile',
      label: 'Mon Profil Ghostwriter',
      icon: <User className="w-4 h-4 text-slate-600" />,
    },
  ];

  const handleItemClick = (tab: StudioTab) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Brand & Collapse Toggle (Desktop only) */}
        <div className={`hidden lg:flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'}`}>
          {isCollapsed ? (
            <div title="LinkedInForge">
              <AnvilMark className="w-7 h-7" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Logo />
              {isAdmin && (
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                  <Crown className="w-3 h-3 text-purple-600" />
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition flex items-center justify-center cursor-pointer"
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

        {/* Mobile Header with Close button */}
        <div className="flex lg:hidden items-center justify-between pb-3 border-b border-slate-100">
          <Logo />
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Fermer le menu"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Studio Core Section */}
        <div className="space-y-1.5">
          {(!isCollapsed || mobileOpen) && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold px-3">
              Création IA
            </span>
          )}
          <nav className="flex flex-col gap-1">
            {mainNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  title={item.label}
                  className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-left cursor-pointer ${
                    isCollapsed && !mobileOpen
                      ? `p-3 justify-center ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`
                      : `gap-3 px-3.5 py-2.5 ${isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}`
                  }`}
                >
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  {(!isCollapsed || mobileOpen) && <span className="flex-1">{item.label}</span>}
                  {(!isCollapsed || mobileOpen) && item.badge && (
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
        <div className="space-y-1.5 pt-3 border-t border-slate-100">
          {(!isCollapsed || mobileOpen) && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold px-3">
              Distribution & Identité
            </span>
          )}
          <nav className="flex flex-col gap-1">
            {proNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  title={item.label}
                  className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-left cursor-pointer ${
                    isCollapsed && !mobileOpen
                      ? `p-3 justify-center ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`
                      : `gap-3 px-3.5 py-2.5 ${isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}`
                  }`}
                >
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  {(!isCollapsed || mobileOpen) && <span className="flex-1">{item.label}</span>}
                  {(!isCollapsed || mobileOpen) && item.isPro && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}

            {onOpenOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onOpenOnboarding();
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Guide de démarrage & Onboarding"
                className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold text-orange-600 hover:bg-orange-50/80 transition-all whitespace-nowrap text-left cursor-pointer ${
                  isCollapsed && !mobileOpen
                    ? 'p-3 justify-center'
                    : 'gap-3 px-3.5 py-2.5'
                }`}
              >
                <Sparkles className="w-4 h-4 text-orange-500" />
                {(!isCollapsed || mobileOpen) && <span>Guide de démarrage</span>}
              </button>
            )}

            {/* Extension Chrome shortcut button */}
            <button
              type="button"
              onClick={() => {
                setShowExtensionModal(true);
                if (onCloseMobile) onCloseMobile();
              }}
              title="Extension Chrome Capture"
              className={`flex items-center rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all whitespace-nowrap text-left cursor-pointer ${
                isCollapsed && !mobileOpen ? 'p-3 justify-center' : 'gap-3 px-3.5 py-2.5'
              }`}
            >
              <span className="text-orange-500 font-bold">⚡</span>
              {(!isCollapsed || mobileOpen) && (
                <span className="flex-1 flex items-center justify-between">
                  <span>Extension Chrome</span>
                  <span className="text-[9px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    Gratuit
                  </span>
                </span>
              )}
            </button>
          </nav>
        </div>


        {/* Free trial status card for non-admin */}
        {!isAdmin && onOpenPaywall && (
          isCollapsed && !mobileOpen ? (
            <div className="flex flex-col items-center pt-2">
              <button
                type="button"
                onClick={onOpenPaywall}
                title={`Essai gratuit : ${Math.max(0, 5 - trialCount)} / 5 restants. Cliquez pour débloquer.`}
                className="p-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-orange-600 transition cursor-pointer"
              >
                <Crown className="w-4 h-4 text-orange-500" />
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
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

        {/* Admin Unlimited Status & Paywall Preview Trigger */}
        {isAdmin && onOpenPaywall && (
          isCollapsed && !mobileOpen ? (
            <div className="flex flex-col items-center pt-2">
              <button
                type="button"
                onClick={onOpenPaywall}
                title="Accès Admin Illimité (Cliquez pour tester le Paywall Modal)"
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-600 transition cursor-pointer"
              >
                <Crown className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          ) : (
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-purple-600" />
                  Accès Administrateur
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200/70 text-purple-800 rounded-full">
                  Illimité
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenPaywall}
                className="w-full py-1.5 px-2.5 bg-white hover:bg-purple-100 border border-purple-200 text-purple-900 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👁️ Tester le Pop-up Paywall</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* User footer */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        {(!isCollapsed || mobileOpen) && userEmail && (
          <div className="px-1">
            <span className="text-[11px] text-slate-400 block">Connecté en tant que</span>
            <p className="text-xs font-semibold text-slate-800 truncate">{userEmail}</p>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            type="button"
            className={`w-full flex items-center rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer ${
              isCollapsed && !mobileOpen ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'
            }`}
            title="Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
            {(!isCollapsed || mobileOpen) && <span>Déconnexion</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:flex bg-white border-r border-slate-200 transition-all duration-300 flex-col shrink-0 min-h-[calc(100vh-6rem)] rounded-3xl p-5 shadow-xs ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer (Slide-over overlay) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}

      <ChromeExtensionModal 
        isOpen={showExtensionModal} 
        onClose={() => setShowExtensionModal(false)} 
      />
    </>
  );
}
