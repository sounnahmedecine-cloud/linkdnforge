import { RecentPost, GhostwriterProfile, SocialConnections, ScheduledPost } from './types';

const RECENT_POSTS_KEY = 'linkedinforge_recent_posts';
const PROFILE_KEY = 'user_setup_profile';
const SOCIAL_CONNECTIONS_KEY = 'linkedinforge_social_connections';
const SCHEDULED_POSTS_KEY = 'linkedinforge_scheduled_posts';

export const DEFAULT_GHOSTWRITER_PROFILE: GhostwriterProfile = {
  tone: 'expert',
  linkedinUrl: '',
  linkedinProfile: '',
  personalExamples: '',
  editorialStyle: 'auto',
  themes: [],
};

export const DEFAULT_SOCIAL_CONNECTIONS: SocialConnections = {
  bufferToken: '',
  bufferProfileIdTiktok: '',
  bufferProfileIdInstagram: '',
  bufferChannels: [],
  linkedinConnected: false,
  linkedinProfileName: '',
  tiktokAccountName: '',
  instagramAccountName: '',
  facebookPageName: '',
  xHandle: '',
  redditUsername: '',
  snapchatConnected: false,
};

export function getActiveUserEmail(): string {
  if (typeof document === 'undefined') return '';
  try {
    const match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
    if (match && match[1]) {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      if (parsed && typeof parsed.email === 'string') {
        return parsed.email.toLowerCase().trim();
      }
    }
  } catch (e) {}
  return '';
}

function getScopedKey(baseKey: string, userEmail?: string): string {
  const email = (userEmail || getActiveUserEmail()).toLowerCase().trim();
  if (!email) return baseKey;
  const sanitized = email.replace(/[^a-z0-9_]/g, '_');
  return `${baseKey}_${sanitized}`;
}

export function isUserFirstOnboardingDone(userEmail?: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const key = getScopedKey('linkdnforge_first_onboarding_done', userEmail);
    return localStorage.getItem(key) === 'true';
  } catch (e) {
    return false;
  }
}

export function setUserFirstOnboardingDone(done: boolean = true, userEmail?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getScopedKey('linkdnforge_first_onboarding_done', userEmail);
    localStorage.setItem(key, String(done));
  } catch (e) {}
}

export function getRecentPosts(userEmail?: string): RecentPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getScopedKey(RECENT_POSTS_KEY, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading recent posts from storage:', e);
    return [];
  }
}

export function saveRecentPost(
  post: Omit<RecentPost, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
  userEmail?: string
): RecentPost {
  const current = getRecentPosts(userEmail);
  const newPost: RecentPost = {
    ...post,
    id: post.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: post.createdAt || new Date().toISOString(),
  };

  // Prepend and limit to 30 most recent
  const updated = [newPost, ...current.filter((p) => p.id !== newPost.id)].slice(0, 30);
  try {
    const key = getScopedKey(RECENT_POSTS_KEY, userEmail);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving recent post to storage:', e);
  }
  return newPost;
}

export function deleteRecentPost(id: string, userEmail?: string): RecentPost[] {
  const current = getRecentPosts(userEmail);
  const updated = current.filter((p) => p.id !== id);
  try {
    const key = getScopedKey(RECENT_POSTS_KEY, userEmail);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error deleting post from storage:', e);
  }
  return updated;
}

export function getGhostwriterProfile(userEmail?: string): GhostwriterProfile {
  if (typeof window === 'undefined') return DEFAULT_GHOSTWRITER_PROFILE;
  try {
    const key = getScopedKey(PROFILE_KEY, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_GHOSTWRITER_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      tone: parsed.tone || DEFAULT_GHOSTWRITER_PROFILE.tone,
      linkedinUrl: parsed.linkedinUrl || '',
      linkedinProfile: parsed.linkedinProfile || '',
      personalExamples: parsed.personalExamples || '',
      editorialStyle: parsed.editorialStyle || 'auto',
      themes: parsed.themes || [],
    };
  } catch (e) {
    console.warn('Error reading ghostwriter profile:', e);
    return DEFAULT_GHOSTWRITER_PROFILE;
  }
}

export function saveGhostwriterProfile(profile: GhostwriterProfile, userEmail?: string): void {
  try {
    const key = getScopedKey(PROFILE_KEY, userEmail);
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (e) {
    console.warn('Error saving ghostwriter profile:', e);
  }
}

// Social Connections Persistence
export function getSocialConnections(userEmail?: string): SocialConnections {
  if (typeof window === 'undefined') return DEFAULT_SOCIAL_CONNECTIONS;
  try {
    const key = getScopedKey(SOCIAL_CONNECTIONS_KEY, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_SOCIAL_CONNECTIONS;
    return { ...DEFAULT_SOCIAL_CONNECTIONS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Error reading social connections:', e);
    return DEFAULT_SOCIAL_CONNECTIONS;
  }
}

export function saveSocialConnections(connections: SocialConnections, userEmail?: string): void {
  try {
    const key = getScopedKey(SOCIAL_CONNECTIONS_KEY, userEmail);
    localStorage.setItem(key, JSON.stringify(connections));
  } catch (e) {
    console.warn('Error saving social connections:', e);
  }
}

// Scheduled Posts Persistence (Calendar)
export function getScheduledPosts(userEmail?: string): ScheduledPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getScopedKey(SCHEDULED_POSTS_KEY, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading scheduled posts:', e);
    return [];
  }
}

export function saveScheduledPost(
  post: Omit<ScheduledPost, 'id'> & { id?: string },
  userEmail?: string
): ScheduledPost {
  const current = getScheduledPosts(userEmail);
  const newPost: ScheduledPost = {
    ...post,
    id: post.id || `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  const updated = [newPost, ...current.filter((p) => p.id !== newPost.id)];
  try {
    const key = getScopedKey(SCHEDULED_POSTS_KEY, userEmail);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving scheduled post:', e);
  }
  return newPost;
}

export function deleteScheduledPost(id: string, userEmail?: string): ScheduledPost[] {
  const current = getScheduledPosts(userEmail);
  const updated = current.filter((p) => p.id !== id);
  try {
    const key = getScopedKey(SCHEDULED_POSTS_KEY, userEmail);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error deleting scheduled post:', e);
  }
  return updated;
}

