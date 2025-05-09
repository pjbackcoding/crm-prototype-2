import React from 'react';
import { useTheme } from '../theme.jsx';
import { useTranslation } from 'react-i18next';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={t('theme.toggle')}
      title={theme === 'light' ? t('theme.switch_to_dark') : t('theme.switch_to_light')}
    >
      <span className="theme-toggle-icon">☀️</span>
      <span className="theme-toggle-icon">🌙</span>
      <span className="theme-toggle-slider"></span>
    </button>
  );
}

export default ThemeToggle;
