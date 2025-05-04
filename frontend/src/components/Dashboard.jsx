import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    recentCandidates: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/candidates');
        const candidates = response.data;
        
        setStats({
          totalCandidates: candidates.length,
          recentCandidates: candidates.slice(0, 5) // Get 5 most recent candidates
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="card text-center">Chargement...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="mb-2">Tableau de bord</h1>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Statistiques</h2>
        </div>
        <div className="flex">
          <div className="card" style={{ flex: 1, margin: '0 0.5rem 0 0' }}>
            <h3>{stats.totalCandidates}</h3>
            <p>Candidats au total</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Derniers candidats ajoutés</h2>
          <Link to="/candidates" className="btn btn-outline">Voir tous</Link>
        </div>
        
        {stats.recentCandidates.length === 0 ? (
          <p>Aucun candidat dans la base de données.</p>
        ) : (
          <div className="candidate-list">
            {stats.recentCandidates.map(candidate => (
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
                  </div>
                </div>
                <div className="candidate-actions">
                  <Link to={`/candidates/${candidate.id}`} className="btn btn-outline">
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Actions rapides</h2>
        </div>
        <div className="mt-1">
          <Link to="/candidates/new" className="btn">
            Ajouter un candidat
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
