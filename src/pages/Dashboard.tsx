import { useState, useEffect } from 'react';
import Card, { CardContent } from '../components/Card';
import api from '../services/api';

interface Stats {
  total_students: number;
  total_teachers: number;
  total_parents: number;
  monthly_payments: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total_students: 0,
    total_teachers: 0,
    total_parents: 0,
    monthly_payments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/reports/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Statsni olishda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Jami o'quvchilar", value: stats.total_students, icon: '🎓', color: 'bg-blue-500' },
    { title: 'Jami oʻqituvchilar', value: stats.total_teachers, icon: '👨‍🏫', color: 'bg-green-500' },
    { title: 'Jami ota-onalar', value: stats.total_parents, icon: '👨‍👩‍👧‍👦', color: 'bg-purple-500' },
    { title: 'Oylik toʻlovlar', value: stats.monthly_payments, icon: '💰', color: 'bg-yellow-500' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent>
                <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Boshqaruv paneli</h1>
        <p className="text-gray-600 mt-1">Maktab statistikasi va asosiy ma'lumotlar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} hover>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tezkor amallar</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium">Foydalanuvchi qo'shish</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">🏫</div>
              <div className="text-sm font-medium">Guruh yaratish</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium">Fan qo'shish</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">📰</div>
              <div className="text-sm font-medium">Yangilik yaratish</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Oxirgi ro'yxatdan o'tganlar</h3>
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Anvar Karimov</p>
                    <p className="text-xs text-gray-500">O'quvchi • 2 soat oldin</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Oxirgi to'lovlar</h3>
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      💰
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Maryam Toshpulatova</p>
                      <p className="text-xs text-gray-500">Oylik to'lov</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">500,000 so'm</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}