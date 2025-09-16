import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';
import FullscreenImageModal from './FullscreenImageModal';

const Avatar = ({ 
  name, 
  avatarUrl, 
  size = 40, 
  style = {},
  ...props 
}) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    const firstName = names[0];
    const lastName = names[names.length - 1];
    
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return `${API_BASE_URL}${avatarPath}`;
  };

  const baseStyles = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    border: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${size * 0.4}px`,
    fontWeight: '600',
    ...style
  };

  const avatarStyles = {
    ...baseStyles,
    objectFit: 'cover',
    cursor: avatarUrl ? 'pointer' : 'default'
  };

  const placeholderStyles = {
    ...baseStyles,
    backgroundColor: '#f3f4f6',
    color: '#6b7280'
  };

  if (avatarUrl) {
    return (
      <>
        <img 
          src={getFullAvatarUrl(avatarUrl)} 
          alt={`${name} avatar`}
          style={avatarStyles}
          onClick={() => setShowFullscreen(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
          {...props}
        />
        <div 
          style={{
            ...placeholderStyles,
            display: 'none'
          }}
        >
          {getInitials(name)}
        </div>
        <FullscreenImageModal
          isOpen={showFullscreen}
          imageUrl={getFullAvatarUrl(avatarUrl)}
          userName={name}
          onClose={() => setShowFullscreen(false)}
        />
      </>
    );
  }

  return (
    <div style={placeholderStyles} {...props}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;