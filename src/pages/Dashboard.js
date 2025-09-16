import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ActivityMonitor from '../components/common/ActivityMonitor';
import WebSocketStatus from '../components/common/WebSocketStatus';
import { systemService } from '../services/systemService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await systemService.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Ma\'lumotlarni olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    welcomeCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px',
      textAlign: 'center'
    },
    welcomeTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px'
    },
    welcomeSubtitle: {
      color: '#6b7280',
      fontSize: '16px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      textAlign: 'center'
    },
    statIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '16px',
      color: '#6b7280',
      fontWeight: '500'
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px'
    },
    spinner: {
      border: '3px solid #f3f4f6',
      borderTop: '3px solid #2563eb',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    },
    errorCard: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '16px',
      borderRadius: '8px',
      textAlign: 'center'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },
    summaryCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    summaryTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#111827'
    },
    summaryItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #f3f4f6'
    },
    summaryLabel: {
      color: '#6b7280'
    },
    summaryValue: {
      fontWeight: '600',
      color: '#111827'
    }
  };

  const statCards = [
    {
      icon: '👨‍🎓',
      value: stats?.total_students || 0,
      label: 'Jami O\'quvchilar',
      color: '#3b82f6'
    },
    {
      icon: '👩‍🏫',
      value: stats?.teachers || 0,
      label: 'O\'qituvchilar',
      color: '#10b981'
    },
    {
      icon: '👪',
      value: stats?.parents || 0,
      label: 'Ota-onalar',
      color: '#8b5cf6'
    },
    {
      icon: '📚',
      value: stats?.total_groups || 0,
      label: 'Guruhlar',
      color: '#f59e0b'
    },
    {
      icon: '📖',
      value: stats?.total_subjects || 0,
      label: 'Fanlar',
      color: '#ef4444'
    },
    {
      icon: '👤',
      value: stats?.total_users || 0,
      label: 'Jami Foydalanuvchilar',
      color: '#6366f1'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={styles.errorCard}>
          <p>{error}</p>
          <button 
            onClick={fetchStats}
            style={{
              marginTop: '12px',
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Qayta urinish
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.welcomeCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={styles.welcomeTitle}>Maktab Boshqaruv Tizimi</h1>
              <p style={styles.welcomeSubtitle}>
                Tizim statistikasi va umumiy ma'lumotlar
              </p>
            </div>
            <WebSocketStatus showText={true} compact={false} />
          </div>
        </div>

        <div style={styles.statsGrid}>
          {statCards.map((card, index) => (
            <div key={index} style={styles.statCard}>
              <div style={{...styles.statIcon, color: card.color}}>
                {card.icon}
              </div>
              <div style={{...styles.statValue, color: card.color}}>
                {card.value.toLocaleString()}
              </div>
              <div style={styles.statLabel}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        <ActivityMonitor />

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Foydalanuvchilar Tafsiloti</h3>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Faol foydalanuvchilar:</span>
              <span style={styles.summaryValue}>{stats?.active_users || 0}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Faol o'quvchilar:</span>
              <span style={styles.summaryValue}>{stats?.active_students || 0}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Adminlar:</span>
              <span style={styles.summaryValue}>{stats?.admins || 0}</span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Tez Harakatlar</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <button 
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => window.location.href = '/students'}
              >
                O'quvchilarni boshqarish
              </button>
              <button 
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => window.location.href = '/teachers'}
              >
                O'qituvchilarni boshqarish
              </button>
              <button 
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={() => window.location.href = '/groups'}
              >
                Guruhlarni boshqarish
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;