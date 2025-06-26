import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';

const PaymentForm = ({ onClose, onSuccess, preSelectedStudent = null }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    description: ''
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    if (preSelectedStudent) {
      setFormData(prev => ({
        ...prev,
        student_id: preSelectedStudent.id
      }));
      setSelectedStudent(preSelectedStudent);
      setStudentSearch(`${preSelectedStudent.name} (${preSelectedStudent.phone})`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data.filter(student => student.is_active));
    } catch (err) {
      console.error('Students fetch error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleStudentSelect = (student) => {
    setFormData(prev => ({...prev, student_id: student.id}));
    setSelectedStudent(student);
    setStudentSearch(`${student.name} (${student.phone})`);
    setShowStudentDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.student_id) {
      setError('O\'quvchi tanlanishi shart');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('To\'lov miqdori kiritilishi va 0 dan katta bo\'lishi shart');
      return;
    }
    if (!formData.payment_date) {
      setError('To\'lov sanasi kiritilishi shart');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        student_id: parseInt(formData.student_id),
        amount: parseInt(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        description: formData.description
      };

      await paymentService.recordPayment(submitData);
      onSuccess();
    } catch (err) {
      setError('To\'lov qayd etishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Common payment amounts for quick selection
  const quickAmounts = [50000, 100000, 150000, 200000, 250000, 300000, 500000, 1000000];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    titleIcon: {
      fontSize: '24px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      position: 'relative'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    select: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    textarea: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      maxHeight: '200px',
      overflowY: 'auto'
    },
    dropdownItem: {
      padding: '12px',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f4f6'
    },
    studentName: {
      fontWeight: '500',
      color: '#111827'
    },
    studentInfo: {
      fontSize: '12px',
      color: '#6b7280'
    },
    quickAmounts: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '8px',
      marginTop: '8px'
    },
    quickAmountBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      textAlign: 'center',
      transition: 'all 0.2s'
    },
    quickAmountBtnHover: {
      backgroundColor: '#e5e7eb',
      borderColor: '#9ca3af'
    },
    selectedStudent: {
      marginTop: '8px',
      padding: '12px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      border: '1px solid #bfdbfe',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    selectedStudentInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    selectedStudentName: {
      fontWeight: '600',
      color: '#1e40af'
    },
    selectedStudentDetails: {
      fontSize: '12px',
      color: '#6b7280'
    },
    clearBtn: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    paymentMethodGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px'
    },
    paymentMethodOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    paymentMethodSelected: {
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff'
    },
    paymentMethodIcon: {
      fontSize: '20px'
    },
    paymentMethodText: {
      fontSize: '14px',
      fontWeight: '500'
    },
    amountDisplay: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#059669',
      textAlign: 'center',
      padding: '12px',
      backgroundColor: '#f0fdf4',
      borderRadius: '8px',
      border: '1px solid #bbf7d0'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '8px'
    },
    cancelBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    submitBtn: {
      backgroundColor: '#059669',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      minWidth: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    submitBtnDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Naqd', icon: '💵' },
    { value: 'card', label: 'Karta', icon: '💳' },
    { value: 'transfer', label: 'O\'tkazma', icon: '📱' }
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <span style={styles.titleIcon}>💰</span>
            To'lov qayd etish
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Student Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>O'quvchi *</label>
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setShowStudentDropdown(true);
              }}
              onFocus={() => setShowStudentDropdown(true)}
              onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
              style={styles.input}
              placeholder="O'quvchi ismini qidiring..."
              disabled={preSelectedStudent}
            />
            {showStudentDropdown && studentSearch && !preSelectedStudent && (
              <div style={styles.dropdown}>
                {students
                  .filter(student => 
                    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    student.phone.includes(studentSearch)
                  )
                  .slice(0, 10)
                  .map(student => (
                    <div
                      key={student.id}
                      style={styles.dropdownItem}
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div style={styles.studentName}>{student.name}</div>
                      <div style={styles.studentInfo}>
                        {student.phone} • {student.group_name}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
            {selectedStudent && (
              <div style={styles.selectedStudent}>
                <div style={styles.selectedStudentInfo}>
                  <div style={styles.selectedStudentName}>{selectedStudent.name}</div>
                  <div style={styles.selectedStudentDetails}>
                    {selectedStudent.phone} • {selectedStudent.group_name}
                  </div>
                </div>
                {!preSelectedStudent && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({...prev, student_id: ''}));
                      setSelectedStudent(null);
                      setStudentSearch('');
                    }}
                    style={styles.clearBtn}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Amount */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>To'lov miqdori (so'm) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              style={styles.input}
              placeholder="0"
              min="0"
              step="1000"
              required
            />
            <div style={styles.quickAmounts}>
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, amount: amount.toString()}))}
                  style={styles.quickAmountBtn}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = styles.quickAmountBtnHover.backgroundColor;
                    e.target.style.borderColor = styles.quickAmountBtnHover.borderColor;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = styles.quickAmountBtn.backgroundColor;
                    e.target.style.borderColor = styles.quickAmountBtn.borderColor;
                  }}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
            {formData.amount && (
              <div style={styles.amountDisplay}>
                💰 {formatCurrency(parseInt(formData.amount) || 0)}
              </div>
            )}
          </div>

          {/* Payment Date */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>To'lov sanasi *</label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* Payment Method */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>To'lov usuli *</label>
            <div style={styles.paymentMethodGrid}>
              {paymentMethods.map(method => (
                <div
                  key={method.value}
                  style={{
                    ...styles.paymentMethodOption,
                    ...(formData.payment_method === method.value ? styles.paymentMethodSelected : {})
                  }}
                  onClick={() => setFormData(prev => ({...prev, payment_method: method.value}))}
                >
                  <span style={styles.paymentMethodIcon}>{method.icon}</span>
                  <span style={styles.paymentMethodText}>{method.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Izoh (ixtiyoriy)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Masalan: Yanvar oyi uchun to'lov, qo'shimcha xizmatlar uchun..."
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{width: '16px', height: '16px'}}></div>
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  💾 To'lovni qayd etish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;