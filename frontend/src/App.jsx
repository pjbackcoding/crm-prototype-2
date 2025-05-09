import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CandidateList from './components/CandidateList';
import CandidateForm from './components/CandidateForm';
import CandidateDetail from './components/CandidateDetail';
import MissionList from './components/MissionList';
import MissionForm from './components/MissionForm';
import MissionDetail from './components/MissionDetail';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ContextSidebar from './components/ContextSidebar';
import { useToast } from './components/ToastNotification';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const toast = useToast();
  
  // Effet pour afficher un message de bienvenue au chargement de l'application
  useEffect(() => {
    // Afficher un toast de bienvenue après un court délai
    const timer = setTimeout(() => {
      toast.info(t('notifications.welcome_back'));
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []); // Tableau de dépendances vide pour n'exécuter l'effet qu'une seule fois
  return (
    <div className="app">
      <Header />
      <main className="container">
        <KeyboardShortcuts />
        <ContextSidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidates/new" element={<CandidateForm />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/candidates/:id/edit" element={<CandidateForm />} />
          {/* Routes pour les missions */}
          <Route path="/missions" element={<MissionList />} />
          <Route path="/missions/new" element={<MissionForm />} />
          <Route path="/missions/:id" element={<MissionDetail />} />
          <Route path="/missions/:id/edit" element={<MissionForm />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
