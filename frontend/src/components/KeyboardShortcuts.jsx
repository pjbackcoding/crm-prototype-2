import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme.jsx';
import { useToast } from './ToastNotification';

// Liste des raccourcis clavier disponibles
const SHORTCUTS = [
  { key: 'g h', description: 'shortcuts.go_home', action: () => window.location.href = '/' },
  { key: 'g c', description: 'shortcuts.candidates_list', action: (navigate) => navigate('/candidates') },
  { key: 'g m', description: 'shortcuts.missions_list', action: (navigate) => navigate('/missions') },
  { key: 'n c', description: 'shortcuts.new_candidate', action: (navigate) => navigate('/candidates/new') },
  { key: 'n m', description: 'shortcuts.new_mission', action: (navigate) => navigate('/missions/new') },
  { key: '/', description: 'shortcuts.focus_search', action: () => document.querySelector('.search-basic input')?.focus() },
  { key: 't', description: 'shortcuts.toggle_theme', action: (_, toggleTheme) => toggleTheme() },
  { key: '?', description: 'shortcuts.show_help', action: (_, __, toggleShortcutsModal) => toggleShortcutsModal() },
  { key: 'esc', description: 'shortcuts.close_modal', action: (_, __, toggleShortcutsModal) => toggleShortcutsModal(false) }
];

function KeyboardShortcuts() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [keysPressed, setKeysPressed] = useState(new Set());
  const [lastKeyTime, setLastKeyTime] = useState(0);

  const toggleShortcutsModal = (show = true) => {
    setShowShortcutsModal(show);
  };

  useEffect(() => {
    // Gestionnaire de touches
    const handleKeyDown = (e) => {
      // Ignorer si nous sommes dans un champ de saisie, à l'exception de la touche Échap
      if (
        e.key !== 'Escape' &&
        (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable)
      ) {
        return;
      }

      // Réinitialiser la séquence si trop de temps s'est écoulé depuis la dernière touche
      const now = Date.now();
      if (now - lastKeyTime > 1000) {
        setKeysPressed(new Set());
      }
      setLastKeyTime(now);

      // Ajouter la touche actuelle à l'ensemble des touches pressées
      const currentKey = e.key.toLowerCase();
      const updatedKeys = new Set(keysPressed);
      updatedKeys.add(currentKey);
      setKeysPressed(updatedKeys);

      // Vérifier si la séquence de touches correspond à un raccourci
      const pressedKeyStr = Array.from(updatedKeys).join(' ');
      
      SHORTCUTS.forEach((shortcut) => {
        // Vérifier si le raccourci est activé
        if (
          shortcut.key === pressedKeyStr ||
          (shortcut.key === 'esc' && currentKey === 'escape') ||
          (shortcut.key === '/' && currentKey === '/')
        ) {
          // Réinitialiser les touches pressées
          setKeysPressed(new Set());
          
          // Exécuter l'action du raccourci
          shortcut.action(navigate, toggleTheme, toggleShortcutsModal);
          
          e.preventDefault();
        }
      });
    };

    // Gestionnaire de relâchement de touches
    const handleKeyUp = (e) => {
      const currentKey = e.key.toLowerCase();
      const updatedKeys = new Set(keysPressed);
      updatedKeys.delete(currentKey);
      setKeysPressed(updatedKeys);
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keysPressed, lastKeyTime, navigate, toggleTheme, toggleShortcutsModal]);

  return (
    <>
      {showShortcutsModal && <ShortcutsModal onClose={() => toggleShortcutsModal(false)} />}
    </>
  );
}

function ShortcutsModal({ onClose }) {
  const { t } = useTranslation();

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('shortcuts.title')}</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <p className="shortcut-description">{t('shortcuts.description')}</p>
          
          <h3>{t('shortcuts.navigation')}</h3>
          <div className="shortcuts-grid">
            {SHORTCUTS.filter(s => s.key.startsWith('g')).map((shortcut, index) => (
              <div key={index} className="shortcut-item">
                <div className="shortcut-keys">
                  {shortcut.key.split(' ').map((k, i) => (
                    <React.Fragment key={i}>
                      <kbd>{k}</kbd>
                      {i < shortcut.key.split(' ').length - 1 && <span> + </span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="shortcut-label">{t(shortcut.description)}</div>
              </div>
            ))}
          </div>
          
          <h3>{t('shortcuts.actions')}</h3>
          <div className="shortcuts-grid">
            {SHORTCUTS.filter(s => !s.key.startsWith('g') && s.key !== 'esc').map((shortcut, index) => (
              <div key={index} className="shortcut-item">
                <div className="shortcut-keys">
                  {shortcut.key.split(' ').map((k, i) => (
                    <React.Fragment key={i}>
                      <kbd>{k}</kbd>
                      {i < shortcut.key.split(' ').length - 1 && <span> + </span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="shortcut-label">{t(shortcut.description)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <p>{t('shortcuts.press_escape')}</p>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default KeyboardShortcuts;
