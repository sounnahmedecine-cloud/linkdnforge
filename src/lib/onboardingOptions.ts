export const THEME_SLUGS = [
  'tech', 'saasB2B', 'aiAutomation', 'digitalMarketing',
  'freelancing', 'ecommerce', 'webMobileDev',
  'hr', 'finance', 'realEstate',
  'health', 'coaching', 'personalDev',
  'education', 'commerce',
] as const;
export type ThemeSlug = (typeof THEME_SLUGS)[number];

export const TONE_VALUES = ['expert', 'peda', 'story', 'humour', 'inspirant'] as const;
export const FREQUENCY_VALUES = ['1-day', '3-week', '1-week'] as const;
export const POST_OBJECTIVE_VALUES = ['leads', 'visibility'] as const;
export const POST_TYPE_VALUES = ['ghostwriter', 'story', 'advice', 'carousel'] as const;
export const VISUAL_TYPE_VALUES = ['image', 'quote'] as const;
