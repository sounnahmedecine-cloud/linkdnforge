import { RecentPost, GhostwriterProfile } from './types';

const RECENT_POSTS_KEY = 'linkedinforge_recent_posts';
const PROFILE_KEY = 'user_setup_profile';

export const DEFAULT_GHOSTWRITER_PROFILE: GhostwriterProfile = {
  tone: 'expert',
  linkedinUrl: '',
  linkedinProfile: '',
  personalExamples: '',
  editorialStyle: 'auto',
  themes: [],
};

export function getRecentPosts(): RecentPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_POSTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading recent posts from storage:', e);
    return [];
  }
}

export function saveRecentPost(post: Omit<RecentPost, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): RecentPost {
  const current = getRecentPosts();
  const newPost: RecentPost = {
    ...post,
    id: post.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: post.createdAt || new Date().toISOString(),
  };

  // Prepend and limit to 30 most recent
  const updated = [newPost, ...current.filter(p => p.id !== newPost.id)].slice(0, 30);
  try {
    localStorage.setItem(RECENT_POSTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving recent post to storage:', e);
  }
  return newPost;
}

export function deleteRecentPost(id: string): RecentPost[] {
  const current = getRecentPosts();
  const updated = current.filter(p => p.id !== id);
  try {
    localStorage.setItem(RECENT_POSTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error deleting post from storage:', e);
  }
  return updated;
}

export function getGhostwriterProfile(): GhostwriterProfile {
  if (typeof window === 'undefined') return DEFAULT_GHOSTWRITER_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
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

export function saveGhostwriterProfile(profile: GhostwriterProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Error saving ghostwriter profile:', e);
  }
}
