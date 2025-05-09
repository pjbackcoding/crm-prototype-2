import React from 'react';

// Composant générique de chargement squelette pour différents types d'éléments
function SkeletonLoader({ type = 'text', count = 1, className = '', style = {} }) {
  // Fonction pour générer le bon type de squelette
  const renderSkeleton = () => {
    switch (type) {
      case 'avatar':
        return <div className="skeleton-avatar" style={style} />;
      case 'title':
        return <div className="skeleton-title" style={style} />;
      case 'thumbnail':
        return <div className="skeleton-thumbnail" style={style} />;
      case 'card':
        return (
          <div className="skeleton-card" style={style}>
            <div className="skeleton-card-header">
              <div className="skeleton-title" />
            </div>
            <div className="skeleton-card-body">
              <div className="skeleton-text" />
              <div className="skeleton-text" />
              <div className="skeleton-text" />
            </div>
            <div className="skeleton-card-footer">
              <div className="skeleton-button" />
            </div>
          </div>
        );
      case 'table-row':
        return (
          <div className="skeleton-table-row" style={style}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="skeleton-cell" />
            ))}
          </div>
        );
      case 'button':
        return <div className="skeleton-button" style={style} />;
      case 'textarea':
        return <div className="skeleton-textarea" style={style} />;
      case 'text':
      default:
        return <div className="skeleton-text" style={style} />;
    }
  };

  return (
    <div className={`skeleton-loader ${className}`}>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="skeleton-item">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}

// Composants spécifiques pour différents cas d'utilisation
export function TableSkeletonLoader({ rows = 5 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="skeleton-header-cell" />
        ))}
      </div>
      <div className="skeleton-table-body">
        <SkeletonLoader type="table-row" count={rows} />
      </div>
    </div>
  );
}

export function CardListSkeletonLoader({ cards = 3 }) {
  return <SkeletonLoader type="card" count={cards} className="skeleton-card-list" />;
}

export function ProfileSkeletonLoader() {
  return (
    <div className="skeleton-profile">
      <div className="skeleton-profile-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-profile-info">
          <div className="skeleton-title" />
          <div className="skeleton-text" />
          <div className="skeleton-text" />
        </div>
      </div>
      <div className="skeleton-profile-body">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
        <div className="skeleton-text" />
      </div>
    </div>
  );
}

export function FormSkeletonLoader({ fields = 4 }) {
  return (
    <div className="skeleton-form">
      {Array(fields).fill(0).map((_, index) => (
        <div key={index} className="skeleton-form-group">
          <div className="skeleton-label" />
          <div className="skeleton-input" />
        </div>
      ))}
      <div className="skeleton-form-footer">
        <div className="skeleton-button" />
      </div>
    </div>
  );
}

export function SearchSkeletonLoader() {
  return (
    <div className="skeleton-search">
      <div className="skeleton-search-input" />
      <div className="skeleton-search-filters">
        <div className="skeleton-filter" />
        <div className="skeleton-filter" />
        <div className="skeleton-filter" />
      </div>
    </div>
  );
}

export default SkeletonLoader;
