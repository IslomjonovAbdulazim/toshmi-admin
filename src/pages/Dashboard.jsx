import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Common/Card';
import ApiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalGroups: 0,
    totalSubjects: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all data concurrently
      const [
        studentsResponse,
        teachersResponse,
        parentsResponse,
        groupsResponse,
        subjectsResponse,
        notificationsResponse,
        unreadResponse
      ] = await Promise.allSettled([
        ApiService.getStudents(),
        ApiService.getTeachers(),
        ApiService.getParents(),
        ApiService.getGroups(),
        ApiService.getSubjects(),
        ApiService.getNotifications(),
        ApiService.getUnreadCount()
      ]);

      // Process results
      setStats({
        totalStudents: studentsResponse.status === 'fulfilled' ? studentsResponse.value.length : 0,
        totalTeachers: teachersResponse.status === 'fulfilled' ? teachersResponse.value.length : 0,
        totalParents: parentsResponse.status === 'fulfilled' ? parentsResponse.value.length : 0,
        totalGroups: groupsResponse.status === 'fulfilled' ? groupsResponse.value.length : 0,
        totalSubjects: subjectsResponse.status === 'fulfilled' ? subjectsResponse.value.length : 0
      });

      if (notificationsResponse.status === 'fulfilled') {
        setNotifications(notificationsResponse.value.slice(0, 5));
      }

      if (unreadResponse.status === 'fulfilled') {
        setUnreadCount(unreadResponse.value.count || 0);
      }

    } catch (error) {
      console.error('Dashboard data loading error:', error);
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ApiService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatUserName = (user) => {
    if (!user) return 'Admin';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.full_name || user.phone || 'Admin';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Xayrli tong';
    if (hour < 18) return 'Xayrli kun';
    return 'Xayrli kech';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Dashboard yuklanmoqda...
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="header-title">
          {getGreeting()}, {formatUserName(user)}! 👋
        </h1>
        <p className="text-gray-600">
          Bugun {new Date().toLocaleDateString('uz-UZ', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error mb-6">{error}</div>
      )}

      {/* Notification Alert */}
      {unreadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">🔔</span>
              <span className="text-blue-800">
                Sizda {unreadCount} ta yangi xabar bor
              </span>
            </div>
            <button 
              onClick={handleMarkAllRead}
              className="btn btn-sm"
            >
              Barchasini o'qilgan deb belgilash
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-number">{stats.totalStudents}</div>
          <div className="stat-label">O'quvchilar</div>
          <Link to="/students" className="stat-link">
            Batafsil ko'rish →
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.totalTeachers}</div>
          <div className="stat-label">O'qituvchilar</div>
          <Link to="/teachers" className="stat-link">
            Batafsil ko'rish →
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.totalParents}</div>
          <div className="stat-label">Ota-onalar</div>
          <Link to="/parents" className="stat-link">
            Batafsil ko'rish →
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.totalGroups}</div>
          <div className="stat-label">Sinflar</div>
          <Link to="/groups" className="stat-link">
            Batafsil ko'rish →
          </Link>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-2 mb-6">
        {/* Quick Actions */}
        <Card title="Tez amallar">
          <div className="space-y-3">
            <Link to="/students" className="btn w-full flex items-center">
              <span className="mr-2">👨‍🎓</span>
              Yangi o'quvchi qo'shish
            </Link>
            <Link to="/teachers" className="btn w-full flex items-center">
              <span className="mr-2">👩‍🏫</span>
              Yangi o'qituvchi qo'shish
            </Link>
            <Link to="/groups" className="btn w-full flex items-center">
              <span className="mr-2">🏫</span>
              Yangi sinf yaratish
            </Link>
            <Link to="/schedule" className="btn w-full flex items-center">
              <span className="mr-2">📅</span>
              Dars jadvali
            </Link>
          </div>
        </Card>

        {/* System Information */}
        <Card title="Tizim ma'lumotlari">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jami fanlar:</span>
              <span className="font-semibold">{stats.totalSubjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jami sinflar:</span>
              <span className="font-semibold">{stats.totalGroups}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tizim versiyasi:</span>
              <span className="font-semibold">v2.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Oxirgi yangilanish:</span>
              <span className="font-semibold">Bugun</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Management Shortcuts */}
      <div className="grid grid-3">
        <Card title="O'quvchilar boshqaruvi">
          <p className="text-gray-600 text-sm mb-4">
            O'quvchilarni qo'shish, tahrirlash va boshqarish
          </p>
          <div className="space-y-2">
            <Link to="/students" className="btn btn-sm w-full">
              O'quvchilar ro'yxati
            </Link>
            <Link to="/payments" className="btn btn-sm w-full">
              To'lovlar
            </Link>
          </div>
        </Card>

        <Card title="O'qituvchilar boshqaruvi">
          <p className="text-gray-600 text-sm mb-4">
            O'qituvchilarni boshqarish va tayinlash
          </p>
          <div className="space-y-2">
            <Link to="/teachers" className="btn btn-sm w-full">
              O'qituvchilar ro'yxati
            </Link>
            <Link to="/assignments" className="btn btn-sm w-full">
              Fan tayinlash
            </Link>
          </div>
        </Card>

        <Card title="Tizim boshqaruvi">
          <p className="text-gray-600 text-sm mb-4">
            Sinflar, fanlar va boshqa sozlamalar
          </p>
          <div className="space-y-2">
            <Link to="/groups" className="btn btn-sm w-full">
              Sinflar
            </Link>
            <Link to="/subjects" className="btn btn-sm w-full">
              Fanlar
            </Link>
            <Link to="/news" className="btn btn-sm w-full">
              Yangiliklar
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card title="So'nggi xabarlar" className="mt-6">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg border ${
                  !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(notification.created_at).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;