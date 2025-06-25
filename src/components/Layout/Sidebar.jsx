import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      icon: '📊',
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/students',
      icon: '👨‍🎓',
      label: 'O\'quvchilar'
    },
    {
      path: '/teachers',
      icon: '👩‍🏫',
      label: 'O\'qituvchilar'
    },
    {
      path: '/parents',
      icon: '👨‍👩‍👧‍👦',
      label: 'Ota-onalar'
    },
    {
      path: '/groups',
      icon: '👥',
      label: 'Guruhlar'
    },
    {
      path: '/subjects',
      icon: '📚',
      label: 'Fanlar'
    },
    {
      path: '/schedule',
      icon: '📅',
      label: 'Dars jadvali'
    },
    {
      path: '/payments',
      icon: '💰',
      label: 'To\'lovlar'
    },
    {
      path: '/news',
      icon: '📰',
      label: 'Yangiliklar'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🏫</span>
          {!isCollapsed && (
            <div className="logo-text">
              <span className="logo-title">School</span>
              <span className="logo-subtitle">Admin</span>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          title={isCollapsed ? 'Kengaytirish' : 'Yig\'ish'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user.first_name} />
            ) : (
              <span className="user-initials">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
                {isActive(item.path, item.exact) && (
                  <span className="nav-indicator"></span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="footer-content">
            <div className="app-version">
              <span className="version-label">Versiya</span>
              <span className="version-number">2.0.0</span>
            </div>
            <div className="footer-links">
              <NavLink to="/profile" className="footer-link">
                ⚙️ Sozlamalar
              </NavLink>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="footer-icons">
            <NavLink to="/profile" className="footer-icon" title="Sozlamalar">
              ⚙️
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;