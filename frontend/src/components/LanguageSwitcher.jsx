import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Langues disponibles avec leur drapeau
  const languages = [
    { code: 'fr', name: t('language.fr'), flag: '🇫🇷' },
    { code: 'en', name: t('language.en'), flag: '🇬🇧' },
    { code: 'vi', name: t('language.vi'), flag: '🇻🇳' }
  ];

  // Récupérer la langue actuelle
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    // Sauvegarder la préférence de langue dans localStorage
    localStorage.setItem('i18nextLng', langCode);
  };

  // Fermer le dropdown lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button 
        className="language-button" 
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="language-flag">{currentLanguage.flag}</span>
        <span className="language-name">{currentLanguage.code.toUpperCase()}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-title">{t('language.select')}</div>
          <ul className="language-list">
            {languages.map((language) => (
              <li 
                key={language.code}
                className={`language-item ${language.code === i18n.language ? 'active' : ''}`}
                onClick={() => changeLanguage(language.code)}
              >
                <span className="language-flag">{language.flag}</span>
                <span className="language-fullname">{language.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
