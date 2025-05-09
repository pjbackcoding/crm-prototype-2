import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SearchInterface from './SearchInterface';

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    sectorStats: {},
    functionStats: {},
    recentCandidates: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/candidates');
        const candidates = response.data;
        
        // Calculer les statistiques par secteur et fonction
        const sectorStats = {};
        const functionStats = {};
        
        candidates.forEach(candidate => {
          if (candidate.sector) {
            sectorStats[candidate.sector] = (sectorStats[candidate.sector] || 0) + 1;
          }
          
          if (candidate.function) {
            functionStats[candidate.function] = (functionStats[candidate.function] || 0) + 1;
          }
        });
        
        setStats({
          totalCandidates: candidates.length,
          sectorStats,
          functionStats,
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
    return (
      <div className="card text-center loading-spinner">
        <i className="fas fa-spinner"></i>
        <p>Chargement des données...</p>
      </div>
    );
  }

  // Récupérer les 3 premiers secteurs d'activité
  const topSectors = Object.entries(stats.sectorStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
    
  // Récupérer les 3 premières fonctions
  const topFunctions = Object.entries(stats.functionStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="mb-2">{t('dashboard.title')}</h1>
        <Link to="/candidates/new" className="btn">
          <i className="fas fa-plus"></i>
          <span>{t('dashboard.add_candidate')}</span>
        </Link>
      </div>
      
      {/* Interface de recherche avancée */}
      <SearchInterface />
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalCandidates}</h3>
            <p className="stat-label">{t('dashboard.total_candidates')}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-building"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{Object.keys(stats.sectorStats).length}</h3>
            <p className="stat-label">{t('dashboard.sectors')}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{Object.keys(stats.functionStats).length}</h3>
            <p className="stat-label">{t('dashboard.functions')}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-user-clock"></i>
            <span>{t('dashboard.recent_candidates')}</span>
          </h2>
          <Link to="/candidates" className="btn btn-outline">
            <i className="fas fa-list"></i>
            <span>{t('dashboard.see_all')}</span>
          </Link>
        </div>
        
        {stats.recentCandidates.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users-slash"></i>
            <p>{t('candidates.no_candidates')}</p>
            <Link to="/candidates/new" className="btn">
              <i className="fas fa-user-plus"></i>
              <span>{t('candidates.add_candidate')}</span>
            </Link>
          </div>
        ) : (
          <div className="candidate-list">
            {stats.recentCandidates.map(candidate => (
              <div key={candidate.id} className="candidate-item">
                <div className="candidate-info">
                  <div className="candidate-avatar">
                    {candidate.first_name && candidate.name ? (
                      `${candidate.first_name.charAt(0)}${candidate.name.charAt(0)}`
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>
                  <div>
                    <div className="candidate-name">
                      {candidate.first_name} {candidate.name}
                    </div>
                    <div className="candidate-details">
                      {candidate.function && (
                        <span><i className="fas fa-briefcase"></i> {candidate.function}</span>
                      )}
                      {candidate.sector && (
                        <span><i className="fas fa-building"></i> {candidate.sector}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="candidate-actions">
                  <Link to={`/candidates/${candidate.id}`} className="btn btn-outline">
                    <i className="fas fa-eye"></i>
                    <span>Voir</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="dashboard-two-columns">
        {/* Top Sectors */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-chart-pie"></i>
              <span>{t('dashboard.main_sectors')}</span>
            </h2>
          </div>
          
          {topSectors.length === 0 ? (
            <p className="text-center mt-2">{t('dashboard.no_data')}</p>
          ) : (
            <div className="stats-list">
              {topSectors.map(([sector, count], index) => (
                <div key={index} className="stats-item">
                  <div className="stats-info">
                    <div className="stats-label">{sector}</div>
                    <div className="stats-bar-container">
                      <div 
                        className="stats-bar" 
                        style={{ width: `${(count / stats.totalCandidates) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="stats-count">{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Top Functions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-briefcase"></i>
              <span>{t('dashboard.main_functions')}</span>
            </h2>
          </div>
          
          {topFunctions.length === 0 ? (
            <p className="text-center mt-2">{t('dashboard.no_data')}</p>
          ) : (
            <div className="stats-list">
              {topFunctions.map(([func, count], index) => (
                <div key={index} className="stats-item">
                  <div className="stats-info">
                    <div className="stats-label">{func}</div>
                    <div className="stats-bar-container">
                      <div 
                        className="stats-bar" 
                        style={{ width: `${(count / stats.totalCandidates) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="stats-count">{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
