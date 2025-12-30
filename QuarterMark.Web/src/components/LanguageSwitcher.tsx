import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Store preference in localStorage
    localStorage.setItem('language', lng);
  };

  // Load saved language preference on mount
  React.useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'da')) {
        i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  }, [i18n]);

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        EN
      </button>
      <button
        className={`lang-btn ${i18n.language === 'da' ? 'active' : ''}`}
        onClick={() => changeLanguage('da')}
        title="Dansk"
      >
        DA
      </button>
    </div>
  );
}

export default LanguageSwitcher;

