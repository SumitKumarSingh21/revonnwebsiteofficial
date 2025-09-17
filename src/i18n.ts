import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';

const resources = { en, hi, mr, bn, ta, te, gu, kn, ml, pa } as const;

const savedLang = localStorage.getItem('lang') || 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang'
    }
  });

// Keep <html lang> in sync
try {
  document.documentElement.lang = i18n.language || 'en';
} catch {}

i18n.on('languageChanged', (lng) => {
  try {
    document.documentElement.lang = lng;
    localStorage.setItem('lang', lng);
  } catch {}
});

export default i18n;

