import React, { useEffect, useCallback } from 'react';

const FullscreenImageModal = ({ isOpen, imageUrl, userName, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      cursor: 'pointer'
    },
    container: {
      position: 'relative',
      maxWidth: '90vw',
      maxHeight: '90vh',
      cursor: 'default'
    },
    image: {
      maxWidth: '100%',
      maxHeight: '90vh',
      objectFit: 'contain',
      borderRadius: '8px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    closeButton: {
      position: 'absolute',
      top: '-50px',
      right: '0',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#374151',
      transition: 'all 0.2s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    userName: {
      position: 'absolute',
      bottom: '-50px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'white',
      fontSize: '18px',
      fontWeight: '500',
      textAlign: 'center',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.container}>
        <button 
          style={styles.closeButton}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>
        <img 
          src={imageUrl} 
          alt={`${userName} - Full Size`}
          style={styles.image}
        />
        {userName && (
          <div style={styles.userName}>
            {userName}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullscreenImageModal;