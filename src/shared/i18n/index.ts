import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi';
import en from './locales/en';
import zhTW from './locales/zh-TW';

export const LOCALE_STORAGE_KEY = 'recruitpro-locale';
export const SUPPORTED_LOCALES = ['vi', 'en', 'zh-TW'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

function isAppLocale(value: string | null): value is AppLocale {
  return value === 'vi' || value === 'en' || value === 'zh-TW';
}

function getInitialLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isAppLocale(stored)) return stored;
  return 'vi';
}

void i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
    'zh-TW': { translation: zhTW },
  },
  lng: getInitialLocale(),
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false,
  },
});

export function setAppLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  void i18n.changeLanguage(locale);
}

export function getDateLocale(): string {
  if (i18n.language === 'en') return 'en-US';
  if (i18n.language === 'zh-TW') return 'zh-TW';
  return 'vi-VN';
}

export default i18n;
