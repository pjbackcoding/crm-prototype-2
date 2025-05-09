import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './theme.jsx';
import { ToastProvider } from './components/ToastNotification';
import './styles.css';
import './styles-missions.css';
import './language-switcher.css';
import './search-interface.css';
import './theme.css';
import './toast-notification.css';
import './skeleton-loader.css';
import './keyboard-shortcuts.css';
import './context-sidebar.css';
// Import i18n configuration
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
