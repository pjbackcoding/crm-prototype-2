import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CandidateList from './components/CandidateList';
import CandidateForm from './components/CandidateForm';
import CandidateDetail from './components/CandidateDetail';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidates/new" element={<CandidateForm />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/candidates/:id/edit" element={<CandidateForm />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
