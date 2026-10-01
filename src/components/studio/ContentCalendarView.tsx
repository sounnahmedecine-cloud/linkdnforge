'use client';

import { useState } from 'react';
import { ScheduledPost, RecentPost } from '@/lib/studio/types';
import { saveScheduledPost, deleteScheduledPost } from '@/lib/studio/storage';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  Globe2,
  Film,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { trackCalendarScheduled } from '@/lib/analytics';

interface ContentCalendarViewProps {
  scheduledPosts: ScheduledPost[];
  recentPosts: RecentPost[];
  onUpdateScheduledPosts: (updated: ScheduledPost[]) => void;
  onBack: () => void;
}

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const OPTIMAL_SLOTS = [
  { day: 'Mardi', time: '08:30', network: 'LinkedIn', label: 'Pic d’engagement B2B' },
  { day: 'Jeudi', time: '08:45', network: 'LinkedIn', label: 'Pic de partages' },
  { day: 'Mercredi', time: '18:00', network: 'TikTok / Insta', label: 'Audience active fin de journée' },
  { day: 'Vendredi', time: '12:15', network: 'Multi-Réseaux', label: 'Pause déjeuner virale' },
  { day: 'Dimanche', time: '20:00', network: 'LinkedIn', label: 'Préparation de la semaine' },
];

export default function ContentCalendarView({
  scheduledPosts,
  recentPosts,
  onUpdateScheduledPosts,
  onBack,
}: ContentCalendarViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>('08:30');
  const [selectedNetworks, setSelectedNetworks] = useState<
    ('linkedin' | 'tiktok' | 'instagram' | 'facebook' | 'x')[]
  >(['linkedin']);

  const handleToggleNetwork = (net: 'linkedin' | 'tiktok' | 'instagram' | 'facebook' | 'x') => {
    setSelectedNetworks((prev) =>
      prev.includes(net) ? prev.filter((n) => n !== net) : [...prev, net]
    );
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sourcePost = recentPosts.find((p) => p.id === selectedPostId);
    if (!sourcePost && !selectedPostId) return;

    const postContent = sourcePost ? sourcePost.post : 'Nouveau post planifié';
    const postTitle = sourcePost ? sourcePost.title : 'Post planifié';

    const newScheduled = saveScheduledPost({
      title: postTitle,
      post: postContent,
      tiktokPost: sourcePost?.tiktokPost,
      networks: selectedNetworks,
      scheduledFor: `${scheduledDate}T${scheduledTime}:00`,
      status: 'scheduled',
      mediaUrl: sourcePost?.mediaUrl,
    });

    onUpdateScheduledPosts([newScheduled, ...scheduledPosts]);
    trackCalendarScheduled({
      date: `${scheduledDate}T${scheduledTime}`,
      network: selectedNetworks.join(','),
    });
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = deleteScheduledPost(id);
    onUpdateScheduledPosts(updated);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Studio
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Fonctionnalité Pro : Programmation en Masse
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-1 flex items-center gap-2">
            <span>📅</span> Calendrier Éditorial & Programmation
          </h2>
          <p className="text-sm text-slate-500">
            Planifiez vos posts forgés sur les créneaux à fort engagement. Vos contenus seront automatiquement propulsés sur vos canaux.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Programmer un post
        </button>
      </div>

      {/* Recommended Time Slots Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            Créneaux d'engagement maximum recommandés par l'IA :
          </h3>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">Basé sur l'algorithme 2026</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {OPTIMAL_SLOTS.map((slot, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-3 space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{slot.day}</span>
                <span className="font-mono text-xs font-bold text-orange-600">{slot.time}</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium block truncate">
                {slot.network}
              </span>
              <p className="text-[10px] text-slate-400 truncate">{slot.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Visual Schedule Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span>🗓️</span> Planning de la Semaine
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span>Semaine en cours</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((dayName, dIdx) => {
            // Find posts scheduled for this day (demo matching)
            const dayPosts = scheduledPosts.filter((sp) => {
              try {
                const date = new Date(sp.scheduledFor);
                // 1 = Monday in standard JS getDay (0 is Sunday)
                const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
                return dayIndex === dIdx;
              } catch {
                return false;
              }
            });

            return (
              <div
                key={dayName}
                className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3 min-h-[160px] flex flex-col justify-between"
              >
                <div className="border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{dayName}</span>
                  {dayPosts.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  {dayPosts.length === 0 ? (
                    <div className="text-[11px] text-slate-400 text-center py-4">
                      Aucun post
                    </div>
                  ) : (
                    dayPosts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5 shadow-2xs group"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-orange-600">
                            {p.scheduledFor.split('T')[1]?.slice(0, 5) || '08:30'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="text-slate-400 hover:text-rose-600 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {p.title}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {p.networks.map((n) => (
                            <span
                              key={n}
                              className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-mono uppercase"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="mt-2 text-[11px] font-semibold text-slate-400 hover:text-orange-600 flex items-center justify-center gap-1 py-1 rounded hover:bg-white/80 transition"
                >
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Queue Table */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <span>📋</span> File d'attente des publications ({scheduledPosts.length})
        </h3>

        {scheduledPosts.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
            Aucun post dans la file d'attente. Cliquez sur « Programmer un post » pour planifier vos contenus forgés.
          </div>
        ) : (
          <div className="space-y-2">
            {scheduledPosts.map((sp) => (
              <div
                key={sp.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {sp.scheduledFor.replace('T', ' à ')}
                    </span>
                    <div className="flex items-center gap-1">
                      {sp.networks.map((net) => (
                        <span
                          key={net}
                          className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold"
                        >
                          {net}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm truncate">{sp.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{sp.post}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                    Prêt pour diffusion
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(sp.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Retirer de la file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal to Schedule New Post */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <span>📅</span> Programmer une publication
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  1. Choisir le contenu à programmer
                </label>
                {recentPosts.length > 0 ? (
                  <select
                    value={selectedPostId}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Sélectionnez un de vos posts récents...</option>
                    {recentPosts.map((rp) => (
                      <option key={rp.id} value={rp.id}>
                        {rp.title || rp.post.slice(0, 45)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    Vous n'avez pas encore de post récent forgé. Générez un contenu dans le Studio pour le programmer ici.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. Date de publication
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. Heure optimale
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  4. Canaux cibles
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['linkedin', 'tiktok', 'instagram', 'facebook', 'x'] as const).map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => handleToggleNetwork(net)}
                      className={`p-2 rounded-xl border text-xs font-bold capitalize transition ${
                        selectedNetworks.includes(net)
                          ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="md"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Confirmer la programmation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
