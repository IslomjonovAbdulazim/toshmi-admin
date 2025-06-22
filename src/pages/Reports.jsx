import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { UZBEK_MONTHS } from '../utils/constants';

const Reports = () => {
  const [overview, setOverview] = useState(null);
  const [paymentReport, setPaymentReport] = useState(null);
  const [classReport, setClassReport] = useState(null);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  
  const [paymentFilter, setPaymentFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  const [classFilter, setClassFilter] = useState({
    group_id: '',
    subject_id: ''
  });

  useEffect(() => {
    loadOverview();
    loadGroups();
    loadSubjects();
  }, []);

  const loadOverview = async () => {
    setLoading(prev => ({...prev, overview: true}));
    try {
      const data = await ApiService.getOverviewReport();
      setOverview(data);
    } catch (error) {
      setError('Umumiy hisobotni yuklashda xatolik');
    } finally {
      setLoading(prev => ({...prev, overview: false}));
    }
  };

  const loadGroups = async () => {
    try {
      const data = await ApiService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Guruhlarni yuklashda xatolik:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await ApiService.getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Fanlarni yuklashda xatolik:', error);
    }
  };

  const loadPaymentReport = async () => {
    setLoading(prev => ({...prev, payment: true}));
    try {
      const data = await ApiService.getPaymentReport(
        paymentFilter.month, 
        paymentFilter.year
      );
      setPaymentReport(data);
    } catch (error) {
      setError('To\'lov hisobotini yuklashda xatolik');
    } finally {
      setLoading(prev => ({...prev, payment: false}));
    }
  };

  const loadClassReport = async () => {
    if (!classFilter.group_id || !classFilter.subject_id) {
      setError('Guruh va fanni tanlang');
      return;
    }
    
    setLoading(prev => ({...prev, class: true}));
    try {
      const data = await ApiService.getClassReport(
        classFilter.group_id, 
        classFilter.subject_id
      );
      setClassReport(data);
    } catch (error) {
      setError('Sinf hisobotini yuklashda xatolik');
    } finally {
      setLoading(prev => ({...prev, class: false}));
    }
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Noma\'lum';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Noma\'lum';
  };

  return (
    <div>
      <h1 className="header-title mb-4">Hisobotlar</h1>

      {error && <div className="error mb-4">{error}</div>}

      {/* Overview Report */}
      <Card title="Umumiy statistika">
        {loading.overview ? (
          <div className="loading">Yuklanmoqda...</div>
        ) : overview ? (
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-number">{overview.total_students}</div>
              <div className="stat-label">O'quvchilar</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{overview.total_teachers}</div>
              <div className="stat-label">O'qituvchilar</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{overview.total_parents}</div>
              <div className="stat-label">Ota-onalar</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{overview.monthly_payments}</div>
              <div className="stat-label">Oylik to'lovlar</div>
            </div>
          </div>
        ) : (
          <Button onClick={loadOverview}>Hisobotni yuklash</Button>
        )}
      </Card>

      {/* Payment Report */}
      <Card title="To'lovlar hisoboti">
        <div className="grid grid-3 mb-4">
          <div className="form-group">
            <label className="form-label">Oy</label>
            <select
              value={paymentFilter.month}
              onChange={(e) => setPaymentFilter({...paymentFilter, month: e.target.value})}
              className="form-select"
            >
              {UZBEK_MONTHS.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>

          <Input
            label="Yil"
            type="number"
            value={paymentFilter.year}
            onChange={(e) => setPaymentFilter({...paymentFilter, year: e.target.value})}
          />
          
          <div className="form-group">
            <Button onClick={loadPaymentReport} variant="primary">
              Hisobotni yuklash
            </Button>
          </div>
        </div>

        {loading.payment ? (
          <div className="loading">Yuklanmoqda...</div>
        ) : paymentReport ? (
          <div className="grid grid-2">
            <div className="stat-card">
              <div className="stat-number" style={{color: '#38a169'}}>
                {paymentReport.total_paid.toLocaleString()} so'm
              </div>
              <div className="stat-label">To'langan summa</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{color: '#e53e3e'}}>
                {paymentReport.total_unpaid.toLocaleString()} so'm
              </div>
              <div className="stat-label">To'lanmagan summa</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{paymentReport.students_paid}</div>
              <div className="stat-label">To'lagan o'quvchilar</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{paymentReport.students_unpaid}</div>
              <div className="stat-label">To'lamagan o'quvchilar</div>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Class Report */}
      <Card title="Sinf hisoboti">
        <div className="grid grid-3 mb-4">
          <div className="form-group">
            <label className="form-label">Guruh</label>
            <select
              value={classFilter.group_id}
              onChange={(e) => setClassFilter({...classFilter, group_id: e.target.value})}
              className="form-select"
            >
              <option value="">Guruhni tanlang</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fan</label>
            <select
              value={classFilter.subject_id}
              onChange={(e) => setClassFilter({...classFilter, subject_id: e.target.value})}
              className="form-select"
            >
              <option value="">Fanni tanlang</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <Button onClick={loadClassReport} variant="primary">
              Hisobotni yuklash
            </Button>
          </div>
        </div>

        {loading.class ? (
          <div className="loading">Yuklanmoqda...</div>
        ) : classReport ? (
          <div>
            <h4 style={{marginBottom: '16px'}}>
              {getGroupName(classReport.group_id)} - {getSubjectName(classReport.subject_id)}
            </h4>
            <div className="grid grid-3">
              <div className="stat-card">
                <div className="stat-number">{classReport.average_grade.toFixed(1)}</div>
                <div className="stat-label">O'rtacha baho</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{classReport.total_students}</div>
                <div className="stat-label">O'quvchilar soni</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{classReport.assignments_count}</div>
                <div className="stat-label">Vazifalar soni</div>
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default Reports;