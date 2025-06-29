import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();

  // Check if device is mobile
  const checkIfMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Handle window resize
  useEffect(() => {
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [checkIfMobile]);

  // Handle menu item click
  const handleMenuItemClick = (path) => {
    // On mobile, close sidebar after selection
    if (isMobile) {
      setSidebarOpen(false);
    }
    // Navigate to the path
    window.location.href = path;
  };

  // Handle backdrop click on mobile
  const handleBackdropClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

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
    // Mobile backdrop
    backdrop: {
      display: isMobile && sidebarOpen ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999
    },
    sidebar: {
      width: isMobile 
        ? (sidebarOpen ? '250px' : '0px')
        : (sidebarOpen ? '250px' : '70px'),
      backgroundColor: '#1e293b',
      color: 'white',
      transition: 'width 0.3s ease',
      position: 'fixed',
      height: '100vh',
      zIndex: 1000,
      overflowY: 'auto',
      overflowX: 'hidden',
      // On mobile, hide completely when closed
      transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
    },
    sidebarHeader: {
      padding: '20px',
      borderBottom: '1px solid #334155',
      textAlign: 'center'
    },
    logo: {
      fontSize: (isMobile ? sidebarOpen : sidebarOpen) ? '18px' : '24px',
      fontWeight: 'bold',
      marginBottom: (isMobile ? sidebarOpen : sidebarOpen) ? '5px' : '0'
    },
    subtitle: {
      fontSize: '12px',
      color: '#94a3b8',
      display: (isMobile ? sidebarOpen : sidebarOpen) ? 'block' : 'none'
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
      marginRight: (isMobile ? sidebarOpen : sidebarOpen) ? '15px' : '0',
      minWidth: '20px'
    },
    menuText: {
      display: (isMobile ? sidebarOpen : sidebarOpen) ? 'block' : 'none',
      fontSize: '14px'
    },
    main: {
      flex: 1,
      marginLeft: isMobile 
        ? '0px'  // No margin on mobile
        : (sidebarOpen ? '250px' : '70px'),
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
      padding: '8px',
      borderRadius: '4px',
      transition: 'background-color 0.2s'
    },
    headerTitle: {
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: '600',
      color: '#111827'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '8px' : '16px'
    },
    userName: {
      fontSize: '14px',
      color: '#6b7280',
      display: isMobile ? 'none' : 'block'  // Hide username on mobile
    },
    logoutBtn: {
      backgroundColor: '#dc2626',
      color: 'white',
      padding: isMobile ? '6px 12px' : '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    content: {
      padding: isMobile ? '16px' : '24px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Mobile backdrop */}
      <div 
        style={styles.backdrop}
        onClick={handleBackdropClick}
      />
      
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            {(isMobile ? sidebarOpen : sidebarOpen) ? 'Admin Panel' : 'A'}
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
              onClick={() => handleMenuItemClick(item.path)}
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
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
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