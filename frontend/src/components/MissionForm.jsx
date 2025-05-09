import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function MissionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    function: '',
    sector: '',
    location: '',
    salary_range: '',
    start_date: '',
    status: 'Actif',
    client_contact_name: '',
    client_contact_email: '',
    client_contact_phone: '',
    priority: 'Normal',
    recruitment_steps: []
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [functionOptions, setFunctionOptions] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  
  useEffect(() => {
    // Charger les données existantes si en mode édition
    if (isEditing) {
      fetchMission();
    }
    
    // Récupérer les options pour fonction et secteur
    fetchOptions();
  }, [id]);
  
  const fetchMission = async () => {
    try {
      const response = await axios.get(`/api/missions/${id}`);
      // Format date for input field
      const mission = response.data;
      if (mission.start_date) {
        mission.start_date = mission.start_date.split('T')[0]; // Format YYYY-MM-DD
      }
      setFormData(mission);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement de la mission:', error);
      setError('Impossible de charger les données de la mission');
      setLoading(false);
    }
  };
  
  const fetchOptions = async () => {
    try {
      const response = await axios.get('/api/candidates');
      
      // Extract unique functions and sectors
      const functions = [...new Set(response.data
        .map(candidate => candidate.function)
        .filter(Boolean))];
      
      const sectors = [...new Set(response.data
        .map(candidate => candidate.sector)
        .filter(Boolean))];
      
      setFunctionOptions(functions);
      setSectorOptions(sectors);
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await axios.put(`/api/missions/${id}`, formData);
      } else {
        await axios.post('/api/missions', formData);
      }
      
      navigate('/missions');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la mission:', error);
      setError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    }
  };
  
  const addRecruitmentStep = () => {
    const newStep = {
      name: '',
      description: '',
      order: formData.recruitment_steps.length
    };
    
    setFormData({
      ...formData,
      recruitment_steps: [...formData.recruitment_steps, newStep]
    });
  };
  
  const updateRecruitmentStep = (index, field, value) => {
    const updatedSteps = [...formData.recruitment_steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      recruitment_steps: updatedSteps
    });
  };
  
  const removeRecruitmentStep = (index) => {
    const updatedSteps = formData.recruitment_steps.filter((_, i) => i !== index);
    // Réordonner les étapes
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      order: i
    }));
    
    setFormData({
      ...formData,
      recruitment_steps: reorderedSteps
    });
  };
  
  if (loading) {
    return (
      <div className="loading-spinner">
        <i className="fas fa-spinner"></i>
        <p>Chargement des données...</p>
      </div>
    );
  }
  
  return (
    <div className="mission-form-container">
      <h1>{isEditing ? 'Modifier la mission' : 'Nouvelle mission'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="mission-form">
        <div className="form-section">
          <h2 className="section-title">
            <i className="fas fa-info-circle"></i>
            <span>Informations générales</span>
          </h2>
          
          <div className="form-group">
            <label htmlFor="title">Titre du poste *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="ex: Développeur Full Stack React/Node.js"
              className="form-control"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="client">Client / Entreprise</label>
              <input
                type="text"
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                placeholder="ex: Acme Inc."
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Localisation</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="ex: Paris, France"
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="function">Fonction</label>
              <input
                type="text"
                id="function"
                name="function"
                value={formData.function}
                onChange={handleChange}
                list="function-options"
                placeholder="ex: Développeur, Consultant, Manager..."
                className="form-control"
              />
              <datalist id="function-options">
                {functionOptions.map((option, index) => (
                  <option key={index} value={option} />
                ))}
              </datalist>
            </div>
            
            <div className="form-group">
              <label htmlFor="sector">Secteur</label>
              <input
                type="text"
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                list="sector-options"
                placeholder="ex: Finance, IT, Immobilier..."
                className="form-control"
              />
              <datalist id="sector-options">
                {sectorOptions.map((option, index) => (
                  <option key={index} value={option} />
                ))}
              </datalist>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary_range">Fourchette de salaire</label>
              <input
                type="text"
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                placeholder="ex: 45-60K€"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="start_date">Date de début</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Statut</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Actif">Actif</option>
                <option value="En pause">En pause</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priorité</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Basse">Basse</option>
                <option value="Normal">Normal</option>
                <option value="Haute">Haute</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description du poste</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Décrivez le poste, les responsabilités, les compétences requises, etc."
              className="form-control"
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h2 className="section-title">
            <i className="fas fa-address-card"></i>
            <span>Contact client</span>
          </h2>
          
          <div className="form-group">
            <label htmlFor="client_contact_name">Nom du contact</label>
            <input
              type="text"
              id="client_contact_name"
              name="client_contact_name"
              value={formData.client_contact_name}
              onChange={handleChange}
              placeholder="ex: Jean Dupont"
              className="form-control"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="client_contact_email">Email</label>
              <input
                type="email"
                id="client_contact_email"
                name="client_contact_email"
                value={formData.client_contact_email}
                onChange={handleChange}
                placeholder="ex: jean.dupont@entreprise.com"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="client_contact_phone">Téléphone</label>
              <input
                type="text"
                id="client_contact_phone"
                name="client_contact_phone"
                value={formData.client_contact_phone}
                onChange={handleChange}
                placeholder="ex: 01 23 45 67 89"
                className="form-control"
              />
            </div>
          </div>
        </div>
        
        {/* Étapes du processus de recrutement - uniquement pour la création */}
        {!isEditing && (
          <div className="form-section">
            <h2 className="section-title">
              <i className="fas fa-tasks"></i>
              <span>Étapes du processus de recrutement</span>
            </h2>
            
            <p className="help-text">
              Vous pouvez personnaliser les étapes ou laisser les étapes par défaut 
              (CV, Entretien téléphonique, Entretien client, Test, Offre, Embauche)
            </p>
            
            {formData.recruitment_steps.length > 0 && (
              <div className="recruitment-steps-list">
                {formData.recruitment_steps.map((step, index) => (
                  <div key={index} className="recruitment-step-item">
                    <div className="step-order">{index + 1}</div>
                    
                    <div className="step-content">
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => updateRecruitmentStep(index, 'name', e.target.value)}
                        placeholder="Nom de l'étape"
                        className="form-control"
                      />
                      
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => updateRecruitmentStep(index, 'description', e.target.value)}
                        placeholder="Description (optionnelle)"
                        className="form-control"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeRecruitmentStep(index)}
                      className="btn-icon btn-danger"
                      title="Supprimer cette étape"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button
              type="button"
              onClick={addRecruitmentStep}
              className="btn btn-outline mt-2"
            >
              <i className="fas fa-plus"></i>
              <span>Ajouter une étape</span>
            </button>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/missions')}
            className="btn btn-outline"
          >
            Annuler
          </button>
          
          <button type="submit" className="btn">
            {isEditing ? 'Enregistrer les modifications' : 'Créer la mission'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MissionForm;
