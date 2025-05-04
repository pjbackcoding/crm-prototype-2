import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await axios.get(`/api/candidates/${id}`);
        setCandidate(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError('Impossible de charger les informations du candidat.');
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      try {
        await axios.delete(`/api/candidates/${id}`);
        navigate('/candidates');
      } catch (err) {
        console.error('Error deleting candidate:', err);
        setError('Erreur lors de la suppression du candidat.');
      }
    }
  };

  if (loading) {
    return <div className="card text-center">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="card text-center" style={{ color: 'var(--danger)' }}>
        {error}
        <div className="mt-2">
          <Link to="/candidates" className="btn">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="card text-center">
        Candidat non trouvé.
        <div className="mt-2">
          <Link to="/candidates" className="btn">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-detail-page">
      <div className="flex flex-between mb-2">
        <h1>Profil du candidat</h1>
        <div>
          <Link 
            to={`/candidates/${id}/edit`} 
            className="btn"
            style={{ marginRight: '0.5rem' }}
          >
            Modifier
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Supprimer
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {candidate.first_name} {candidate.name}
          </h2>
          {candidate.function && (
            <span className="badge">{candidate.function}</span>
          )}
        </div>

        <div className="flex" style={{ gap: '1rem', margin: '1rem 0' }}>
          {candidate.email && (
            <div>
              <strong>Email:</strong> {candidate.email}
            </div>
          )}
          {candidate.phone && (
            <div>
              <strong>Téléphone:</strong> {candidate.phone}
            </div>
          )}
          {candidate.sector && (
            <div>
              <strong>Secteur:</strong> {candidate.sector}
            </div>
          )}
        </div>

        {candidate.skills && (
          <div className="mb-2">
            <h3>Compétences</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{candidate.skills}</p>
          </div>
        )}

        {candidate.experience && (
          <div className="mb-2">
            <h3>Expérience professionnelle</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{candidate.experience}</p>
          </div>
        )}

        {candidate.education && (
          <div className="mb-2">
            <h3>Formation</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{candidate.education}</p>
          </div>
        )}

        {candidate.notes && (
          <div className="mb-2">
            <h3>Notes additionnelles</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{candidate.notes}</p>
          </div>
        )}

        <div className="text-right mt-2">
          <Link to="/candidates" className="btn btn-outline">
            Retour à la liste
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CandidateDetail;
