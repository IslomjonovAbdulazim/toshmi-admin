import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { UZBEK_MONTHS } from '../utils/constants';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filterForm, setFilterForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [newPayment, setNewPayment] = useState({
    student_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount_paid: '',
    is_fully_paid: false,
    comment: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayments();
    loadStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getPayments(filterForm);
      setPayments(data);
    } catch (error) {
      setError('To\'lovlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await ApiService.searchStudents({});
      setStudents(data);
    } catch (error) {
      console.error('O\'quvchilarni yuklashda xatolik:', error);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await ApiService.createPayment({
        ...newPayment,
        amount_paid: parseFloat(newPayment.amount_paid)
      });
      
      setShowModal(false);
      loadPayments();
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdatePayment = async (payment, isFullyPaid) => {
    try {
      await ApiService.updatePayment(payment.id, {
        is_fully_paid: isFullyPaid,
        comment: isFullyPaid ? 'To\'liq to\'landi' : 'Qisman to\'landi'
      });
      loadPayments();
    } catch (error) {
      setError('To\'lovni yangilashda xatolik');
    }
  };

  const resetForm = () => {
    setNewPayment({
      student_id: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount_paid: '',
      is_fully_paid: false,
      comment: ''
    });
    setError('');
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadPayments();
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student?.user?.full_name || 'Noma\'lum';
  };

  const columns = [
    { key: 'student_id', title: 'O\'quvchi', render: (studentId) => getStudentName(studentId) },
    { key: 'month', title: 'Oy', render: (month) => UZBEK_MONTHS[month - 1] },
    { key: 'year', title: 'Yil' },
    { key: 'amount_paid', title: 'To\'langan summa', render: (amount) => `${amount.toLocaleString()} so'm` },
    { key: 'is_fully_paid', title: 'Holati', render: (isFullyPaid) => (
      <span className={`badge ${isFullyPaid ? 'badge-success' : 'badge-warning'}`}>
        {isFullyPaid ? 'To\'liq' : 'Qisman'}
      </span>
    )},
    { key: 'paid_at', title: 'To\'langan sana', render: (date) => 
      new Date(date).toLocaleDateString('uz-UZ') 
    }
  ];

  const actions = (payment) => (
    <>
      {!payment.is_fully_paid && (
        <Button 
          size="sm" 
          variant="primary"
          onClick={() => handleUpdatePayment(payment, true)}
        >
          To'liq deb belgilash
        </Button>
      )}
      {payment.is_fully_paid && (
        <Button 
          size="sm"
          onClick={() => handleUpdatePayment(payment, false)}
        >
          Qisman deb belgilash
        </Button>
      )}
    </>
  );

  return (
    <div>
      <Card title="To'lovlar filtri">
        <form onSubmit={handleFilter} className="grid grid-3">
          <div className="form-group">
            <label className="form-label">Oy</label>
            <select
              value={filterForm.month}
              onChange={(e) => setFilterForm({...filterForm, month: e.target.value})}
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
            value={filterForm.year}
            onChange={(e) => setFilterForm({...filterForm, year: e.target.value})}
          />
          
          <div className="form-group">
            <Button type="submit" variant="primary">Filtr</Button>
          </div>
        </form>
      </Card>

      <Card 
        title="To'lovlar ro'yxati"
        actions={
          <Button 
            variant="primary" 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Yangi to'lov
          </Button>
        }
      >
        {error && <div className="error mb-4">{error}</div>}
        
        {loading ? (
          <div className="loading">Yuklanmoqda...</div>
        ) : (
          <Table 
            columns={columns}
            data={payments}
            actions={actions}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yangi to'lov qo'shish"
      >
        <form onSubmit={handleCreatePayment}>
          <div className="form-group">
            <label className="form-label">O'quvchi</label>
            <select
              value={newPayment.student_id}
              onChange={(e) => setNewPayment({...newPayment, student_id: e.target.value})}
              className="form-select"
              required
            >
              <option value="">O'quvchini tanlang</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.user?.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Oy</label>
            <select
              value={newPayment.month}
              onChange={(e) => setNewPayment({...newPayment, month: e.target.value})}
              className="form-select"
              required
            >
              {UZBEK_MONTHS.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>

          <Input
            label="Yil"
            type="number"
            value={newPayment.year}
            onChange={(e) => setNewPayment({...newPayment, year: e.target.value})}
            required
          />

          <Input
            label="To'langan summa"
            type="number"
            value={newPayment.amount_paid}
            onChange={(e) => setNewPayment({...newPayment, amount_paid: e.target.value})}
            placeholder="500000"
            required
          />

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={newPayment.is_fully_paid}
                onChange={(e) => setNewPayment({...newPayment, is_fully_paid: e.target.checked})}
              />
              {' '}To'liq to'landi
            </label>
          </div>

          <Input
            label="Izoh"
            type="textarea"
            value={newPayment.comment}
            onChange={(e) => setNewPayment({...newPayment, comment: e.target.value})}
          />

          {error && <div className="error">{error}</div>}

          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary">
              Saqlash
            </Button>
            <Button onClick={() => setShowModal(false)}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;