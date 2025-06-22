import { useState, useEffect } from 'react';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { Student, Group } from '../types';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students/search');
      setStudents(response.data);
    } catch (error) {
      console.error("O'quvchilarni olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/admin/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Guruhlarni olishda xatolik:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">O'quvchilar</h1>
          <p className="text-gray-600">O'quvchilarni boshqarish va ko'rish</p>
        </div>
        <Button>+ O'quvchi qo'shish</Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent>
          <Input
            placeholder="O'quvchi ismini qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guruh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bitirish yili</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {student.user?.full_name?.charAt(0).toUpperCase() || 'O'}
                          </div>
                          <span className="font-medium">{student.user?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {student.group?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.graduation_year}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.user?.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="secondary">👁️</Button>
                          <Button size="sm" variant="secondary">✏️</Button>
                          <Button size="sm" variant="danger">🗑️</Button>
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
    </div>
  );
}