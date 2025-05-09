import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

// Contexte pour les toast notifications
const ToastContext = createContext();

// Types de toast
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Provider pour les toast notifications
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { t } = useTranslation();

  // Fonction pour ajouter un toast
  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    return id;
  };

  // Fonction pour supprimer un toast
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Raccourcis pour différents types de toasts
  const success = (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration);
  const error = (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration);
  const info = (message, duration) => addToast(message, TOAST_TYPES.INFO, duration);
  const warning = (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration);

  // Messages prédéfinis
  const savedSuccess = () => success(t('notifications.saved_success'));
  const saveError = () => error(t('notifications.save_error'));
  const deletedSuccess = () => success(t('notifications.deleted_success'));
  const deleteError = () => error(t('notifications.delete_error'));
  const loadingError = () => error(t('notifications.loading_error'));

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        success,
        error,
        info,
        warning,
        savedSuccess,
        saveError,
        deletedSuccess,
        deleteError,
        loadingError,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook personnalisé pour utiliser les toasts
export function useToast() {
  return useContext(ToastContext);
}

// Conteneur de toasts
function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;

  // Crée un portail pour rendre les toasts en dehors de la hiérarchie DOM normale
  return createPortal(
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>,
    document.body
  );
}

// Composant Toast individuel
function Toast({ toast, removeToast }) {
  const { id, message, type, duration } = toast;

  // Auto-suppression après la durée spécifiée
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  // Déterminer l'icône en fonction du type
  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return <i className="fas fa-check-circle"></i>;
      case TOAST_TYPES.ERROR:
        return <i className="fas fa-exclamation-circle"></i>;
      case TOAST_TYPES.WARNING:
        return <i className="fas fa-exclamation-triangle"></i>;
      case TOAST_TYPES.INFO:
      default:
        return <i className="fas fa-info-circle"></i>;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={() => removeToast(id)}
        aria-label="Close"
      >
        <i className="fas fa-times"></i>
      </button>
      <div 
        className="toast-progress" 
        style={{ animationDuration: `${duration}ms` }}
      ></div>
    </div>
  );
}

export default ToastProvider;
