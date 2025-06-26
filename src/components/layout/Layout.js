import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Bosh sahifa', path: '/', icon: '🏠' },
    { name: 'O\'quvchilar', path: '/students', icon: '👨‍🎓' },
    { name: 'O\'qituvchilar', path: '/teachers', icon: '👩‍🏫' },
    { name: 'Ota-onalar', path: '/parents', icon: '👪' },
    { name: 'Guruhlar', path: '/groups', icon: '📚' },
    { name: 'Fanlar', path: '/subjects', icon: '📖' },
    { name: 'Yangiliklar', path: '/news', icon: '📰' },
    { name: 'To\'lovlar', path: '/payments', icon: '💰' },
    { name: 'Tayinlovlar', path: '/assignments', icon: '🎯' }
  ];

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    sidebar: {
      width: sidebarOpen ? '250px' : '70px',
      backgroundColor: '#1e293b',
      color: 'white',
      transition: 'width 0.3s ease',
      position: 'fixed',
      height: '100vh',
      zIndex: 1000,
      overflowY: 'auto'
    },
    sidebarHeader: {
      padding: '20px',
      borderBottom: '1px solid #334155',
      textAlign: 'center'
    },
    logo: {
      fontSize: sidebarOpen ? '18px' : '24px',
      fontWeight: 'bold',
      marginBottom: sidebarOpen ? '5px' : '0'
    },
    subtitle: {
      fontSize: '12px',
      color: '#94a3b8',
      display: sidebarOpen ? 'block' : 'none'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px 20px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderBottom: '1px solid #334155'
    },
    menuItemHover: {
      backgroundColor: '#334155'
    },
    menuIcon: {
      fontSize: '20px',
      marginRight: sidebarOpen ? '15px' : '0',
      minWidth: '20px'
    },
    menuText: {
      display: sidebarOpen ? 'block' : 'none',
      fontSize: '14px'
    },
    main: {
      flex: 1,
      marginLeft: sidebarOpen ? '250px' : '70px',
      transition: 'margin-left 0.3s ease'
    },
    header: {
      backgroundColor: 'white',
      padding: '16px 24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    toggleBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px'
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    userName: {
      fontSize: '14px',
      color: '#6b7280'
    },
    logoutBtn: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    content: {
      padding: '24px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            {sidebarOpen ? 'Admin Panel' : 'A'}
          </div>
          <div style={styles.subtitle}>
            Maktab Boshqaruv Tizimi
          </div>
        </div>
        
        <nav>
          {menuItems.map((item, index) => (
            <div
              key={index}
              style={styles.menuItem}
              onMouseOver={(e) => e.target.style.backgroundColor = '#334155'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => window.location.href = item.path}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <span style={styles.menuText}>{item.name}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              style={styles.toggleBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 style={styles.headerTitle}>Admin Panel</h1>
          </div>
          
          <div style={styles.userInfo}>
            <span style={styles.userName}>
              Xush kelibsiz, {user?.name}
            </span>
            <button
              style={styles.logoutBtn}
              onClick={logout}
              onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              Chiqish
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;