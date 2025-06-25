import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '+998990330919', // Pre-fill for testing
    password: 'admin123' // Pre-fill for testing
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Clear error when component mounts or form data changes
  useEffect(() => {
    if (clearError) clearError();
    setError('');
  }, [clearError, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const formatPhoneNumber = (phone) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If starts with 998, keep as is
    if (digits.startsWith('998')) {
      return '+' + digits;
    }
    
    // If starts with 8, replace with 998
    if (digits.startsWith('8')) {
      return '+998' + digits.substring(1);
    }
    
    // If 9 digits starting with 9, add 998
    if (digits.length === 9 && digits.startsWith('9')) {
      return '+998' + digits;
    }
    
    // If less than 9 digits, assume local format
    if (digits.length < 9) {
      return '+998' + digits;
    }
    
    return '+' + digits;
  };

  const validateForm = () => {
    if (!formData.phone.trim()) {
      setError('Telefon raqamini kiriting');
      return false;
    }

    if (!formData.password) {
      setError('Parolni kiriting');
      return false;
    }

    if (formData.password.length < 3) {
      setError('Parol kamida 3 ta belgidan iborat bo\'lishi kerak');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Format phone number
      const formattedPhone = formatPhoneNumber(formData.phone);
      
      console.log('Login attempt:', { phone: formattedPhone });

      const loginData = {
        phone: formattedPhone,
        password: formData.password
      };

      const result = await login(loginData);
      
      if (result.success) {
        console.log('Login successful, redirecting...');
        navigate('/', { replace: true });
      } else {
        console.error('Login failed:', result.error);
        setError(result.error || 'Login amalga oshmadi');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Extract error message properly
      let errorMessage = 'Login paytida xatolik yuz berdi';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.detail) {
        errorMessage = err.detail;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <span className="logo-icon">🏫</span>
            </div>
            <h1 className="login-title">Admin Paneli</h1>
            <p className="login-subtitle">Maktab boshqaruv tizimiga kirish</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Phone Input */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Foydalanuvchi nomi
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+998990330919"
                required
                autoComplete="username"
                className="form-input"
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Parol
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="•••••••"
                required
                autoComplete="current-password"
                className="form-input"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="login-button"
              fullWidth
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </Button>
          </form>

          {/* Test Credentials */}
          <div className="login-footer">
            <p className="test-info">
              © 2025 Maktab Boshqaruv Tizimi v2.0.0
            </p>
            <p className="test-credentials">
              Test: admin / admin123
            </p>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          margin-bottom: 16px;
        }

        .logo-icon {
          font-size: 48px;
          display: inline-block;
          padding: 16px;
          background: #f7fafc;
          border-radius: 12px;
        }

        .login-title {
          font-size: 28px;
          font-weight: bold;
          color: #2d3748;
          margin: 16px 0 8px 0;
        }

        .login-subtitle {
          color: #718096;
          font-size: 16px;
          margin: 0;
        }

        .login-form {
          space-y: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .error-icon {
          font-size: 16px;
        }

        .login-button {
          width: 100%;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .login-button:hover:not(:disabled) {
          background: #5a67d8;
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .test-info {
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .test-credentials {
          color: #9ca3af;
          font-size: 12px;
          margin: 0;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 24px;
          }
          
          .login-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;