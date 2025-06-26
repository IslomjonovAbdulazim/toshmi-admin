import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import SubjectsPage from './pages/SubjectsPage';
import NewsPage from './pages/NewsPage';
import StudentsPage from './pages/StudentsPage';
import ParentsPage from './pages/ParentsPage';
import { ROUTES } from './utils/constants';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.SUBJECTS} 
        element={
          <ProtectedRoute>
            <SubjectsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.NEWS} 
        element={
          <ProtectedRoute>
            <NewsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.STUDENTS} 
        element={
          <ProtectedRoute>
            <StudentsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.PARENTS} 
        element={
          <ProtectedRoute>
            <ParentsPage />
          </ProtectedRoute>
        } 
      />
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;