import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [functionFilter, setFunctionFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  
  // Fetch candidates with search filters
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (searchTerm) params.append('search', searchTerm);
        if (functionFilter) params.append('function', functionFilter);
        if (sectorFilter) params.append('sector', sectorFilter);
        
        const response = await axios.get(`/api/candidates?${params.toString()}`);
        setCandidates(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Erreur lors du chargement des candidats. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [searchTerm, functionFilter, sectorFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      try {
        await axios.delete(`/api/candidates/${id}`);
        setCandidates(candidates.filter(candidate => candidate.id !== id));
      } catch (err) {
        console.error('Error deleting candidate:', err);
        setError('Erreur lors de la suppression du candidat.');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is triggered by state changes via useEffect
  };

  return (
    <div className="candidate-page">
      <div className="flex flex-between mb-2">
        <h1>Gestion des candidats</h1>
        <Link to="/candidates/new" className="btn">+ Nouveau candidat</Link>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recherche de candidats</h2>
        </div>
        
        <form onSubmit={handleSearch} className="search-container">
          <div className="flex" style={{ gap: '1rem' }}>
            <div className="input-group" style={{ flex: 2 }}>
              <label htmlFor="searchTerm">Recherche</label>
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, prénom, compétences..."
              />
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="functionFilter">Fonction</label>
              <input
                type="text"
                id="functionFilter"
                value={functionFilter}
                onChange={(e) => setFunctionFilter(e.target.value)}
                placeholder="Ex: Développeur, Manager..."
              />
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="sectorFilter">Secteur</label>
              <input
                type="text"
                id="sectorFilter"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                placeholder="Ex: IT, Finance..."
              />
            </div>
          </div>
          
          <div>
            <button type="submit" className="btn">Rechercher</button>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ marginLeft: '0.5rem' }}
              onClick={() => {
                setSearchTerm('');
                setFunctionFilter('');
                setSectorFilter('');
              }}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className="card text-center">Chargement des candidats...</div>
      ) : error ? (
        <div className="card text-center" style={{ color: 'var(--danger)' }}>{error}</div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Liste des candidats ({candidates.length})</h2>
          </div>
          
          {candidates.length === 0 ? (
            <p className="text-center mt-2 mb-2">
              Aucun candidat trouvé.{' '}
              <Link to="/candidates/new">Ajouter un candidat</Link>
            </p>
          ) : (
            <div className="candidate-list">
              {candidates.map(candidate => (
                <div key={candidate.id} className="candidate-item">
                  <div className="candidate-info">
                    <div className="candidate-name">
                      {candidate.first_name} {candidate.name}
                    </div>
                    <div className="candidate-details">
                      {candidate.function && (
                        <span>{candidate.function}</span>
                      )}
                      {candidate.sector && (
                        <span>• {candidate.sector}</span>
                      )}
                      {candidate.email && (
                        <span>• {candidate.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="candidate-actions">
                    <Link 
                      to={`/candidates/${candidate.id}`} 
                      className="btn btn-outline"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Détails
                    </Link>
                    <Link 
                      to={`/candidates/${candidate.id}/edit`} 
                      className="btn"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Modifier
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(candidate.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CandidateList;
