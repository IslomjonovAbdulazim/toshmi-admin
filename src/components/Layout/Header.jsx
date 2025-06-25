import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    navigate('/profile');
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
        Admin Paneli
      </div>

      {/* Header actions */}
      <div className="header-actions">
        {/* System status indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="hidden md:inline">Faol</span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button 
            className="user-info"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {/* User avatar */}
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
              {user?.profile_image_id ? (
                <img 
                  src={`/files/${user.profile_image_id}`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {user?.first_name?.charAt(0) || 'A'}
                </span>
              )}
            </div>
            
            {/* User info */}
            <div className="hidden md:block text-left">
              <div className="font-medium">{formatUserName(user)}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
            </div>
            
            <span className="ml-2 text-gray-400">▼</span>
          </button>

          {/* Dropdown menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-900">{formatUserName(user)}</div>
                  <div className="text-sm text-gray-500">{user?.phone}</div>
                  <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
                </div>
                
                {/* Menu items */}
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={handleProfileClick}
                >
                  <span className="mr-3">👤</span>
                  Profil sozlamalari
                </button>
                
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/');
                  }}
                >
                  <span className="mr-3">🏠</span>
                  Bosh sahifa
                </button>

                <div className="border-t border-gray-100 mt-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                  >
                    <span className="mr-3">🚪</span>
                    Tizimdan chiqish
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