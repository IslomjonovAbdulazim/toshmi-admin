import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    role: 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Kirishda xatolik yuz berdi');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Logo" className="login-logo" />
        <h1 className="login-title">Admin paneli</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Telefon raqam</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="990330919"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolni kiriting"
              className="form-input"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;