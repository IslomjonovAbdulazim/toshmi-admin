import React from 'react';
import useWebSocket from '../../hooks/useWebSocket';

const ActivityMonitor = () => {
  const { 
    connectionState, 
    activityData, 
    lastUpdate, 
    totalRecords,
    isConnected, 
    isConnecting, 
    hasError 
  } = useWebSocket();

  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Hech qachon';
    
    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffMs = now - lastActive;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Hozir';
    if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    return `${diffDays} kun oldin`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'OPEN': return '#10b981';
      case 'CONNECTING': return '#f59e0b';
      case 'ERROR':
      case 'FAILED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'OPEN': return 'Ulangan';
      case 'CONNECTING': return 'Ulanmoqda...';
      case 'ERROR': return 'Xatolik';
      case 'FAILED': return 'Muvaffaqiyatsiz';
      case 'CLOSED': return 'Uzilgan';
      default: return 'Noma\'lum';
    }
  };

  const styles = {
    container: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    },
    header: {
      padding: '20px 24px 16px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    connectionStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500'
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: getConnectionStatusColor()
    },
    statusText: {
      color: getConnectionStatusColor()
    },
    stats: {
      padding: '16px 24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px'
    },
    statItem: {
      textAlign: 'center'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500'
    },
    content: {
      maxHeight: '300px',
      overflowY: 'auto'
    },
    activityList: {
      padding: '16px 0'
    },
    activityItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 24px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '14px'
    },
    'activityItem:last-child': {
      borderBottom: 'none'
    },
    phone: {
      fontWeight: '500',
      color: '#111827'
    },
    lastActive: {
      color: '#6b7280',
      fontSize: '12px'
    },
    loadingContainer: {
      padding: '40px 24px',
      textAlign: 'center'
    },
    spinner: {
      border: '3px solid #f3f4f6',
      borderTop: '3px solid #2563eb',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 12px'
    },
    loadingText: {
      color: '#6b7280',
      fontSize: '14px'
    },
    emptyState: {
      padding: '40px 24px',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '14px'
    },
    errorState: {
      padding: '20px 24px',
      textAlign: 'center',
      background: '#fef2f2',
      color: '#dc2626',
      fontSize: '14px',
      margin: '16px 24px',
      borderRadius: '8px',
      border: '1px solid #fecaca'
    },
    lastUpdateInfo: {
      padding: '12px 24px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      fontSize: '12px',
      color: '#6b7280',
      textAlign: 'center'
    }
  };

  const renderContent = () => {
    if (hasError) {
      return (
        <div style={styles.errorState}>
          WebSocket ulanishida xatolik yuz berdi. Sahifani yangilab ko'ring.
        </div>
      );
    }

    if (isConnecting) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingText}>Faollik ma'lumotlari yuklanmoqda...</div>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div style={styles.emptyState}>
          Server bilan aloqa o'rnatilmagan
        </div>
      );
    }

    if (activityData.length === 0) {
      return (
        <div style={styles.emptyState}>
          Hech qanday faol foydalanuvchi topilmadi
        </div>
      );
    }

    return (
      <div style={styles.content}>
        <div style={styles.activityList}>
          {activityData.map((activity) => (
            <div key={activity.id} style={styles.activityItem}>
              <span style={styles.phone}>{activity.phone}</span>
              <span style={styles.lastActive}>
                {formatLastActive(activity.last_active)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>🟢 Faol Foydalanuvchilar</h3>
          <div style={styles.connectionStatus}>
            <div style={styles.statusDot}></div>
            <span style={styles.statusText}>{getConnectionStatusText()}</span>
          </div>
        </div>

        {isConnected && (
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{totalRecords}</div>
              <div style={styles.statLabel}>Jami foydalanuvchilar</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{activityData.length}</div>
              <div style={styles.statLabel}>Faol foydalanuvchilar</div>
            </div>
          </div>
        )}

        {renderContent()}

        {lastUpdate && isConnected && (
          <div style={styles.lastUpdateInfo}>
            Oxirgi yangilanish: {new Date(lastUpdate).toLocaleTimeString('uz-UZ')}
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityMonitor;