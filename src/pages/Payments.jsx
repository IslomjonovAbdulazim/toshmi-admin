import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, UZBEK_MONTHS, MESSAGES } from '../utils/constants';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_method: PAYMENT_METHODS.CASH,
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    student_id: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    // Load payments when component mounts and when filters change
    loadPayments();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Since there's no specific payments endpoint in our API,
      // we'll simulate this by getting student payment data
      const studentsData = await ApiService.getStudents();
      const paymentsData = [];
      
      studentsData.forEach(student => {
        if (student.payments) {
          student.payments.forEach(payment => {
            const paymentDate = new Date(payment.payment_date);
            if (
              (!filters.month || paymentDate.getMonth() + 1 === filters.month) &&
              (!filters.year || paymentDate.getFullYear() === filters.year) &&
              (!filters.student_id || student.id === parseInt(filters.student_id))
            ) {
              paymentsData.push({
                ...payment,
                student: student
              });
            }
          });
        }
      });
      
      setPayments(paymentsData);
    } catch (error) {
      setError('To\'lovlarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await ApiService.getStudents();
      setStudents(data.filter(student => student.is_active));
    } catch (error) {
      console.error('O\'quvchilarni yuklashda xatolik:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const submitData = {
        student_id: parseInt(formData.student_id),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        description: formData.description
      };
      
      await ApiService.createPayment(submitData);
      setSuccess(MESSAGES.SUCCESS.CREATED);
      
      setShowModal(false);
      loadPayments();
      resetForm();
    } catch (error) {
      setError(error.message || 'To\'lov qo\'shishda xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      amount: '',
      payment_method: PAYMENT_METHODS.CASH,
      description: ''
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const getTotalAmount = () => {
    return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  };

  const getSelectedStudent = () => {
    return students.find(s => s.id === parseInt(formData.student_id));
  };

  const columns = [
    {
      key: 'student',
      label: 'O\'quvchi',
      render: (payment) => (
        <div>
          <div className="font-medium">
            {payment.student?.first_name} {payment.student?.last_name}
          </div>
          <div className="text-sm text-gray-500">
            {payment.student?.group?.name || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Miqdor',
      render: (payment) => (
        <div className="font-medium text-green-600">
          {formatCurrency(payment.amount)}
        </div>
      )
    },
    {
      key: 'payment_method',
      label: 'To\'lov usuli',
      render: (payment) => (
        <span className="badge">
          {PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method}
        </span>
      )
    },
    {
      key: 'payment_date',
      label: 'To\'lov sanasi',
      render: (payment) => new Date(payment.payment_date).toLocaleDateString('uz-UZ')
    },
    {
      key: 'description',
      label: 'Izoh',
      render: (payment) => (
        <div className="max-w-xs">
          <span className="text-sm">{payment.description || '-'}</span>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="header-title">To'lovlar boshqaruvi</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi to'lov
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      {/* Filters & Statistics */}
      <div className="grid grid-2 gap-6 mb-6">
        {/* Filters */}
        <Card title="Filtrlar">
          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Oy</label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="form-select"
              >
                {UZBEK_MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Yil</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="form-select"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">O'quvchi</label>
            <select
              name="student_id"
              value={filters.student_id}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">Barcha o'quvchilar</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                  {student.group && ` (${student.group.name})`}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setFilters({
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
              student_id: ''
            })}
            size="sm"
          >
            Filtrlarni tozalash
          </Button>
        </Card>

        {/* Statistics */}
        <Card title="Statistika">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jami to'lovlar:</span>
              <span className="font-bold text-lg">{payments.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Jami miqdor:</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(getTotalAmount())}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">O'rtacha to'lov:</span>
              <span className="font-medium">
                {payments.length > 0 
                  ? formatCurrency(getTotalAmount() / payments.length)
                  : '0 so\'m'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Davr:</span>
              <span className="font-medium">
                {UZBEK_MONTHS[filters.month - 1]} {filters.year}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={payments}
          loading={loading}
          emptyMessage="To'lovlar topilmadi"
        />
      </Card>

      {/* Payment Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Yangi to'lov qo'shish"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">O'quvchi *</label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">O'quvchini tanlang</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                  {student.group && ` - ${student.group.name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Miqdor (so'm) *</label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Masalan: 500000"
                required
                min="0"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">To'lov usuli *</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="form-select"
                required
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Izoh</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="To'lov haqida qo'shimcha ma'lumot..."
              className="form-textarea"
              rows="3"
            />
          </div>

          {/* Payment Preview */}
          {formData.student_id && formData.amount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">To'lov ma'lumotlari:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <div>
                  <strong>O'quvchi:</strong> {getSelectedStudent()?.first_name} {getSelectedStudent()?.last_name}
                </div>
                <div>
                  <strong>Miqdor:</strong> {formatCurrency(parseFloat(formData.amount) || 0)}
                </div>
                <div>
                  <strong>Usul:</strong> {PAYMENT_METHOD_LABELS[formData.payment_method]}
                </div>
                <div>
                  <strong>Sana:</strong> {new Date().toLocaleDateString('uz-UZ')}
                </div>
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Bekor qilish
            </Button>
            <Button type="submit">
              To'lovni saqlash
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;