import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AuthImage = ({ fileId, alt, style, ...props }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fileId) {
      fetchImage();
    } else {
      setLoading(false);
      setError('File ID mavjud emas');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const fetchImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching image for fileId:', fileId); // Debug log
      
      const response = await api.get(`/files/${fileId}`, {
        responseType: 'blob'
      });
      
      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setImageSrc(imageUrl);
        console.log('Image loaded successfully:', fileId); // Debug log
      } else {
        setError('Javob bo\'sh');
      }
    } catch (err) {
      console.error('Image fetch error:', err); // Debug log
      setError(err.response?.status === 404 ? 'Rasm topilmadi' : 'Yuklanmadi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  if (loading) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        color: '#9ca3af',
        fontSize: '12px'
      }}>
        Yuklanmoqda...
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        color: '#ef4444',
        fontSize: '12px',
        textAlign: 'center',
        padding: '4px'
      }}>
        {error || 'Xatolik'}
        <br />
        <small>ID: {fileId}</small>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      style={style}
      {...props}
    />
  );
};

export default AuthImage;