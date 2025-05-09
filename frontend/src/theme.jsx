// Système de thèmes pour l'application
import { createContext, useState, useEffect, useContext } from 'react';

// Context pour le thème
export const ThemeContext = createContext();

// Hook pour utiliser le thème
export const useTheme = () => useContext(ThemeContext);

// Provider pour le thème
export const ThemeProvider = ({ children }) => {
  // Récupérer le thème sauvegardé ou utiliser le thème clair par défaut
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Vérifier si l'utilisateur a une préférence système pour le mode sombre
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return savedTheme;
  });

  // Appliquer le thème
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
