export type StudioTab = 'hub' | 'video' | 'url' | 'idea' | 'history' | 'profile';

export interface RecentPost {
  id: string;
  sourceType: 'video' | 'url' | 'idea';
  title: string;
  post: string;
  tiktokPost?: string;
  classification?: {
    contentType?: string;
    detectedLabel?: string;
    primaryIntent?: string;
    detectedReason?: string;
    recommendedStructure?: string[];
  };
  explanation?: any;
  mediaUrl?: string;
  mediaType?: 'video' | 'screenshot' | 'og' | 'image';
  createdAt: string;
  targetUrl?: string;
}

export interface GhostwriterProfile {
  tone: string;
  linkedinUrl: string;
  linkedinProfile: string;
  personalExamples: string;
  editorialStyle?: string;
  themes?: string[];
}
