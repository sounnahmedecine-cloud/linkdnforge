import fr from '../../../messages/fr.json';
import en from '../../../messages/en.json';
import es from '../../../messages/es.json';

export type PromptLocale = 'fr' | 'en' | 'es';

const THEME_MESSAGES: Record<PromptLocale, Record<string, string>> = {
  fr: fr.onboarding.step2.themes,
  en: en.onboarding.step2.themes,
  es: es.onboarding.step2.themes,
};

export function localizeThemes(themeSlugs: string[] | undefined, locale: PromptLocale): string[] {
  if (!themeSlugs?.length) return [];
  const labels = THEME_MESSAGES[locale] ?? THEME_MESSAGES.fr;
  return themeSlugs.map((slug) => labels[slug] ?? slug);
}

export function resolveLocale(locale: unknown): PromptLocale {
  return locale === 'en' || locale === 'es' ? locale : 'fr';
}
