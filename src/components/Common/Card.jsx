import React from 'react';

const Card = ({ 
  title, 
  children, 
  className = '', 
  headerAction = null,
  loading = false 
}) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {headerAction && (
            <div className="card-actions">
              {headerAction}
            </div>
          )}
        </div>
      )}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Yuklanmoqda...
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default Card;