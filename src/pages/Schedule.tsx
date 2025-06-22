import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { Schedule, Group, GroupSubject } from '../types';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSubjects, setGroupSubjects] = useState<GroupSubject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    group_id: '',
    group_subject_id: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    room: ''
  });

  const days = [
    'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'
  ];

  useEffect(() => {
    fetchGroups();
    fetchGroupSubjects();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchSchedules();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/admin/groups');
      setGroups(response.data);
      if (response.data.length > 0) {
        setSelectedGroup(response.data[0].id);
      }
    } catch (error) {
      console.error('Guruhlarni olishda xatolik:', error);
    }
  };

  const fetchGroupSubjects = async () => {
    try {
      const response = await api.get('/admin/group-subjects');
      setGroupSubjects(response.data);
    } catch (error) {
      console.error('Guruh fanlarini olishda xatolik:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/schedule?group_id=${selectedGroup}`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Dars jadvalini olishda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/schedule', newSchedule);
      setShowCreateModal(false);
      setNewSchedule({
        group_id: '',
        group_subject_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        room: ''
      });
      fetchSchedules();
    } catch (error) {
      console.error('Dars yaratishda xatolik:', error);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (confirm('Rostdan ham bu darsni o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/schedule/${id}`);
        fetchSchedules();
      } catch (error) {
        console.error('Darsni o\'chirishda xatolik:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dars jadvali</h1>
          <p className="text-gray-600">Haftalik dars jadvalini boshqarish</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Dars qo'shish
        </Button>
      </div>

      {/* Group selector */}
      <Card>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Guruh:</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {groups.find(g => g.id === selectedGroup)?.name} guruhi jadvali
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {days.map(day => (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 capitalize">{day}</h4>
                  <div className="grid gap-2">
                    {schedules
                      .filter(schedule => schedule.day_of_week === day)
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map(schedule => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-blue-900">
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                            <span className="text-sm text-gray-600">
                              {schedule.group_subject?.subject?.name || 'Fan nomi yo\'q'}
                            </span>
                            {schedule.room && (
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {schedule.room}-xona
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => deleteSchedule(schedule.id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      ))}
                    {schedules.filter(s => s.day_of_week === day).length === 0 && (
                      <p className="text-sm text-gray-500 italic">Darslar yo'q</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yangi dars</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={createSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guruh</label>
                <select
                  value={newSchedule.group_id}
                  onChange={(e) => setNewSchedule({...newSchedule, group_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Guruhni tanlang</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fan</label>
                <select
                  value={newSchedule.group_subject_id}
                  onChange={(e) => setNewSchedule({...newSchedule, group_subject_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Fanni tanlang</option>
                  {groupSubjects.map(gs => (
                    <option key={gs.id} value={gs.id}>
                      {gs.group?.name} - {gs.subject?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kun</label>
                <select
                  value={newSchedule.day_of_week}
                  onChange={(e) => setNewSchedule({...newSchedule, day_of_week: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Kunni tanlang</option>
                  {days.map(day => (
                    <option key={day} value={day} className="capitalize">{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Boshlanish vaqti"
                  type="time"
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                  required
                />
                <Input
                  label="Tugash vaqti"
                  type="time"
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})}
                  required
                />
              </div>

              <Input
                label="Xona (ixtiyoriy)"
                value={newSchedule.room}
                onChange={(e) => setNewSchedule({...newSchedule, room: e.target.value})}
                placeholder="Masalan: 101, Lab-1"
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