import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Supported locales
export const locales = ['en', 'fr', 'es', 'de', 'pt', 'ja', 'zh'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

// Get locale from cookie or use default
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');

  if (localeCookie && locales.includes(localeCookie.value as Locale)) {
    return localeCookie.value as Locale;
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
