import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <i className="fas fa-user-tie"></i>
          <span>{t('app_name')}</span>
        </Link>
        
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu principal"
        >
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        <nav className={`nav ${mobileMenuOpen ? 'nav-mobile-open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
            <i className="fas fa-chart-line"></i>
            <span>{t('navigation.dashboard')}</span>
          </Link>
          <Link to="/candidates" className={`nav-link ${isActive('/candidates') ? 'nav-link-active' : ''}`}>
            <i className="fas fa-users"></i>
            <span>{t('navigation.candidates')}</span>
          </Link>
          <Link to="/missions" className={`nav-link ${isActive('/missions') ? 'nav-link-active' : ''}`}>
            <i className="fas fa-briefcase"></i>
            <span>{t('navigation.missions')}</span>
          </Link>
          <Link to="/candidates/new" className={`nav-link ${isActive('/candidates/new') ? 'nav-link-active' : ''}`}>
            <i className="fas fa-user-plus"></i>
            <span>{t('navigation.new_candidate')}</span>
          </Link>
          
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}

export default Header;
