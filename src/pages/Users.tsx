import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { User } from '../types';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    role: 'student',
    phone: '',
    full_name: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users?role=${selectedRole}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Foydalanuvchilarni olishda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', {
        ...newUser,
        phone: parseInt(newUser.phone)
      });
      setShowCreateModal(false);
      setNewUser({ role: 'student', phone: '', full_name: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Foydalanuvchi yaratishda xatolik:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('Rostdan ham bu foydalanuvchini o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Foydalanuvchini o\'chirishda xatolik:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.toString().includes(searchQuery)
  );

  const roles = [
    { value: 'student', label: "O'quvchilar", count: users.length },
    { value: 'teacher', label: "O'qituvchilar", count: 0 },
    { value: 'parent', label: 'Ota-onalar', count: 0 },
    { value: 'admin', label: 'Adminlar', count: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
          <p className="text-gray-600">Tizim foydalanuvchilarini boshqarish</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Foydalanuvchi qo'shish
        </Button>
      </div>

      {/* Role filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roles.map(role => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedRole === role.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl font-bold">{role.count}</div>
                <div className="text-sm">{role.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent>
          <Input
            placeholder="Ism yoki telefon raqam bilan qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {roles.find(r => r.value === selectedRole)?.label} ({filteredUsers.length})
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ism</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yaratilgan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary">✏️</Button>
                          <Button size="sm" variant="secondary">🔑</Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => deleteUser(user.id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yangi foydalanuvchi</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={createUser} className="space-y-4">
              <Input
                label="To'liq ism"
                value={newUser.full_name}
                onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                required
              />
              
              <Input
                label="Telefon raqam"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="student">O'quvchi</option>
                  <option value="teacher">O'qituvchi</option>
                  <option value="parent">Ota-ona</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <Input
                label="Parol"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
              
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit">Yaratish</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}