import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import ha from './locales/ha.json';
import yo from './locales/yo.json';
import ig from './locales/ig.json';

const resources = { en: { translation: en }, ha: { translation: ha }, yo: { translation: yo }, ig: { translation: ig } };

// Before login there's no saved preference yet, so fall back to the device's
// own language setting if it happens to be one of the four supported —
// otherwise default to English rather than guessing.
const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const initialLanguage = Object.keys(resources).includes(deviceLanguage) ? deviceLanguage : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
