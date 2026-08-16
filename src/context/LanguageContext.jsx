import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DICTS } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  // The original script mutated <html lang> / <html dir> on toggle.
  // The cleanup keeps the admin area LTR if the visitor switched to Arabic
  // on the public site and then navigated to /admin.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    return () => {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    };
  }, [lang]);

  const t = useCallback((key) => DICTS[lang][key] ?? DICTS.en[key] ?? key, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'ar' : 'en')), []);

  const value = useMemo(
    () => ({ lang, isAr: lang === 'ar', t, toggle, setLang }),
    [lang, t, toggle],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
