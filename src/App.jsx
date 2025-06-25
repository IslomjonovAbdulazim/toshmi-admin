import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Parents from './pages/Parents';
import Groups from './pages/Groups';
import Subjects from './pages/Subjects';
import Assignments from './pages/Assignments';
import Schedule from './pages/Schedule';
import Payments from './pages/Payments';
import News from './pages/News';

// Hooks
import { AuthProvider, useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Yuklanmoqda...
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="students" element={<Students />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="parents" element={<Parents />} />
                  <Route path="groups" element={<Groups />} />
                  <Route path="subjects" element={<Subjects />} />
                  <Route path="assignments" element={<Assignments />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="news" element={<News />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;