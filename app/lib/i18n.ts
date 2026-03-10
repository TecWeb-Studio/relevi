import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const i18nConfig = {
  fallbackLng: 'en',
  supportedLngs: ['en', 'it'],
  debug: process.env.NODE_ENV === 'development',

  defaultNS: 'translation',
  ns: ['translation'],

  interpolation: {
    escapeValue: false,
  },

  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
  },

  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  react: {
    useSuspense: false,
  },
};

export async function initI18n(): Promise<typeof i18n> {
  // Prevent backend URL parsing errors during server rendering/build.
  if (typeof window === 'undefined') {
    return i18n;
  }

  if (!i18n.isInitialized) {
    await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init(i18nConfig);
  }

  return i18n;
}

export default i18n;
export { i18nConfig };