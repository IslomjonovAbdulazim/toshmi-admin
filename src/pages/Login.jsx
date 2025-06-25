import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.username.trim()) {
      setError('Foydalanuvchi nomini kiriting');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Parolni kiriting');
      setLoading(false);
      return;
    }

    // Simple test login - remove this in production
    if (formData.username === 'admin' && formData.password === 'admin123') {
      // Mock successful login for testing
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'admin',
        first_name: 'Administrator',
        last_name: 'System'
      };
      
      // Store mock auth data
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      navigate('/', { replace: true });
      setLoading(false);
      return;
    }

    // Try API login
    const loginData = {
      username: formData.username,
      password: formData.password,
      role: 'admin'
    };

    try {
      const result = await login(loginData);
      
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Noto\'g\'ri foydalanuvchi nomi yoki parol');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ulanishda xatolik yuz berdi. Serverga ulanib bo\'lmayapti.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          🏫
        </div>
        
        {/* Title */}
        <h1 className="login-title">Admin Paneli</h1>
        <p className="text-center text-gray-600 mb-6">
          Maktab boshqaruv tizimiga kirish
        </p>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Foydalanuvchi nomi</label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Foydalanuvchi nomini kiriting"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolni kiriting"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2025 Maktab Boshqaruv Tizimi v2.0.0
          </p>
          <div className="text-xs text-gray-400 mt-2">
            Test: admin / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;