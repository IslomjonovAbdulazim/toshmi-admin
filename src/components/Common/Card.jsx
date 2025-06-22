import React from 'react';

const Card = ({ title, children, actions }) => {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;