import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleInputChange = (field, value) => {
    // Clear error when user starts typing
    if (error) setError('');
    
    if (field === 'phone') setPhone(value);
    if (field === 'password') setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't clear error immediately, only when starting new attempt
    if (!loading) {
      setError('');
      setLoading(true);

      const result = await login(phone, password);
      
      if (!result.success) {
        setError(result.error);
      }
      
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px'
    },
    formContainer: {
      maxWidth: '400px',
      width: '100%',
      padding: '32px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '32px'
    },
    inputGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    errorBox: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    buttonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Admin Panel</h2>
        <p style={styles.subtitle}>Maktab Boshqaruv Tizimi</p>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="phone">Telefon raqami</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              style={styles.input}
              placeholder="+998901234567"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">Parol</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={styles.input}
              placeholder="Parol"
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error === 'Invalid credentials' ? 'Telefon raqami yoki parol noto\'g\'ri' : error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#2563eb';
            }}
          >
            {loading ? 'Kirish jarayonida...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;