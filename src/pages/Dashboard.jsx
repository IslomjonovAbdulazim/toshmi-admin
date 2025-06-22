import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import ApiService from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_parents: 0,
    monthly_payments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await ApiService.getOverviewReport();
      setStats(data);
    } catch (error) {
      console.error('Statistikani yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <h1 className="header-title mb-4">Asosiy sahifa</h1>
      
      <div className="grid grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-number">{stats.total_students}</div>
          <div className="stat-label">O'quvchilar soni</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.total_teachers}</div>
          <div className="stat-label">O'qituvchilar soni</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.total_parents}</div>
          <div className="stat-label">Ota-onalar soni</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.monthly_payments}</div>
          <div className="stat-label">Oylik to'lovlar</div>
        </div>
      </div>

      <div className="grid grid-2">
        <Card title="Tez havolalar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/students" className="btn">O'quvchilarni boshqarish</a>
            <a href="/users" className="btn">Foydalanuvchilar</a>
            <a href="/payments" className="btn">To'lovlar</a>
            <a href="/news" className="btn">Yangiliklar</a>
          </div>
        </Card>

        <Card title="So'nggi faoliyat">
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>
            Tizimda so'nggi faoliyat ma'lumotlari bu yerda ko'rsatiladi.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;