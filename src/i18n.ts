import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations
import enTranslation from './i18n/locales/en/translation.json';
import hiTranslation from './i18n/locales/hi/translation.json';
import paTranslation from './i18n/locales/pa/translation.json';

i18n
  // Load translation using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // Detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // Add resources directly for faster initial load
    resources: {
      en: {
        translation: enTranslation
      },
      hi: {
        translation: hiTranslation
      },
      pa: {
        translation: paTranslation
      }
    },
    
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
    }
  });

