import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../services/api';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    // Set up interval to check for new notifications
    const interval = setInterval(loadUnreadCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await ApiService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tizimdan chiqishni tasdiqlaysizmi?')) {
      logout();
    }
  };

  const formatUserName = (user) => {
    if (!user) return 'Foydalanuvchi';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.full_name) {
      return user.full_name;
    }
    return user.phone || 'Admin';
  };

  return (
    <header className="header">
      {/* Mobile menu button */}
      <button 
        className="btn btn-sm md:hidden"
        onClick={onMenuClick}
        aria-label="Menu ochish"
      >
        ☰
      </button>

      {/* Header title */}
      <div className="header-title">
        Boshqaruv paneli
      </div>

      {/* Header actions */}
      <div className="header-actions">
        {/* Notifications */}
        <div className="relative">
          <button className="btn btn-sm">
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User menu */}
        <div className="relative">
          <button 
            className="user-info"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span>👤 {formatUserName(user)}</span>
            <span className="text-xs">({user?.role})</span>
            <span className="ml-1">▼</span>
          </button>

          {/* Dropdown menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-500 border-b">
                  {formatUserName(user)}
                  <div className="text-xs">{user?.phone}</div>
                </div>
                
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setShowProfileMenu(false);
                    // Navigate to profile page if exists
                    console.log('Navigate to profile');
                  }}
                >
                  👤 Profil
                </button>
                
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setShowProfileMenu(false);
                    // Navigate to settings page if exists
                    console.log('Navigate to settings');
                  }}
                >
                  ⚙️ Sozlamalar
                </button>
                
                <div className="border-t">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                  >
                    🚪 Chiqish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;