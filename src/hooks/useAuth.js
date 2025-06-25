import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && storedUser) {
          try {
            // Parse stored user
            const userData = JSON.parse(storedUser);
            setUser(userData);
            
            // If it's a mock token, just use stored data
            if (token === 'mock-jwt-token') {
              return;
            }
            
            // Otherwise verify token is still valid by fetching fresh profile
            const profile = await ApiService.getProfile();
            setUser(profile);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
          } catch (error) {
            console.error('Token verification failed:', error);
            // Token is invalid, clear auth
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // Check if we already have mock auth (for testing)
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (token === 'mock-jwt-token' && storedUser) {
        setUser(JSON.parse(storedUser));
        return { success: true };
      }

      // Try real API login
      const response = await ApiService.login(credentials);
      
      if (response.access_token && response.user) {
        const { access_token: token, user: userData } = response;
        
        // Store auth data
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        setUser(userData);
        
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Kirishda xatolik yuz berdi';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setError(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await ApiService.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.message || 'Profilni yangilashda xatolik yuz berdi' 
      };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await ApiService.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: error.message || 'Parolni o\'zgartirishda xatolik yuz berdi' 
      };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Get user permissions
  const getPermissions = () => {
    if (!user) return [];
    
    // Admin has all permissions
    if (user.role === 'admin') {
      return ['all'];
    }
    
    // Other roles have limited permissions
    return [user.role];
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    const permissions = getPermissions();
    return permissions.includes('all') || permissions.includes(permission);
  };

  // Refresh token (optional implementation)
  const refreshToken = async () => {
    try {
      // If your backend supports token refresh, implement here
      // For now, we'll just verify current token
      const profile = await ApiService.getProfile();
      setUser(profile);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return { success: false };
    }
  };

  // Context value
  const value = {
    // State
    user,
    loading,
    error,
    
    // Actions
    login,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    
    // Helpers
    isAuthenticated,
    isAdmin,
    hasRole,
    hasPermission,
    getPermissions,
    
    // Utils
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};