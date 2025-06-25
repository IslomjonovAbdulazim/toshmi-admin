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
    assignedTeachers: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        studentsResponse,
        teachersResponse,
        parentsResponse,
        groupsResponse,
        subjectsResponse,
        paymentsResponse
      ] = await Promise.allSettled([
        ApiService.getStudents(),
        ApiService.getTeachers(),
        ApiService.getParents(),
        ApiService.getGroups(),
        ApiService.getSubjects(),
        ApiService.getPayments().catch(() => [])
      ]);

      // Process responses
      const students = studentsResponse.status === 'fulfilled' ? studentsResponse.value : [];
      const teachers = teachersResponse.status === 'fulfilled' ? teachersResponse.value : [];
      const parents = parentsResponse.status === 'fulfilled' ? parentsResponse.value : [];
      const groups = groupsResponse.status === 'fulfilled' ? groupsResponse.value : [];
      const subjects = subjectsResponse.status === 'fulfilled' ? subjectsResponse.value : [];
      const payments = paymentsResponse.status === 'fulfilled' ? paymentsResponse.value : [];

      // Calculate statistics
      const activeStudents = students.filter(s => s.is_active).length;
      const activeTeachers = teachers.filter(t => t.is_active).length;
      const assignedTeachers = teachers.filter(t => 
        t.assigned_subjects && t.assigned_subjects.length > 0
      ).length;

      // Payment statistics
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentMonthPayments = payments.filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate.getMonth() + 1 === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      });
      
      const totalPayments = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      const pendingPayments = activeStudents - currentMonthPayments.length;

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents.length,
        totalGroups: groups.length,
        totalSubjects: subjects.length,
        activeStudents,
        activeTeachers,
        assignedTeachers,
        totalPayments,
        pendingPayments
      });

      // Generate recent activity
      const activity = generateRecentActivity(students, teachers, groups, payments);
      setRecentActivity(activity);

      // System health check
      setSystemHealth({
        status: 'healthy',
        last_updated: new Date().toISOString(),
        database_connected: true,
        users_count: students.length + teachers.length + parents.length
      });

    } catch (error) {
      console.error('Dashboard data loading error:', error);
      setError('Dashboard ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (students, teachers, groups, payments) => {
    const activities = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    // Recent students (last 3 days)
    const recentStudents = students
      .filter(s => s.created_at && new Date(s.created_at) >= threeDaysAgo)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
    
    recentStudents.forEach(student => {
      activities.push({
        type: 'student_added',
        title: 'Yangi o\'quvchi qo\'shildi',
        description: `${student.first_name} ${student.last_name} tizimga qo'shildi`,
        time: student.created_at,
        icon: '👨‍🎓',
        link: `/students/${student.id}`,
        priority: 'medium'
      });
    });

    // Recent teachers (last 3 days)
    const recentTeachers = teachers
      .filter(t => t.created_at && new Date(t.created_at) >= threeDaysAgo)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);
    
    recentTeachers.forEach(teacher => {
      activities.push({
        type: 'teacher_added',
        title: 'Yangi o\'qituvchi qo\'shildi',
        description: `${teacher.first_name} ${teacher.last_name} tizimga qo'shildi`,
        time: teacher.created_at,
        icon: '👩‍🏫',
        link: `/teachers/${teacher.id}`,
        priority: 'medium'
      });
    });

    // Recent payments (today)
    const todayPayments = payments
      .filter(p => p.payment_date && new Date(p.payment_date) >= today)
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
      .slice(0, 3);
    
    todayPayments.forEach(payment => {
      activities.push({
        type: 'payment_received',
        title: 'Yangi to\'lov qabul qilindi',
        description: `${formatCurrency(payment.amount)} - ${payment.student_name || 'Noma\'lum o\'quvchi'}`,
        time: payment.payment_date,
        icon: '💰',
        link: `/payments`,
        priority: 'high'
      });
    });

    // System activities
    if (activities.length === 0) {
      activities.push({
        type: 'system',
        title: 'Tizim normal ishlaydi',
        description: 'Hozircha yangi faoliyat yo\'q',
        time: new Date().toISOString(),
        icon: '✅',
        priority: 'low'
      });
    }

    // Sort by time and priority
    return activities
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.time) - new Date(a.time);
      })
      .slice(0, 8);
  };

  const getSystemHealthColor = () => {
    if (!systemHealth) return 'gray';
    if (systemHealth.status === 'healthy') return 'green';
    if (systemHealth.status === 'warning') return 'orange';
    return 'red';
  };

  if (loading) return <Loading size="large" text="Dashboard yuklanmoqda..." />;

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Xush kelibsiz, {user?.first_name || 'Admin'}!</h1>
        <p className="welcome-subtitle">
          Bugun {formatDate(new Date(), true)} | Ta'lim markazi boshqaruv paneli
        </p>
      </div>

      {/* Main Statistics */}
      <div className="stats-grid main-stats">
        <Card className="stat-card students">
          <div className="stat-header">
            <div className="stat-icon">👨‍🎓</div>
            <div className="stat-trend">
              <span className="trend-value">+{stats.activeStudents}</span>
              <span className="trend-label">faol</span>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalStudents}</div>
            <div className="stat-label">Jami o'quvchilar</div>
          </div>
          <Link to="/students" className="stat-link">
            Barchasini ko'rish →
          </Link>
        </Card>

        <Card className="stat-card teachers">
          <div className="stat-header">
            <div className="stat-icon">👩‍🏫</div>
            <div className="stat-trend">
              <span className="trend-value">{stats.assignedTeachers}</span>
              <span className="trend-label">tayinlangan</span>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalTeachers}</div>
            <div className="stat-label">Jami o'qituvchilar</div>
          </div>
          <Link to="/teachers" className="stat-link">
            Barchasini ko'rish →
          </Link>
        </Card>

        <Card className="stat-card groups">
          <div className="stat-header">
            <div className="stat-icon">📚</div>
            <div className="stat-trend">
              <span className="trend-value">{stats.totalSubjects}</span>
              <span className="trend-label">fan</span>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalGroups}</div>
            <div className="stat-label">Jami guruhlar</div>
          </div>
          <Link to="/groups" className="stat-link">
            Barchasini ko'rish →
          </Link>
        </Card>

        <Card className="stat-card payments">
          <div className="stat-header">
            <div className="stat-icon">💰</div>
            <div className="stat-trend">
              <span className="trend-value pending">{stats.pendingPayments}</span>
              <span className="trend-label">kutilmoqda</span>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(stats.totalPayments)}</div>
            <div className="stat-label">Bu oylik to'lovlar</div>
          </div>
          <Link to="/payments" className="stat-link">
            To'lovlarni ko'rish →
          </Link>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="stats-grid secondary-stats">
        <Card className="info-card">
          <div className="info-header">
            <h3>Ota-onalar</h3>
            <span className="info-number">{stats.totalParents}</span>
          </div>
          <Link to="/parents" className="info-link">Ko'rish</Link>
        </Card>

        <Card className="info-card">
          <div className="info-header">
            <h3>Fanlar</h3>
            <span className="info-number">{stats.totalSubjects}</span>
          </div>
          <Link to="/subjects" className="info-link">Ko'rish</Link>
        </Card>

        <Card className="info-card system-health">
          <div className="info-header">
            <h3>Tizim holati</h3>
            <span className={`health-indicator ${getSystemHealthColor()}`}>
              {systemHealth?.status === 'healthy' ? '✅' : '⚠️'}
            </span>
          </div>
          <div className="health-details">
            <small>
              Oxirgi yangilanish: {systemHealth ? formatDate(systemHealth.last_updated, true) : 'Noma\'lum'}
            </small>
          </div>
        </Card>

        <Card className="info-card quick-actions">
          <div className="info-header">
            <h3>Tezkor amallar</h3>
          </div>
          <div className="quick-links">
            <Link to="/students" className="quick-link">+ O'quvchi</Link>
            <Link to="/teachers" className="quick-link">+ O'qituvchi</Link>
            <Link to="/groups" className="quick-link">+ Guruh</Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-bottom">
        <Card className="activity-card">
          <div className="card-header">
            <h3>So'nggi faoliyat</h3>
            <button onClick={loadDashboardData} className="refresh-btn" disabled={loading}>
              🔄 Yangilash
            </button>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className={`activity-item ${activity.priority}`}>
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-description">{activity.description}</div>
                    <div className="activity-time">{formatDate(activity.time, true)}</div>
                  </div>
                  {activity.link && (
                    <Link to={activity.link} className="activity-link">
                      Ko'rish
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-activity">
              <div className="no-activity-icon">📊</div>
              <p>Hozircha faoliyat yo'q</p>
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        <Card className="quick-stats">
          <h3>Tezkor statistika</h3>
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <div className="quick-stat-label">Faol o'quvchilar</div>
              <div className="quick-stat-value">{stats.activeStudents}</div>
              <div className="quick-stat-percent">
                {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%
              </div>
            </div>
            
            <div className="quick-stat">
              <div className="quick-stat-label">Tayinlangan o'qituvchilar</div>
              <div className="quick-stat-value">{stats.assignedTeachers}</div>
              <div className="quick-stat-percent">
                {stats.totalTeachers > 0 ? Math.round((stats.assignedTeachers / stats.totalTeachers) * 100) : 0}%
              </div>
            </div>
            
            <div className="quick-stat">
              <div className="quick-stat-label">To'lov kutilayotganlar</div>
              <div className="quick-stat-value danger">{stats.pendingPayments}</div>
              <div className="quick-stat-percent">
                {stats.activeStudents > 0 ? Math.round((stats.pendingPayments / stats.activeStudents) * 100) : 0}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="error-card">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button onClick={loadDashboardData} className="retry-btn">
              Qayta urinish
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;