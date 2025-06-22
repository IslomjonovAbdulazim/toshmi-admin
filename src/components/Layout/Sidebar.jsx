import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_ITEMS } from '../../utils/constants';
import logo from '../../assets/logo.svg';

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="sidebar-title">Maktab tizimi</h2>
      </div>
      <nav className="sidebar-nav">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;