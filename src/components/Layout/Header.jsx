import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-title">
        Boshqaruv paneli
      </div>
      <div className="header-actions">
        <div className="user-info">
          <span>👤 {user?.full_name}</span>
          <span>({user?.role})</span>
        </div>
        <button 
          onClick={logout}
          className="btn btn-sm"
        >
          Chiqish
        </button>
      </div>
    </header>
  );
};

export default Header;