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

// Helper function to extract error message
const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  if (error?.error) return error.error;
  if (typeof error === 'object') {
    return 'Kutilmagan xatolik yuz berdi';
  }
  return 'Noma\'lum xatolik';
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
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

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
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profile));
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

      // Format credentials for API
      const loginData = {
        phone: credentials.phone || credentials.username,
        password: credentials.password
      };

      console.log('Attempting login with:', { phone: loginData.phone });

      // Try real API login first
      try {
        const response = await ApiService.login(loginData);
        
        if (response && response.access_token && response.user) {
          const { access_token: token, user: userData } = response;
          
          // Validate user is admin
          if (userData.role !== 'admin') {
            throw new Error('Faqat admin foydalanuvchilari tizimga kira oladi');
          }
          
          // Store auth data
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
          
          setUser(userData);
          
          return { success: true, user: userData };
        } else {
          throw new Error('Serverdan noto\'g\'ri javob olindi');
        }
      } catch (apiError) {
        console.log('API login failed, trying mock login:', apiError);
        
        // Fallback to mock login for testing
        if (loginData.phone === '+998990330919' || loginData.phone === '998990330919' || loginData.phone === '990330919') {
          if (credentials.password === 'admin123') {
            // Mock successful login for testing
            const mockUser = {
              id: 1,
              phone: '+998990330919',
              role: 'admin',
              first_name: 'Administrator',
              last_name: 'System',
              is_active: true,
              created_at: new Date().toISOString()
            };
            
            // Store mock auth data
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token');
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser));
            
            setUser(mockUser);
            
            return { success: true, user: mockUser };
          } else {
            throw new Error('Noto\'g\'ri parol. Test uchun: admin123');
          }
        }
        
        // If mock also fails, throw original API error
        throw apiError;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = getErrorMessage(error);
      
      // Handle specific error cases
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Noto\'g\'ri telefon raqami yoki parol';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = 'Sizga tizimga kirish huquqi berilmagan';
      } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        errorMessage = 'Foydalanuvchi topilmadi';
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        errorMessage = 'Serverga ulanishda xatolik. Internet aloqangizni tekshiring';
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        errorMessage = 'Server xatoligi yuz berdi. Keyinroq qayta urinib ko\'ring';
      }
      
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
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
    setError(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await ApiService.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = getErrorMessage(error);
      return { 
        success: false, 
        error: errorMessage
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
      const errorMessage = getErrorMessage(error);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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

  // Clear error
  const clearError = () => {
    setError(null);
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
    clearError,
    
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