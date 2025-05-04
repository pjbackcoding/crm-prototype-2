import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function CandidateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    phone: '',
    email: '',
    skills: '',
    experience: '',
    education: '',
    function: '',
    sector: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Fetch candidate data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCandidate = async () => {
        try {
          const response = await axios.get(`/api/candidates/${id}`);
          setFormData(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching candidate:', err);
          setError('Impossible de charger les informations du candidat.');
          setLoading(false);
        }
      };
      
      fetchCandidate();
    }
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEditMode) {
        await axios.put(`/api/candidates/${id}`, formData);
      } else {
        await axios.post('/api/candidates', formData);
      }
      
      // Redirect after successful save
      navigate('/candidates');
    } catch (err) {
      console.error('Error saving candidate:', err);
      setError('Erreur lors de l\'enregistrement du candidat.');
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="card text-center">Chargement...</div>;
  }
  
  return (
    <div className="candidate-form-page">
      <h1>{isEditMode ? 'Modifier' : 'Ajouter'} un candidat</h1>
      
      {error && (
        <div className="card" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="flex" style={{ gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="name">Nom</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nom de famille"
              />
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="first_name">Prénom</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Prénom"
              />
            </div>
          </div>
          
          <div className="flex" style={{ gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="phone">Téléphone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Numéro de téléphone"
              />
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Adresse email"
              />
            </div>
          </div>
          
          <div className="flex" style={{ gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="function">Fonction</label>
              <input
                type="text"
                id="function"
                name="function"
                value={formData.function}
                onChange={handleChange}
                placeholder="Ex: Développeur Frontend, Chef de projet..."
              />
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label htmlFor="sector">Secteur</label>
              <input
                type="text"
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                placeholder="Ex: IT, Finance, Marketing..."
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="skills">Compétences</label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Liste des compétences (JavaScript, Management d'équipe, etc.)"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="experience">Expérience professionnelle</label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Expériences professionnelles détaillées"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="education">Formation</label>
            <textarea
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="Parcours de formation et diplômes"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="notes">Notes additionnelles</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Informations complémentaires, remarques personnelles..."
            />
          </div>
          
          <div className="flex flex-between mt-2">
            <Link to="/candidates" className="btn btn-outline">
              Annuler
            </Link>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CandidateForm;
