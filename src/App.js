import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import SubjectsPage from './pages/SubjectsPage';
import NewsPage from './pages/NewsPage';
import StudentsPage from './pages/StudentsPage';
import ParentsPage from './pages/ParentsPage';
import TeachersPage from './pages/TeachersPage';
import GroupsPage from './pages/GroupsPage';
import GroupSchedulePage from './pages/GroupSchedulePage';
import PaymentsPage from './pages/PaymentsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import { ROUTES } from './utils/constants';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="spinner" style={{width: '40px', height: '40px'}}></div>
          <p style={{color: '#6b7280', fontSize: '14px'}}>Yuklanmoqda...</p>
        </div>
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
      <Route 
        path={ROUTES.TEACHERS} 
        element={
          <ProtectedRoute>
            <TeachersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.GROUPS} 
        element={
          <ProtectedRoute>
            <GroupsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/groups/:groupId/schedule" 
        element={
          <ProtectedRoute>
            <GroupSchedulePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.PAYMENTS} 
        element={
          <ProtectedRoute>
            <PaymentsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path={ROUTES.ASSIGNMENTS} 
        element={
          <ProtectedRoute>
            <AssignmentsPage />
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
