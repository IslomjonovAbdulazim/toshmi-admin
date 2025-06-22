import { useState, useEffect } from 'react';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { Subject } from '../types';

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/admin/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Fanlarni olishda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/subjects', { name: newSubjectName });
      setShowCreateModal(false);
      setNewSubjectName('');
      fetchSubjects();
    } catch (error) {
      console.error('Fan yaratishda xatolik:', error);
    }
  };

  const deleteSubject = async (id: string) => {
    if (confirm('Rostdan ham bu fanni o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/admin/subjects/${id}`);
        fetchSubjects();
      } catch (error) {
        console.error('Fanni o\'chirishda xatolik:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fanlar</h1>
          <p className="text-gray-600">O'quv fanlarini boshqarish</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Fan qo'shish
        </Button>
      </div>

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
          {subjects.map(subject => (
            <Card key={subject.id} hover>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-500">Faol fan</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => deleteSubject(subject.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yangi fan</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={createSubject} className="space-y-4">
              <Input
                label="Fan nomi"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Masalan: Matematika, Ingliz tili"
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