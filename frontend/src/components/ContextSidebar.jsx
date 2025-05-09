import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ContextSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [helpContent, setHelpContent] = useState([]);

  // Définir le contenu d'aide en fonction du chemin actuel
  useEffect(() => {
    setCurrentPath(location.pathname);
    
    // Réinitialiser le contenu d'aide
    setHelpContent([]);
    
    // Déterminer le contenu d'aide en fonction du chemin
    if (location.pathname === '/') {
      setHelpContent([
        {
          title: t('context_help.dashboard.title'),
          icon: 'chart-line',
          content: t('context_help.dashboard.content'),
          tips: [
            { text: t('context_help.dashboard.tip1'), icon: 'lightbulb' },
            { text: t('context_help.dashboard.tip2'), icon: 'search' },
            { text: t('context_help.dashboard.tip3'), icon: 'chart-pie' }
          ]
        }
      ]);
    } else if (location.pathname.includes('/candidates')) {
      if (location.pathname.includes('/new') || location.pathname.includes('/edit')) {
        setHelpContent([
          {
            title: t('context_help.candidate_form.title'),
            icon: 'user-edit',
            content: t('context_help.candidate_form.content'),
            tips: [
              { text: t('context_help.candidate_form.tip1'), icon: 'save' },
              { text: t('context_help.candidate_form.tip2'), icon: 'tags' },
              { text: t('context_help.candidate_form.tip3'), icon: 'paperclip' }
            ],
            shortcuts: [
              { key: 'Ctrl + S', action: t('context_help.shortcuts_actions.save') },
              { key: 'Esc', action: t('context_help.shortcuts_actions.cancel') }
            ]
          }
        ]);
      } else if (location.pathname.match(/\/candidates\/\d+/)) {
        setHelpContent([
          {
            title: t('context_help.candidate_detail.title'),
            icon: 'user',
            content: t('context_help.candidate_detail.content'),
            tips: [
              { text: t('context_help.candidate_detail.tip1'), icon: 'edit' },
              { text: t('context_help.candidate_detail.tip2'), icon: 'calendar-alt' },
              { text: t('context_help.candidate_detail.tip3'), icon: 'briefcase' }
            ]
          }
        ]);
      } else {
        setHelpContent([
          {
            title: t('context_help.candidate_list.title'),
            icon: 'users',
            content: t('context_help.candidate_list.content'),
            tips: [
              { text: t('context_help.candidate_list.tip1'), icon: 'filter' },
              { text: t('context_help.candidate_list.tip2'), icon: 'sort' },
              { text: t('context_help.candidate_list.tip3'), icon: 'user-plus' }
            ],
            shortcuts: [
              { key: '/', action: t('context_help.shortcuts_actions.search') },
              { key: 'n c', action: t('context_help.shortcuts_actions.new_candidate') }
            ]
          }
        ]);
      }
    } else if (location.pathname.includes('/missions')) {
      if (location.pathname.includes('/new') || location.pathname.includes('/edit')) {
        setHelpContent([
          {
            title: t('context_help.mission_form.title'),
            icon: 'briefcase',
            content: t('context_help.mission_form.content'),
            tips: [
              { text: t('context_help.mission_form.tip1'), icon: 'save' },
              { text: t('context_help.mission_form.tip2'), icon: 'tasks' },
              { text: t('context_help.mission_form.tip3'), icon: 'user-friends' }
            ],
            shortcuts: [
              { key: 'Ctrl + S', action: t('context_help.shortcuts_actions.save') },
              { key: 'Esc', action: t('context_help.shortcuts_actions.cancel') }
            ]
          }
        ]);
      } else if (location.pathname.match(/\/missions\/\d+/)) {
        setHelpContent([
          {
            title: t('context_help.mission_detail.title'),
            icon: 'briefcase',
            content: t('context_help.mission_detail.content'),
            tips: [
              { text: t('context_help.mission_detail.tip1'), icon: 'edit' },
              { text: t('context_help.mission_detail.tip2'), icon: 'user-plus' },
              { text: t('context_help.mission_detail.tip3'), icon: 'clipboard-list' }
            ]
          }
        ]);
      } else {
        setHelpContent([
          {
            title: t('context_help.mission_list.title'),
            icon: 'briefcase',
            content: t('context_help.mission_list.content'),
            tips: [
              { text: t('context_help.mission_list.tip1'), icon: 'filter' },
              { text: t('context_help.mission_list.tip2'), icon: 'sort' },
              { text: t('context_help.mission_list.tip3'), icon: 'plus' }
            ],
            shortcuts: [
              { key: '/', action: t('context_help.shortcuts_actions.search') },
              { key: 'n m', action: t('context_help.shortcuts_actions.new_mission') }
            ]
          }
        ]);
      }
    }
  }, [location.pathname, t]);

  return (
    <>
      {/* Bouton pour ouvrir/fermer la barre latérale */}
      <button 
        className={`context-help-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('context_help.close') : t('context_help.open')}
        title={isOpen ? t('context_help.close') : t('context_help.open')}
      >
        <i className={`fas fa-${isOpen ? 'times' : 'question-circle'}`}></i>
      </button>
      
      {/* Barre latérale contextuelle */}
      <div className={`context-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="context-sidebar-header">
          <h2>
            <i className="fas fa-question-circle"></i>
            <span>{t('context_help.title')}</span>
          </h2>
          <button 
            className="context-sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label={t('context_help.close')}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="context-sidebar-content">
          {helpContent.length > 0 ? (
            helpContent.map((section, index) => (
              <div key={index} className="context-help-section">
                <div className="context-help-section-header">
                  <i className={`fas fa-${section.icon}`}></i>
                  <h3>{section.title}</h3>
                </div>
                
                <p className="context-help-section-content">{section.content}</p>
                
                {section.tips && section.tips.length > 0 && (
                  <div className="context-help-tips">
                    <h4>{t('context_help.tips_section')}</h4>
                    <ul>
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex}>
                          <i className={`fas fa-${tip.icon}`}></i>
                          <span>{tip.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {section.shortcuts && section.shortcuts.length > 0 && (
                  <div className="context-help-shortcuts">
                    <h4>{t('context_help.shortcuts_section')}</h4>
                    <ul>
                      {section.shortcuts.map((shortcut, shortcutIndex) => (
                        <li key={shortcutIndex}>
                          <kbd>{shortcut.key}</kbd>
                          <span>{shortcut.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="context-help-empty">
              <i className="fas fa-info-circle"></i>
              <p>{t('context_help.no_content')}</p>
            </div>
          )}
        </div>
        
        <div className="context-sidebar-footer">
          <p>{t('context_help.keyboard_shortcut')}: <kbd>?</kbd></p>
        </div>
      </div>
    </>
  );
}

export default ContextSidebar;
