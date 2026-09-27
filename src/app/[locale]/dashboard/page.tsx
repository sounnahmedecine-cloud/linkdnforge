'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Header from '@/components/layout/Header';
import StudioSidebar from '@/components/layout/StudioSidebar';
import StudioHub from '@/components/studio/StudioHub';
import VideoForge from '@/components/studio/VideoForge';
import UrlForge from '@/components/studio/UrlForge';
import IdeaForge from '@/components/studio/IdeaForge';
import StudioResult from '@/components/studio/StudioResult';
import GhostwriterProfileView from '@/components/studio/GhostwriterProfileView';
import RecentPostsList from '@/components/studio/RecentPostsList';
import { StudioTab, RecentPost, GhostwriterProfile } from '@/lib/studio/types';
import {
  getRecentPosts,
  saveRecentPost,
  deleteRecentPost,
  getGhostwriterProfile,
  saveGhostwriterProfile,
} from '@/lib/studio/storage';
import { Sparkles, SlidersHorizontal, ArrowLeft } from 'lucide-react';

interface User {
  email: string;
  role: 'admin' | 'user';
  unlimited: boolean;
}

const ADMIN_EMAILS = [
  'sounnahmedecine@gmail.com',
  'abderelmalki@gmail.com',
  'contact@woosenteur.fr',
  'baba@woosenteur.fr',
];

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const tNav = useTranslations('nav');

  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.role === 'admin' || (!!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

  // Studio navigation state
  const [currentTab, setCurrentTab] = useState<StudioTab>('hub');

  // Persistence state
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [ghostwriterProfile, setGhostwriterProfile] = useState<GhostwriterProfile>({
    tone: 'expert',
    linkedinUrl: '',
    linkedinProfile: '',
    personalExamples: '',
    editorialStyle: 'auto',
    themes: [],
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState('');
  const [tiktokPost, setTiktokPost] = useState('');
  const [detectedClassification, setDetectedClassification] = useState<any>(null);
  const [postExplanation, setPostExplanation] = useState<any>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [currentSiteScreenshotUrl, setCurrentSiteScreenshotUrl] = useState<string | null>(null);
  const [currentSiteOgImage, setCurrentSiteOgImage] = useState<string | null>(null);
  const [currentTargetUrl, setCurrentTargetUrl] = useState<string>('');

  // Initial load
  useEffect(() => {
    // 1. Auth token from cookie
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find((c) => c.trim().startsWith('auth_token='));
    if (authCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
        setUser(userData);
      } catch (e) {
        // ignore
      }
    }

    // 2. Load storage
    setRecentPosts(getRecentPosts());
    setGhostwriterProfile(getGhostwriterProfile());
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleSelectRecentPost = (post: RecentPost) => {
    setGeneratedPost(post.post);
    setTiktokPost(post.tiktokPost || '');
    setDetectedClassification(post.classification || null);
    setPostExplanation(post.explanation || null);
    setCurrentTargetUrl(post.targetUrl || '');
    if (post.mediaType === 'video') {
      setCurrentVideoUrl(post.mediaUrl || '');
      setCurrentSiteScreenshotUrl(null);
      setCurrentSiteOgImage(null);
    } else {
      setCurrentVideoUrl('');
      setCurrentSiteScreenshotUrl(post.mediaUrl || null);
      setCurrentSiteOgImage(post.mediaUrl || null);
    }
  };

  const handleDeleteRecentPost = (id: string) => {
    const updated = deleteRecentPost(id);
    setRecentPosts(updated);
  };

  const handleResetCurrentPost = () => {
    setGeneratedPost('');
    setTiktokPost('');
    setDetectedClassification(null);
    setPostExplanation(null);
    setCurrentVideoUrl('');
    setCurrentSiteScreenshotUrl(null);
    setCurrentSiteOgImage(null);
    setCurrentTargetUrl('');
  };

  // Unified Generation Handler using the intelligent autopilot API
  const handleGenerate = async (params: {
    sourceType: 'video' | 'url' | 'idea';
    videoUrl?: string;
    videoMeta?: { name: string; size: number } | null;
    targetUrl?: string;
    postSubject?: string;
    editorialStyle?: string;
    tone?: string;
    postObjective?: string;
  }) => {
    setIsGenerating(true);
    setGeneratedPost('');
    setTiktokPost('');
    setDetectedClassification(null);
    setPostExplanation(null);
    setCurrentVideoUrl(params.videoUrl || '');
    setCurrentTargetUrl(params.targetUrl || '');
    setCurrentSiteScreenshotUrl(null);
    setCurrentSiteOgImage(null);

    try {
      const response = await fetch('/api/autopilot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: params.videoUrl || '',
          targetUrl: params.targetUrl || '',
          videoMeta: params.videoMeta || null,
          postSubject: params.postSubject || '',
          editorialStyle: params.editorialStyle || ghostwriterProfile.editorialStyle || 'auto',
          tone: params.tone || ghostwriterProfile.tone || 'expert',
          postObjective: params.postObjective || 'leads',
          themes: ghostwriterProfile.themes || [],
          personalExamples: ghostwriterProfile.personalExamples || '',
          linkedinProfile: ghostwriterProfile.linkedinProfile || '',
          locale,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erreur lors de la génération');
      }

      const data = await response.json();
      setGeneratedPost(data.post);
      setTiktokPost(data.tiktokPost || '');
      setPostExplanation(data.explanation || null);
      setDetectedClassification(data.classification || null);
      setCurrentSiteScreenshotUrl(data.screenshotUrl || null);
      setCurrentSiteOgImage(data.ogImage || null);

      // Save to recent posts history
      const saved = saveRecentPost({
        sourceType: params.sourceType,
        title:
          data.classification?.keyEntities?.productName ||
          params.postSubject ||
          (params.videoMeta?.name ? `Vidéo : ${params.videoMeta.name}` : '') ||
          (params.targetUrl ? `Page : ${params.targetUrl.replace(/^https?:\/\//, '').slice(0, 30)}` : '') ||
          'Nouveau contenu',
        post: data.post,
        tiktokPost: data.tiktokPost || undefined,
        classification: data.classification || undefined,
        explanation: data.explanation || undefined,
        mediaUrl: params.videoUrl || data.screenshotUrl || data.ogImage || undefined,
        mediaType: params.videoUrl ? 'video' : data.ogImage ? 'og' : data.screenshotUrl ? 'screenshot' : undefined,
        targetUrl: params.targetUrl,
      });

      setRecentPosts(getRecentPosts());
    } catch (error: any) {
      console.error('Erreur génération:', error);
      alert(error.message || 'Erreur lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  const showResultPanel = !!generatedPost || isGenerating;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Header variant="app" user={user} onLogout={handleLogout} logoutLabel={tNav('logout')} />

      {/* Main Studio Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Navigation Sidebar */}
          <StudioSidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
            }}
            recentCount={recentPosts.length}
            isAdmin={isAdmin}
            userEmail={user?.email}
            onLogout={handleLogout}
          />

          {/* Center / Right Content Area */}
          <main className="flex-1 w-full min-w-0">
            <div
              className={`grid grid-cols-1 ${
                showResultPanel ? 'xl:grid-cols-2 gap-8' : 'gap-8'
              }`}
            >
              {/* Left Column: Active Tool or Hub */}
              <div className="space-y-6">
                {currentTab === 'hub' && (
                  <StudioHub
                    onSelectTab={(tab) => setCurrentTab(tab)}
                    recentPosts={recentPosts}
                    onSelectPost={(post) => handleSelectRecentPost(post)}
                    onDeletePost={handleDeleteRecentPost}
                    ghostwriterProfile={ghostwriterProfile}
                  />
                )}

                {currentTab === 'video' && (
                  <VideoForge
                    onBack={() => setCurrentTab('hub')}
                    isGenerating={isGenerating}
                    defaultTone={ghostwriterProfile.tone}
                    onGenerate={async (data) => {
                      await handleGenerate({
                        sourceType: 'video',
                        videoUrl: data.videoUrl,
                        videoMeta: data.videoMeta,
                        targetUrl: data.targetUrl,
                        editorialStyle: data.editorialStyle,
                        tone: data.tone,
                        postObjective: data.postObjective,
                      });
                    }}
                  />
                )}

                {currentTab === 'url' && (
                  <UrlForge
                    onBack={() => setCurrentTab('hub')}
                    isGenerating={isGenerating}
                    defaultTone={ghostwriterProfile.tone}
                    onGenerate={async (data) => {
                      await handleGenerate({
                        sourceType: 'url',
                        targetUrl: data.targetUrl,
                        postSubject: data.postSubject,
                        editorialStyle: data.editorialStyle,
                        tone: data.tone,
                        postObjective: data.postObjective,
                      });
                    }}
                  />
                )}

                {currentTab === 'idea' && (
                  <IdeaForge
                    onBack={() => setCurrentTab('hub')}
                    isGenerating={isGenerating}
                    defaultTone={ghostwriterProfile.tone}
                    onGenerate={async (data) => {
                      await handleGenerate({
                        sourceType: 'idea',
                        postSubject: data.postSubject,
                        editorialStyle: data.editorialStyle,
                        tone: data.tone,
                        postObjective: data.postObjective,
                      });
                    }}
                  />
                )}

                {currentTab === 'history' && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="font-display font-bold text-2xl text-slate-900">
                          📚 Tous vos contenus récents
                        </h2>
                        <p className="text-xs text-slate-500">
                          Retrouvez, réaffichez et republiez vos précédents posts générés par l'IA.
                        </p>
                      </div>
                      <button
                        onClick={() => setCurrentTab('hub')}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Retour Studio
                      </button>
                    </div>

                    <RecentPostsList
                      posts={recentPosts}
                      onSelectPost={(post) => handleSelectRecentPost(post)}
                      onDeletePost={handleDeleteRecentPost}
                      onNewCreation={() => setCurrentTab('hub')}
                    />
                  </div>
                )}

                {currentTab === 'profile' && (
                  <GhostwriterProfileView
                    profile={ghostwriterProfile}
                    onUpdateProfile={(updated) => {
                      setGhostwriterProfile(updated);
                    }}
                    onBack={() => setCurrentTab('hub')}
                  />
                )}
              </div>

              {/* Right Column: Interactive Result Preview */}
              {showResultPanel && (
                <div className="xl:sticky xl:top-6 space-y-6">
                  <StudioResult
                    generatedPost={generatedPost}
                    isGenerating={isGenerating}
                    tiktokPost={tiktokPost}
                    detectedClassification={detectedClassification}
                    postExplanation={postExplanation}
                    autopilotVideoUrl={currentVideoUrl}
                    siteScreenshotUrl={currentSiteScreenshotUrl}
                    siteOgImage={currentSiteOgImage}
                    isAdmin={isAdmin}
                    targetUrl={currentTargetUrl}
                    onReset={handleResetCurrentPost}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
