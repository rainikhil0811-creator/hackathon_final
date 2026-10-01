import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
