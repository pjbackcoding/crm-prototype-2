import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">CRM Recrutement</Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Tableau de bord</Link>
          <Link to="/candidates" className="nav-link">Candidats</Link>
          <Link to="/candidates/new" className="nav-link">Nouveau candidat</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
