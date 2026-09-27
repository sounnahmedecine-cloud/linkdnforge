export type StudioTab = 
  | 'hub' 
  | 'video' 
  | 'url' 
  | 'idea' 
  | 'history' 
  | 'profile' 
  | 'accounts' 
  | 'calendar';

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

export interface BufferChannelInfo {
  id: string;
  name: string;
  displayName: string;
  service: string; // 'linkedin' | 'facebook' | 'tiktok' | 'instagram' | 'twitter' etc.
  type: string;
  avatar?: string;
  isDisconnected?: boolean;
}

export interface SocialConnections {
  bufferToken?: string;
  bufferProfileIdTiktok?: string;
  bufferProfileIdInstagram?: string;
  bufferChannels?: BufferChannelInfo[];
  linkedinConnected?: boolean;
  linkedinProfileName?: string;
  tiktokAccountName?: string;
  instagramAccountName?: string;
  facebookPageName?: string;
  xHandle?: string;
  snapchatConnected?: boolean;
}

export interface ScheduledPost {
  id: string;
  title: string;
  post: string;
  tiktokPost?: string;
  networks: ('linkedin' | 'tiktok' | 'instagram' | 'facebook' | 'x')[];
  scheduledFor: string; // ISO string date
  status: 'scheduled' | 'published' | 'draft';
  mediaUrl?: string;
}
