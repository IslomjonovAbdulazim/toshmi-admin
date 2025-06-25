import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Pages - Admin Only
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Teachers from './pages/Teachers';
import TeacherDetail from './pages/TeacherDetail';
import Parents from './pages/Parents';
import Groups from './pages/Groups';
import Subjects from './pages/Subjects';
import Schedule from './pages/Schedule';
import Payments from './pages/Payments';
import News from './pages/News';
import Profile from './pages/Profile';

// Hooks
import { AuthProvider, useAuth } from './hooks/useAuth';

// Protected Route Component - Admin Only
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }
  
  // Only admin users can access
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') {
    // Log out non-admin users
    localStorage.removeItem('school_admin_token');
    localStorage.removeItem('school_admin_user');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Route - Login Only */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Admin Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    {/* Dashboard */}
                    <Route index element={<Dashboard />} />
                    
                    {/* Users Management */}
                    <Route path="students" element={<Students />} />
                    <Route path="students/:id" element={<StudentDetail />} />
                    <Route path="teachers" element={<Teachers />} />
                    <Route path="teachers/:id" element={<TeacherDetail />} />
                    <Route path="parents" element={<Parents />} />
                    
                    {/* Academic Management */}
                    <Route path="groups" element={<Groups />} />
                    <Route path="subjects" element={<Subjects />} />
                    <Route path="schedule" element={<Schedule />} />
                    
                    {/* Financial & Communication */}
                    <Route path="payments" element={<Payments />} />
                    <Route path="news" element={<News />} />
                    
                    {/* Admin Profile */}
                    <Route path="profile" element={<Profile />} />
                    
                    {/* 404 - Redirect to Dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;