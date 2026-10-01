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
import SocialConnectionsView from '@/components/studio/SocialConnectionsView';
import ContentCalendarView from '@/components/studio/ContentCalendarView';
import {
  StudioTab,
  RecentPost,
  GhostwriterProfile,
  SocialConnections,
  ScheduledPost,
} from '@/lib/studio/types';
import {
  getRecentPosts,
  saveRecentPost,
  deleteRecentPost,
  getGhostwriterProfile,
  saveGhostwriterProfile,
  getSocialConnections,
  saveSocialConnections,
  getScheduledPosts,
  isUserFirstOnboardingDone,
  setUserFirstOnboardingDone,
} from '@/lib/studio/storage';
import { ArrowLeft } from 'lucide-react';
import PaywallModal from '@/components/studio/PaywallModal';
import SocialOnboardingModal from '@/components/studio/SocialOnboardingModal';
import FirstTimeOnboardingModal from '@/components/studio/FirstTimeOnboardingModal';
import FirstPostCelebrationModal from '@/components/studio/FirstPostCelebrationModal';
import { trackPaywallViewed } from '@/lib/analytics';

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
  const [socialConnections, setSocialConnections] = useState<SocialConnections>({
    bufferToken: '',
    bufferProfileIdTiktok: '',
    bufferProfileIdInstagram: '',
  });
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

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
  const [initialIdeaSubject, setInitialIdeaSubject] = useState<string>('');

  // Paywall & trial state (5 free generations)
  const [trialCount, setTrialCount] = useState<number>(0);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [showSocialOnboarding, setShowSocialOnboarding] = useState<boolean>(false);

  // First-time interactive guided onboarding & celebration states
  const [showFirstTimeOnboarding, setShowFirstTimeOnboarding] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Collapsible sidebar & mobile drawer state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('linkdnforge_sidebar_collapsed', String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  // Initial load
  useEffect(() => {
    // 1. Auth token from cookie
    let activeEmail = '';
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find((c) => c.trim().startsWith('auth_token='));
    if (authCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(authCookie.split('=')[1]));
        setUser(userData);
        activeEmail = userData?.email || '';
      } catch (e) {
        // ignore
      }
    }

    // 2. Load storage scoped to user
    const loadedPosts = getRecentPosts(activeEmail);
    setRecentPosts(loadedPosts);
    setGhostwriterProfile(getGhostwriterProfile(activeEmail));
    setSocialConnections(getSocialConnections(activeEmail));
    setScheduledPosts(getScheduledPosts(activeEmail));

    // 3. Free trials count (sync between scoped and global storage)
    const userTrialsKey = activeEmail
      ? `linkdnforge_free_trials_count_${activeEmail.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`
      : null;
    const userSaved = userTrialsKey ? localStorage.getItem(userTrialsKey) : null;
    const globalSaved = localStorage.getItem('linkdnforge_free_trials_count');
    const userParsed = userSaved ? parseInt(userSaved, 10) : 0;
    const globalParsed = globalSaved ? parseInt(globalSaved, 10) : 0;
    const effectiveCount = Math.max(
      isNaN(userParsed) ? 0 : userParsed,
      isNaN(globalParsed) ? 0 : globalParsed
    );
    setTrialCount(effectiveCount);
    if (userTrialsKey && effectiveCount > 0) {
      localStorage.setItem(userTrialsKey, String(effectiveCount));
    }

    // 4. Sidebar collapsed preference
    const savedCollapsed = localStorage.getItem('linkdnforge_sidebar_collapsed');
    if (savedCollapsed === 'true') {
      setIsSidebarCollapsed(true);
    }

    // 5. Pending draft from landing generator
    const pendingDraft = localStorage.getItem('linkdnforge_pending_draft');
    if (pendingDraft) {
      setGeneratedPost(pendingDraft);
      localStorage.removeItem('linkdnforge_pending_draft');
    }

    // 6. First-time guided onboarding on Atelier arrival
    // Shows the welcome choice (Video / URL / Idea) if the user has 0 posts and hasn't finished onboarding yet
    const isFirstOnboardingDone = isUserFirstOnboardingDone(activeEmail);
    if (loadedPosts.length === 0 && !isFirstOnboardingDone) {
      setShowFirstTimeOnboarding(true);
    }

    // 7. Chrome Extension / Deep-link capture parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const extSource = urlParams.get('source');
      const extUrl = urlParams.get('url');
      const extText = urlParams.get('selectedText') || urlParams.get('text');
      const extDraft = urlParams.get('draft');
      const extTone = urlParams.get('tone');
      const extTab = urlParams.get('tab');

      if (extDraft) {
        setGeneratedPost(extDraft);
      }
      if (extTone) {
        setGhostwriterProfile((prev) => ({ ...prev, tone: extTone }));
      }
      if (extText) {
        setInitialIdeaSubject(extText);
      }
      if (extUrl) {
        setCurrentTargetUrl(extUrl);
      }

      if (extTab === 'idea' || extText) {
        setCurrentTab('idea');
      } else if (extTab === 'url' || (extUrl && !extText)) {
        setCurrentTab('url');
      } else if (extTab === 'video') {
        setCurrentTab('video');
      }
    }
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
    const updated = deleteRecentPost(id, user?.email);
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
    targetUrlContent?: string;
    postSubject?: string;
    editorialStyle?: string;
    tone?: string;
    postObjective?: string;
  }) => {
    // Enforce 5 free generations paywall for non-admin users
    if (!isAdmin && trialCount >= 5) {
      setShowPaywall(true);
      trackPaywallViewed(trialCount);
      return;
    }

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
          targetUrlContent: params.targetUrlContent || '',
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

      // Save to recent posts history (scoped to user)
      saveRecentPost({
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
      }, user?.email);

      setRecentPosts(getRecentPosts(user?.email));

      // Celebration modal trigger on first successful generation ("Moment Waouh")
      const wasEmpty = recentPosts.length === 0;
      if (wasEmpty) {
        setTimeout(() => {
          setShowCelebration(true);
          setUserFirstOnboardingDone(true, user?.email);
        }, 500);
      }

      // Free trial quota tracking (5 free generations)
      if (!isAdmin) {
        const nextTrial = trialCount + 1;
        setTrialCount(nextTrial);
        const userKey = user?.email
          ? `linkdnforge_free_trials_count_${user.email.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`
          : null;
        if (userKey) {
          localStorage.setItem(userKey, String(nextTrial));
        }
        localStorage.setItem('linkdnforge_free_trials_count', String(nextTrial));
        if (nextTrial >= 5) {
          // Trigger paywall modal automatically upon reaching 5th generation
          setTimeout(() => {
            setShowPaywall(true);
            trackPaywallViewed(nextTrial);
          }, 1500);
        }
      }
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
      <Header
        variant="app"
        user={user}
        onLogout={handleLogout}
        logoutLabel={tNav('logout')}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Studio Layout */}
      <div className="flex-1 max-w-[1560px] w-full mx-auto p-3 sm:p-5 lg:p-7">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Navigation Sidebar (Desktop fixed + Mobile slide-over drawer) */}
          <StudioSidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
            }}
            recentCount={recentPosts.length}
            isAdmin={isAdmin}
            userEmail={user?.email}
            onLogout={handleLogout}
            trialCount={trialCount}
            onOpenPaywall={() => setShowPaywall(true)}
            onOpenOnboarding={() => setShowFirstTimeOnboarding(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
            ghostwriterTone={ghostwriterProfile.tone}
            mobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Center / Right Content Area */}
          <main className="flex-1 w-full min-w-0">
            <div
              className={`grid grid-cols-1 ${
                showResultPanel ? 'lg:grid-cols-12 gap-6 items-start' : 'gap-6'
              }`}
            >
              {/* Left Column: Active Tool or Hub */}
              <div className={`${showResultPanel ? 'lg:col-span-5' : ''} space-y-6`}>
                {currentTab === 'hub' && (
                  <StudioHub
                    onSelectTab={(tab) => setCurrentTab(tab)}
                    recentPosts={recentPosts}
                    onSelectPost={(post) => handleSelectRecentPost(post)}
                    onDeletePost={handleDeleteRecentPost}
                    ghostwriterProfile={ghostwriterProfile}
                    onOpenOnboarding={() => setShowFirstTimeOnboarding(true)}
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
                        targetUrlContent: data.targetUrlContent,
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
                    initialSubject={initialIdeaSubject}
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

                {currentTab === 'accounts' && (
                  <SocialConnectionsView
                    connections={socialConnections}
                    onUpdateConnections={(updated) => {
                      setSocialConnections(updated);
                      saveSocialConnections(updated, user?.email);
                    }}
                    onBack={() => setCurrentTab('hub')}
                    isAdmin={isAdmin}
                  />
                )}

                {currentTab === 'calendar' && (
                  <ContentCalendarView
                    scheduledPosts={scheduledPosts}
                    recentPosts={recentPosts}
                    onUpdateScheduledPosts={(updated) => {
                      setScheduledPosts(updated);
                    }}
                    onBack={() => setCurrentTab('hub')}
                  />
                )}

                {currentTab === 'profile' && (
                  <GhostwriterProfileView
                    profile={ghostwriterProfile}
                    onUpdateProfile={(updated) => {
                      setGhostwriterProfile(updated);
                      saveGhostwriterProfile(updated, user?.email);
                    }}
                    onBack={() => setCurrentTab('hub')}
                  />
                )}
              </div>

              {/* Right Column: Interactive Result Preview */}
              {showResultPanel && (
                <div className="lg:col-span-7 lg:sticky lg:top-4 space-y-6">
                  <StudioResult
                    generatedPost={generatedPost}
                    isGenerating={isGenerating}
                    detectedClassification={detectedClassification}
                    postExplanation={postExplanation}
                    autopilotVideoUrl={currentVideoUrl}
                    siteScreenshotUrl={currentSiteScreenshotUrl}
                    siteOgImage={currentSiteOgImage}
                    isAdmin={isAdmin}
                    targetUrl={currentTargetUrl}
                    socialConnections={socialConnections}
                    onReset={handleResetCurrentPost}
                    onOpenSocialAccounts={() => setCurrentTab('accounts')}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Paywall modal when free generations are exhausted */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        userEmail={user?.email}
      />

      {/* First Time Guided Onboarding Modal (Step 1: Pick raw material door) */}
      <FirstTimeOnboardingModal
        isOpen={showFirstTimeOnboarding}
        onClose={() => {
          setShowFirstTimeOnboarding(false);
          setUserFirstOnboardingDone(true, user?.email);
        }}
        onSelectDoor={(tab) => {
          setCurrentTab(tab);
          setShowFirstTimeOnboarding(false);
          setUserFirstOnboardingDone(true, user?.email);
        }}
      />

      {/* First Post Forged Celebration Modal ("Moment Waouh" -> Ghostwriter setup) */}
      <FirstPostCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        onGoToGhostwriter={() => {
          setCurrentTab('profile');
          setShowCelebration(false);
        }}
      />

      {/* Social Onboarding 1-Click modal (accessible via settings or pro upsell) */}
      <SocialOnboardingModal
        isOpen={showSocialOnboarding}
        onClose={() => setShowSocialOnboarding(false)}
        onOpenSettings={() => setCurrentTab('accounts')}
      />
    </div>
  );
}

