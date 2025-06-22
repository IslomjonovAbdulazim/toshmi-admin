import { useState, useEffect } from 'react';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { Group } from '../types';

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/admin/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Guruhlarni olishda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/groups', { name: newGroupName });
      setShowCreateModal(false);
      setNewGroupName('');
      fetchGroups();
    } catch (error) {
      console.error('Guruh yaratishda xatolik:', error);
    }
  };

  const deleteGroup = async (id: string) => {
    if (confirm('Rostdan ham bu guruhni o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/admin/groups/${id}`);
        fetchGroups();
      } catch (error) {
        console.error('Guruhni o\'chirishda xatolik:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guruhlar</h1>
          <p className="text-gray-600">Sinf guruhlarini boshqarish</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Guruh qo'shish
        </Button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <Card key={group.id} hover>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      {group.students?.length || 0} ta o'quvchi
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary">✏️</Button>
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => deleteGroup(group.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yangi guruh</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={createGroup} className="space-y-4">
              <Input
                label="Guruh nomi"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Masalan: 10A, 11B"
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