import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_ITEMS, APP_CONFIG } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const handleEmailSupport = () => {
    window.open('mailto:support@school.uz');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            🏫
          </div>
          <div>
            <h2 className="sidebar-title">{APP_CONFIG.NAME}</h2>
            <div className="text-xs text-gray-500">v{APP_CONFIG.VERSION}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onClose && onClose()}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer p-4 border-t border-gray-200 mt-auto">
          <div className="text-xs text-gray-500 text-center">
            <div>© 2025 {APP_CONFIG.AUTHOR}</div>
            <div className="mt-1">
              <button 
                type="button"
                className="text-blue-500 hover:underline bg-transparent border-none cursor-pointer text-xs"
                onClick={handleEmailSupport}
              >
                Yordam
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;