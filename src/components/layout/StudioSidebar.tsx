'use client';

import { StudioTab } from '@/lib/studio/types';
import { LayoutDashboard, Film, Globe2, Sparkles, BookOpen, User, Crown, LogOut } from 'lucide-react';
import Logo from '@/components/ui/Logo';

interface StudioSidebarProps {
  currentTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  recentCount: number;
  isAdmin?: boolean;
  userEmail?: string;
  onLogout?: () => void;
}

export default function StudioSidebar({
  currentTab,
  onSelectTab,
  recentCount,
  isAdmin = false,
  userEmail,
  onLogout,
}: StudioSidebarProps) {
  const navItems: { id: StudioTab; label: string; icon: React.ReactNode; badge?: string }[] = [
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
    { id: 'profile', label: 'Mon Profil Ghostwriter', icon: <User className="w-4 h-4 text-indigo-500" /> },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 lg:p-6 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <Logo />
          {isAdmin && (
            <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-200">
              <Crown className="w-3 h-3 text-orange-600" />
              Admin
            </span>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-left ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
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

      {/* User footer */}
      <div className="hidden lg:block pt-6 border-t border-slate-100 space-y-3">
        {userEmail && (
          <div className="px-1">
            <span className="text-[11px] text-slate-400 block">Connecté en tant que</span>
            <p className="text-xs font-semibold text-slate-800 truncate">{userEmail}</p>
          </div>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        )}
      </div>
    </aside>
  );
}
