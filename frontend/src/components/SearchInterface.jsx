import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function SearchInterface() {
  const { t } = useTranslation();
  const [searchType, setSearchType] = useState('candidates');
  const [searchParams, setSearchParams] = useState({
    name: '',
    firstName: '',
    sectorCode: '',
    functionCode: '',
    companyName: '',
    missionTitle: '',
    missionClient: '',
    missionDate: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [filterError, setFilterError] = useState(false);

  // Fetch sectors and functions for dropdowns when advanced search is opened
  useEffect(() => {
    // Ne charge les filtres que lorsque l'utilisateur ouvre la recherche avancée
    // et que les filtres n'ont pas encore été chargés
    if (showAdvancedSearch && !filtersLoaded && !isLoadingFilters) {
      const fetchFilters = async () => {
        setIsLoadingFilters(true);
        setFilterError(false);
        try {
          const [sectorsResponse, functionsResponse] = await Promise.all([
            axios.get('/api/sectors'),
            axios.get('/api/functions')
          ]);
          setSectors(sectorsResponse.data || []);
          setFunctions(functionsResponse.data || []);
          setFiltersLoaded(true);
        } catch (error) {
          console.error('Error fetching filters:', error);
          setFilterError(true);
          // En cas d'erreur, initialiser avec des tableaux vides
          setSectors([]);
          setFunctions([]);
        } finally {
          setIsLoadingFilters(false);
        }
      };

      fetchFilters();
    }
  }, [showAdvancedSearch, filtersLoaded, isLoadingFilters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    // Reset results when changing search type
    setResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = searchType === 'candidates' ? '/api/candidates/search' : '/api/missions/search';
      const response = await axios.post(endpoint, searchParams);
      setResults(response.data);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };

  return (
    <div className="search-interface">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-search"></i>
            <span>{t('search.title')}</span>
          </h2>
        </div>
        <div className="card-body">
          <div className="search-type-toggle">
            <div className="toggle-group">
              <label className={`toggle-option ${searchType === 'candidates' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="searchType"
                  value="candidates"
                  checked={searchType === 'candidates'}
                  onChange={handleSearchTypeChange}
                />
                <span>{t('search.candidates')}</span>
              </label>
              <label className={`toggle-option ${searchType === 'missions' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="searchType"
                  value="missions"
                  checked={searchType === 'missions'}
                  onChange={handleSearchTypeChange}
                />
                <span>{t('search.missions')}</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="search-basic">
              {searchType === 'candidates' ? (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{t('candidates.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={searchParams.name}
                      onChange={handleInputChange}
                      placeholder={t('search.name_placeholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="firstName">{t('candidates.first_name')}</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={searchParams.firstName}
                      onChange={handleInputChange}
                      placeholder={t('search.first_name_placeholder')}
                    />
                  </div>
                </div>
              ) : (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="missionTitle">{t('missions.title')}</label>
                    <input
                      type="text"
                      id="missionTitle"
                      name="missionTitle"
                      value={searchParams.missionTitle}
                      onChange={handleInputChange}
                      placeholder={t('search.mission_title_placeholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="missionClient">{t('missions.client')}</label>
                    <input
                      type="text"
                      id="missionClient"
                      name="missionClient"
                      value={searchParams.missionClient}
                      onChange={handleInputChange}
                      placeholder={t('search.client_placeholder')}
                    />
                  </div>
                </div>
              )}

              <button 
                type="button" 
                className="btn-link toggle-advanced" 
                onClick={toggleAdvancedSearch}
              >
                {showAdvancedSearch ? (
                  <><i className="fas fa-chevron-up"></i> {t('search.hide_advanced')}</>
                ) : (
                  <><i className="fas fa-chevron-down"></i> {t('search.show_advanced')}</>
                )}
              </button>
            </div>

            {showAdvancedSearch && (
              <div className="search-advanced">
                {isLoadingFilters ? (
                  <div className="loading-filters">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>{t('search.loading_filters')}</span>
                  </div>
                ) : filterError ? (
                  <div className="filter-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{t('search.filter_error')}</span>
                  </div>
                ) : (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="sectorCode">{t('candidates.sector')}</label>
                      <select
                        id="sectorCode"
                        name="sectorCode"
                        value={searchParams.sectorCode}
                        onChange={handleInputChange}
                      >
                        <option value="">{t('search.all_sectors')}</option>
                        {sectors.map((sector, index) => (
                          <option key={sector.code || sector.id || index} value={sector.code || sector.id}>
                            {sector.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="functionCode">{t('candidates.function')}</label>
                      <select
                        id="functionCode"
                        name="functionCode"
                        value={searchParams.functionCode}
                        onChange={handleInputChange}
                      >
                        <option value="">{t('search.all_functions')}</option>
                        {functions.map((func, index) => (
                          <option key={func.code || func.id || index} value={func.code || func.id}>
                            {func.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="companyName">{t('candidates.company')}</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={searchParams.companyName}
                      onChange={handleInputChange}
                      placeholder={t('search.company_placeholder')}
                    />
                  </div>
                  {searchType === 'missions' && (
                    <div className="form-group">
                      <label htmlFor="missionDate">{t('missions.date')}</label>
                      <input
                        type="date"
                        id="missionDate"
                        name="missionDate"
                        value={searchParams.missionDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-buttons">
              <button type="submit" className="btn">
                <i className="fas fa-search"></i>
                <span>{t('search.button')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Résultats de recherche */}
      {loading ? (
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i>
          <span>{t('search.loading')}</span>
        </div>
      ) : results.length > 0 ? (
        <div className="search-results card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-list"></i>
              <span>
                {searchType === 'candidates'
                  ? t('search.candidate_results', { count: results.length })
                  : t('search.mission_results', { count: results.length })}
              </span>
            </h2>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  {searchType === 'candidates' ? (
                    <tr>
                      <th>{t('candidates.name')}</th>
                      <th>{t('candidates.first_name')}</th>
                      <th>{t('candidates.sector')}</th>
                      <th>{t('candidates.function')}</th>
                      <th>{t('candidates.company')}</th>
                      <th>{t('candidates.actions')}</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>{t('missions.title')}</th>
                      <th>{t('missions.client')}</th>
                      <th>{t('missions.creation_date')}</th>
                      <th>{t('missions.status')}</th>
                      <th>{t('missions.actions')}</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {searchType === 'candidates'
                    ? results.map(candidate => (
                        <tr key={candidate.id}>
                          <td>{candidate.name}</td>
                          <td>{candidate.firstName}</td>
                          <td>{candidate.sector?.name || '-'}</td>
                          <td>{candidate.function?.name || '-'}</td>
                          <td>{candidate.company || '-'}</td>
                          <td>
                            <Link to={`/candidates/${candidate.id}`} className="btn btn-sm">
                              <i className="fas fa-eye"></i>
                            </Link>
                          </td>
                        </tr>
                      ))
                    : results.map(mission => (
                        <tr key={mission.id}>
                          <td>{mission.title}</td>
                          <td>{mission.client}</td>
                          <td>{new Date(mission.creationDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`status status-${mission.status?.toLowerCase()}`}>
                              {mission.status}
                            </span>
                          </td>
                          <td>
                            <Link to={`/missions/${mission.id}`} className="btn btn-sm">
                              <i className="fas fa-eye"></i>
                            </Link>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        results.length === 0 && !loading && (
          <div className="no-results">
            <p>{t('search.no_results')}</p>
          </div>
        )
      )}
    </div>
  );
}

export default SearchInterface;
