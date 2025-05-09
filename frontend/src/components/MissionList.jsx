import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MissionList() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('/api/missions');
        setMissions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des missions:', error);
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      try {
        await axios.delete(`/api/missions/${id}`);
        setMissions(missions.filter(mission => mission.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de la mission:', error);
      }
    }
  };

  // Filtrage des missions
  const filteredMissions = missions.filter(mission => {
    const matchesSearch = (
      mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mission.client && mission.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mission.function && mission.function.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mission.location && mission.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesStatus = statusFilter ? mission.status === statusFilter : true;
    const matchesPriority = priorityFilter ? mission.priority === priorityFilter : true;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Options pour les filtres
  const statusOptions = ['Actif', 'En pause', 'Terminé'];
  const priorityOptions = ['Basse', 'Normal', 'Haute', 'Urgente'];

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Basse': return 'priority-low';
      case 'Haute': return 'priority-high';
      case 'Urgente': return 'priority-urgent';
      default: return 'priority-normal';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Actif': return 'status-active';
      case 'En pause': return 'status-paused';
      case 'Terminé': return 'status-completed';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-spinner"></i>
        <p>Chargement des missions...</p>
      </div>
    );
  }

  return (
    <div className="mission-list-container">
      <div className="missions-header">
        <h1>Missions de recrutement</h1>
        <Link to="/missions/new" className="btn">
          <i className="fas fa-plus"></i>
          <span>Nouvelle mission</span>
        </Link>
      </div>

      <div className="search-filters-container">
        <div className="search-input-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Rechercher une mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-container">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les priorités</option>
            {priorityOptions.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredMissions.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-briefcase-medical"></i>
          <p>Aucune mission trouvée</p>
          <Link to="/missions/new" className="btn">
            <i className="fas fa-plus"></i>
            <span>Créer une mission</span>
          </Link>
        </div>
      ) : (
        <div className="missions-grid">
          {filteredMissions.map(mission => (
            <div key={mission.id} className="mission-card">
              <div className="mission-card-header">
                <span className={`mission-status ${getStatusClass(mission.status)}`}>
                  {mission.status}
                </span>
                <span className={`mission-priority ${getPriorityClass(mission.priority)}`}>
                  {mission.priority}
                </span>
              </div>
              
              <h3 className="mission-title">{mission.title}</h3>
              
              <div className="mission-info">
                {mission.client && (
                  <div className="mission-info-item">
                    <i className="fas fa-building"></i>
                    <span>{mission.client}</span>
                  </div>
                )}
                
                {mission.function && (
                  <div className="mission-info-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{mission.function}</span>
                  </div>
                )}
                
                {mission.location && (
                  <div className="mission-info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{mission.location}</span>
                  </div>
                )}
                
                <div className="mission-info-item">
                  <i className="fas fa-users"></i>
                  <span>{mission.candidates ? mission.candidates.length : 0} candidats</span>
                </div>
              </div>
              
              <div className="mission-actions">
                <Link to={`/missions/${mission.id}`} className="btn btn-outline">
                  <i className="fas fa-eye"></i>
                  <span>Détails</span>
                </Link>
                <Link to={`/missions/${mission.id}/edit`} className="btn btn-outline">
                  <i className="fas fa-edit"></i>
                  <span>Modifier</span>
                </Link>
                <button 
                  onClick={() => handleDelete(mission.id)} 
                  className="btn btn-outline btn-danger"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MissionList;
