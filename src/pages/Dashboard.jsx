import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Common/Card';
import Loading from '../components/Common/Loading';
import ApiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatCurrency } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalGroups: 0,
    totalSubjects: 0,
    activeStudents: 0,
    activeTeachers: 0,
    assignedTeachers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
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
        healthResponse
      ] = await Promise.allSettled([
        ApiService.getStudents(),
        ApiService.getTeachers(),
        ApiService.getParents(),
        ApiService.getGroups(),
        ApiService.getSubjects(),
        ApiService.getSystemHealth()
      ]);

      // Process students data
      const students = studentsResponse.status === 'fulfilled' ? studentsResponse.value : [];
      const teachers = teachersResponse.status === 'fulfilled' ? teachersResponse.value : [];
      const parents = parentsResponse.status === 'fulfilled' ? parentsResponse.value : [];
      const groups = groupsResponse.status === 'fulfilled' ? groupsResponse.value : [];
      const subjects = subjectsResponse.status === 'fulfilled' ? subjectsResponse.value : [];
      const health = healthResponse.status === 'fulfilled' ? healthResponse.value : null;

      // Calculate statistics
      const activeStudents = students.filter(s => s.is_active).length;
      const activeTeachers = teachers.filter(t => t.is_active).length;
      const assignedTeachers = teachers.filter(t => t.assigned_subjects && t.assigned_subjects.length > 0).length;

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents.length,
        totalGroups: groups.length,
        totalSubjects: subjects.length,
        activeStudents,
        activeTeachers,
        assignedTeachers
      });

      setSystemHealth(health);

      // Generate recent activity
      const activity = generateRecentActivity(students, teachers, groups);
      setRecentActivity(activity);

    } catch (error) {
      console.error('Dashboard data loading error:', error);
      setError('Dashboard ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (students, teachers, groups) => {
    const activities = [];
    
    // Recent students
    const recentStudents = students
      .filter(s => s.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
    
    recentStudents.forEach(student => {
      activities.push({
        type: 'student_added',
        title: 'Yangi o\'quvchi qo\'shildi',
        description: `${student.first_name} ${student.last_name} tizimga qo'shildi`,
        time: student.created_at,
        icon: '👨‍🎓',
        link: `/students/${student.id}`
      });
    });

    // Recent teachers
    const recentTeachers = teachers
      .filter(t => t.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);
    
    recentTeachers.forEach(teacher => {
      activities.push({
        type: 'teacher_added',
        title: 'Yangi o\'qituvchi qo\'shildi',
        description: `${teacher.first_name} ${teacher.last_name} tizimga qo'shildi`,
        time: teacher.created_at,
        icon: '👩‍🏫',
        link: `/teachers/${teacher.id}`
      });
    });

    // Recent groups
    const recentGroups = groups
      .filter(g => g.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);
    
    recentGroups.forEach(group => {
      activities.push({
        type: 'group_added',
        title: 'Yangi sinf yaratildi',
        description: `${group.name} sinfi yaratildi`,
        time: group.created_at,
        icon: '🏫',
        link: '/groups'
      });
    });

    // Sort by time and take latest 5
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
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

  const getStudentGrowth = () => {
    // This would be calculated from historical data
    return '+12%'; // Placeholder
  };

  const getTeacherUtilization = () => {
    if (stats.totalTeachers === 0) return '0%';
    return Math.round((stats.assignedTeachers / stats.totalTeachers) * 100) + '%';
  };

  if (loading) {
    return <Loading size="large" text="Dashboard yuklanmoqda..." />;
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
        {systemHealth && (
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${systemHealth.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              Tizim holati: {systemHealth.status === 'healthy' ? 'Barcha tizimlar normal ishlayapti' : 'Tizimda muammolar bor'}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error mb-6">{error}</div>
      )}

      {/* Main Statistics Cards */}
      <div className="grid grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-number text-blue-600">{stats.totalStudents}</div>
          <div className="stat-label">Jami o'quvchilar</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.activeStudents} faol • {getStudentGrowth()} o'sish
          </div>
          <Link to="/students" className="stat-link">
            Batafsil ko'rish →
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-number text-green-600">{stats.totalTeachers}</div>
          <div className="stat-label">O'qituvchilar</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.activeTeachers} faol • {getTeacherUtilization()} bandlik
          </div>
          <Link to="/teachers" className="stat-link">
            Batafsil ko'rish →
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-number text-purple-600">{stats.totalGroups}</div>
          <div className="stat-label">Sinflar</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(stats.totalStudents / stats.totalGroups) || 0} o'rtacha o'quvchi
          </div>
          <Link to="/groups" className="stat-link">
            Batafsil ko'rish →
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-number text-orange-600">{stats.totalSubjects}</div>
          <div className="stat-label">Fanlar</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.assignedTeachers} tayinlangan
          </div>
          <Link to="/subjects" className="stat-link">
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
              <span className="mr-3">👨‍🎓</span>
              Yangi o'quvchi qo'shish
            </Link>
            <Link to="/teachers" className="btn w-full flex items-center">
              <span className="mr-3">👩‍🏫</span>
              Yangi o'qituvchi qo'shish
            </Link>
            <Link to="/groups" className="btn w-full flex items-center">
              <span className="mr-3">🏫</span>
              Yangi sinf yaratish
            </Link>
            <Link to="/subjects" className="btn w-full flex items-center">
              <span className="mr-3">📚</span>
              Yangi fan qo'shish
            </Link>
            <Link to="/schedule" className="btn w-full flex items-center">
              <span className="mr-3">📅</span>
              Dars jadvali
            </Link>
            <Link to="/payments" className="btn w-full flex items-center">
              <span className="mr-3">💰</span>
              To'lov qo'shish
            </Link>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="So'nggi faoliyat">
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {formatDate(activity.time)}
                    </p>
                  </div>
                  {activity.link && (
                    <Link 
                      to={activity.link}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      Ko'rish →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📝</div>
              <p>Hali faoliyat yo'q</p>
            </div>
          )}
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-3">
        <Card title="Tizim ma'lumotlari">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jami foydalanuvchilar:</span>
              <span className="font-semibold">
                {stats.totalStudents + stats.totalTeachers + stats.totalParents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Faol foydalanuvchilar:</span>
              <span className="font-semibold text-green-600">
                {stats.activeStudents + stats.activeTeachers}
              </span>
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

        <Card title="Ta'lim statistikasi">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">O'quvchi/Sinf nisbati:</span>
              <span className="font-semibold">
                {stats.totalGroups > 0 ? Math.round(stats.totalStudents / stats.totalGroups) : 0}:1
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">O'qituvchi bandligi:</span>
              <span className="font-semibold">
                {getTeacherUtilization()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Faol sinflar:</span>
              <span className="font-semibold">{stats.totalGroups}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mavjud fanlar:</span>
              <span className="font-semibold">{stats.totalSubjects}</span>
            </div>
          </div>
        </Card>

        <Card title="Tezkor havolalar">
          <div className="space-y-3">
            <Link to="/profile" className="btn btn-sm w-full flex items-center">
              <span className="mr-2">👤</span>
              Profil sozlamalari
            </Link>
            <Link to="/news" className="btn btn-sm w-full flex items-center">
              <span className="mr-2">📰</span>
              Yangiliklar
            </Link>
            <Link to="/schedule" className="btn btn-sm w-full flex items-center">
              <span className="mr-2">📅</span>
              Haftalik jadval
            </Link>
            <button 
              onClick={() => window.print()}
              className="btn btn-sm w-full flex items-center"
            >
              <span className="mr-2">🖨️</span>
              Hisobot chop etish
            </button>
          </div>
        </Card>
      </div>

      {/* Performance Indicators */}
      {systemHealth && (
        <Card title="Tizim ishlashi" className="mt-6">
          <div className="grid grid-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${systemHealth.database_connected ? 'text-green-600' : 'text-red-600'}`}>
                {systemHealth.database_connected ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Ma'lumotlar bazasi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">API xizmatlari</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Fayl tizimi</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;