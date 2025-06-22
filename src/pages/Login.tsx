import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';

export default function Login() {
  const [formData, setFormData] = useState({
    phone: '',
    role: 'admin',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        ...formData,
        phone: parseInt(formData.phone)
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Get user info
      const userResponse = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      navigate('/');
    } catch (error: any) {
      setError('Telefon raqam yoki parol noto\'g\'ri');
      console.error('Login xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            ToshMI Admin Panel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tizimga kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Telefon raqam"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="998901234567"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">O'qituvchi</option>
                  <option value="student">O'quvchi</option>
                  <option value="parent">Ota-ona</option>
                </select>
              </div>

              <Input
                label="Parol"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                Kirish
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 ToshMI. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </div>
  );
}