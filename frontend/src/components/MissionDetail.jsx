import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidateLoading, setCandidateLoading] = useState(false);
  
  useEffect(() => {
    fetchMission();
    fetchAllCandidates();
  }, [id]);
  
  const fetchMission = async () => {
    try {
      const response = await axios.get(`/api/missions/${id}`);
      setMission(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement de la mission:', error);
      setLoading(false);
    }
  };
  
  const fetchAllCandidates = async () => {
    try {
      const response = await axios.get('/api/candidates');
      setCandidates(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des candidats:', error);
    }
  };
  
  useEffect(() => {
    if (mission && candidates.length > 0) {
      // Filtrer les candidats qui ne sont pas déjà associés à la mission
      const missionCandidateIds = mission.candidates.map(c => c.id);
      const available = candidates.filter(c => !missionCandidateIds.includes(c.id));
      setAvailableCandidates(available);
    }
  }, [mission, candidates]);
  
  const handleAddCandidate = async () => {
    if (!selectedCandidate) return;
    
    setCandidateLoading(true);
    try {
      await axios.post(`/api/missions/${id}/candidates/${selectedCandidate}`, {
        status: 'En cours'
      });
      fetchMission(); // Recharger la mission pour voir le candidat ajouté
      setSelectedCandidate('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du candidat:', error);
    } finally {
      setCandidateLoading(false);
    }
  };
  
  const handleRemoveCandidate = async (candidateId) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce candidat de la mission ?')) {
      try {
        await axios.delete(`/api/missions/${id}/candidates/${candidateId}`);
        fetchMission(); // Recharger la mission
      } catch (error) {
        console.error('Erreur lors du retrait du candidat:', error);
      }
    }
  };
  
  const updateCandidateStep = async (stepId, candidateId, status) => {
    try {
      // D'abord, récupérer l'étape du candidat actuelle
      const stepResponse = await axios.get(`/api/steps/${stepId}/candidates/${candidateId}`);
      const candidateStep = stepResponse.data;
      
      // Mettre à jour le statut
      await axios.put(`/api/candidate-steps/${candidateStep.id}`, {
        status: status
      });
      
      // Recharger la mission pour voir les changements
      fetchMission();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };
  
  const filteredCandidates = mission?.candidates.filter(candidate => 
    (candidate.first_name && candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (candidate.name && candidate.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (candidate.function && candidate.function.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (candidate.email && candidate.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-spinner"></i>
        <p>Chargement de la mission...</p>
      </div>
    );
  }
  
  if (!mission) {
    return <div className="error-message">Mission non trouvée</div>;
  }
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'Actif': return 'status-active';
      case 'En pause': return 'status-paused';
      case 'Terminé': return 'status-completed';
      default: return '';
    }
  };
  
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Basse': return 'priority-low';
      case 'Haute': return 'priority-high';
      case 'Urgente': return 'priority-urgent';
      default: return 'priority-normal';
    }
  };
  
  const getStepStatusClass = (status) => {
    switch (status) {
      case 'À faire': return 'step-todo';
      case 'En cours': return 'step-inprogress';
      case 'Terminé': return 'step-completed';
      case 'Rejeté': return 'step-rejected';
      default: return '';
    }
  };
  
  return (
    <div className="mission-detail-container">
      <div className="mission-detail-header">
        <div className="mission-title-wrapper">
          <h1>{mission.title}</h1>
          
          <div className="mission-badges">
            <span className={`mission-status ${getStatusClass(mission.status)}`}>
              {mission.status}
            </span>
            <span className={`mission-priority ${getPriorityClass(mission.priority)}`}>
              {mission.priority}
            </span>
          </div>
        </div>
        
        <div className="mission-actions">
          <Link to={`/missions/${id}/edit`} className="btn">
            <i className="fas fa-edit"></i>
            <span>Modifier</span>
          </Link>
        </div>
      </div>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <i className="fas fa-info-circle"></i>
          <span>Informations</span>
        </div>
        
        <div 
          className={`tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          <i className="fas fa-users"></i>
          <span>Candidats</span>
          <span className="tab-badge">{mission.candidates.length}</span>
        </div>
        
        <div 
          className={`tab ${activeTab === 'process' ? 'active' : ''}`}
          onClick={() => setActiveTab('process')}
        >
          <i className="fas fa-tasks"></i>
          <span>Processus de recrutement</span>
        </div>
      </div>
      
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="info-tab">
            <div className="mission-info-grid">
              {mission.client && (
                <div className="info-card">
                  <div className="info-icon">
                    <i className="fas fa-building"></i>
                  </div>
                  <div className="info-content">
                    <h3>Client</h3>
                    <p>{mission.client}</p>
                  </div>
                </div>
              )}
              
              {mission.function && (
                <div className="info-card">
                  <div className="info-icon">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div className="info-content">
                    <h3>Fonction</h3>
                    <p>{mission.function}</p>
                  </div>
                </div>
              )}
              
              {mission.sector && (
                <div className="info-card">
                  <div className="info-icon">
                    <i className="fas fa-chart-pie"></i>
                  </div>
                  <div className="info-content">
                    <h3>Secteur</h3>
                    <p>{mission.sector}</p>
                  </div>
                </div>
              )}
              
              {mission.location && (
                <div className="info-card">
                  <div className="info-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="info-content">
                    <h3>Localisation</h3>
                    <p>{mission.location}</p>
                  </div>
                </div>
              )}
              
              {mission.salary_range && (
                <div className="info-card">
                  <div className="info-icon">
                    <i className="fas fa-euro-sign"></i>
                  </div>
                  <div className="info-content">
                    <h3>Salaire</h3>
                    <p>{mission.salary_range}</p>
                  </div>
                </div>
              )}
              
              {mission.start_date && (
                <div className="info-card">
                  <div className="info-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="info-content">
                    <h3>Date de début</h3>
                    <p>{new Date(mission.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
            
            {mission.description && (
              <div className="description-section">
                <h2>Description du poste</h2>
                <div className="description-content">
                  <p>{mission.description}</p>
                </div>
              </div>
            )}
            
            {(mission.client_contact_name || mission.client_contact_email || mission.client_contact_phone) && (
              <div className="contact-section">
                <h2>Contact client</h2>
                <div className="contact-card">
                  {mission.client_contact_name && (
                    <div className="contact-item">
                      <i className="fas fa-user"></i>
                      <span>{mission.client_contact_name}</span>
                    </div>
                  )}
                  
                  {mission.client_contact_email && (
                    <div className="contact-item">
                      <i className="fas fa-envelope"></i>
                      <a href={`mailto:${mission.client_contact_email}`}>
                        {mission.client_contact_email}
                      </a>
                    </div>
                  )}
                  
                  {mission.client_contact_phone && (
                    <div className="contact-item">
                      <i className="fas fa-phone"></i>
                      <a href={`tel:${mission.client_contact_phone}`}>
                        {mission.client_contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'candidates' && (
          <div className="candidates-tab">
            <div className="add-candidate-section">
              <h2>Ajouter un candidat</h2>
              
              <div className="add-candidate-form">
                <select
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  className="form-control candidate-select"
                  disabled={candidateLoading || availableCandidates.length === 0}
                >
                  <option value="">Sélectionner un candidat</option>
                  {availableCandidates.map(candidate => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.first_name} {candidate.name} {candidate.function ? `(${candidate.function})` : ''}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleAddCandidate}
                  disabled={!selectedCandidate || candidateLoading}
                  className="btn"
                >
                  {candidateLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-plus"></i>
                  )}
                  <span>Ajouter</span>
                </button>
              </div>
              
              {availableCandidates.length === 0 && candidates.length > 0 && (
                <p className="help-text">Tous les candidats sont déjà associés à cette mission.</p>
              )}
            </div>
            
            <div className="candidates-list-section">
              <div className="candidates-header">
                <h2>Candidats associés ({mission.candidates.length})</h2>
                
                <div className="search-container">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              
              {mission.candidates.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-user-plus"></i>
                  <p>Aucun candidat associé à cette mission</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-search"></i>
                  <p>Aucun candidat ne correspond à votre recherche</p>
                </div>
              ) : (
                <div className="candidates-list">
                  {filteredCandidates.map(candidate => (
                    <div key={candidate.id} className="candidate-card">
                      <div className="candidate-info">
                        <div className="candidate-avatar">
                          {candidate.first_name && candidate.name ? (
                            `${candidate.first_name.charAt(0)}${candidate.name.charAt(0)}`
                          ) : (
                            <i className="fas fa-user"></i>
                          )}
                        </div>
                        
                        <div className="candidate-details">
                          <h3 className="candidate-name">
                            {candidate.first_name} {candidate.name}
                          </h3>
                          
                          <div className="candidate-meta">
                            {candidate.function && (
                              <span className="function-badge">
                                <i className="fas fa-briefcase"></i>
                                {candidate.function}
                              </span>
                            )}
                            
                            <span className={`status-badge ${candidate.candidature_status === 'En cours' ? 'status-active' : ''}`}>
                              {candidate.candidature_status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="candidate-card-actions">
                        <Link to={`/candidates/${candidate.id}`} className="btn btn-sm">
                          <i className="fas fa-eye"></i>
                        </Link>
                        
                        <button
                          onClick={() => handleRemoveCandidate(candidate.id)}
                          className="btn btn-sm btn-danger"
                          title="Retirer de la mission"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'process' && (
          <div className="process-tab">
            {mission.recruitment_steps.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-tasks"></i>
                <p>Aucune étape de recrutement définie</p>
                <button className="btn">
                  <i className="fas fa-plus"></i>
                  <span>Ajouter des étapes</span>
                </button>
              </div>
            ) : mission.candidates.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-users"></i>
                <p>Ajoutez des candidats pour suivre leur progression</p>
                <button className="btn" onClick={() => setActiveTab('candidates')}>
                  <i className="fas fa-user-plus"></i>
                  <span>Gérer les candidats</span>
                </button>
              </div>
            ) : (
              <div className="recruitment-progress">
                <div className="process-header">
                  <div className="steps-header">
                    <div className="step-name-header">Étapes</div>
                    {mission.candidates.map(candidate => (
                      <div key={candidate.id} className="candidate-column-header">
                        <div className="candidate-column-avatar">
                          {candidate.first_name && candidate.name ? (
                            `${candidate.first_name.charAt(0)}${candidate.name.charAt(0)}`
                          ) : (
                            <i className="fas fa-user"></i>
                          )}
                        </div>
                        <div className="candidate-column-name">
                          {candidate.first_name} {candidate.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="process-grid">
                  {mission.recruitment_steps.map(step => (
                    <div key={step.id} className="process-row">
                      <div className="step-name">
                        <span>{step.name}</span>
                        {step.description && (
                          <span className="step-description" title={step.description}>
                            <i className="fas fa-info-circle"></i>
                          </span>
                        )}
                      </div>
                      
                      {mission.candidates.map(candidate => {
                        // Trouver l'étape du candidat
                        const candidateStep = step.candidate_steps.find(
                          cs => cs.candidate_id === candidate.id
                        );
                        
                        return (
                          <div key={candidate.id} className="candidate-step-cell">
                            {candidateStep ? (
                              <div className="step-status-dropdown">
                                <select
                                  value={candidateStep.status}
                                  onChange={(e) => updateCandidateStep(step.id, candidate.id, e.target.value)}
                                  className={`step-status ${getStepStatusClass(candidateStep.status)}`}
                                >
                                  <option value="À faire">À faire</option>
                                  <option value="En cours">En cours</option>
                                  <option value="Terminé">Terminé</option>
                                  <option value="Rejeté">Rejeté</option>
                                </select>
                                
                                {candidateStep.completed_at && (
                                  <div className="step-date">
                                    {new Date(candidateStep.completed_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                className="btn btn-sm"
                                onClick={() => updateCandidateStep(step.id, candidate.id, 'À faire')}
                              >
                                Initialiser
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MissionDetail;
