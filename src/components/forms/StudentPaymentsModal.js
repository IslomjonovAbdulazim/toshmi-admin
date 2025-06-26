import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';

const StudentPaymentsModal = ({ student, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (student) {
      fetchStudentPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, selectedYear]);

  const fetchStudentPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all payments for this student
      const response = await paymentService.getAllPayments({
        student_id: student.id,
        limit: 1000 // Get all payments
      });
      
      // Filter by selected year
      const yearPayments = response.data.filter(payment => {
        const paymentYear = new Date(payment.payment_date).getFullYear();
        return paymentYear === selectedYear;
      });
      
      // Sort by date (newest first)
      yearPayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
      
      setPayments(yearPayments);
    } catch (err) {
      setError('To\'lovlar tarixini olishda xatolik');
      console.error('Student payments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group payments by month
  const groupPaymentsByMonth = () => {
    const grouped = {};
    
    payments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          monthName: date.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' }),
          payments: [],
          totalAmount: 0
        };
      }
      
      grouped[monthKey].payments.push(payment);
      grouped[monthKey].totalAmount += parseInt(payment.amount) || 0;
    });
    
    // Sort months in descending order (newest first)
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uz-UZ');
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'transfer': return '📱';
      default: return '💰';
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'cash': return 'Naqd';
      case 'card': return 'Karta';
      case 'transfer': return 'O\'tkazma';
      default: return method;
    }
  };

  // Get available years from payments
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Add current year and previous 3 years
    for (let i = 0; i < 4; i++) {
      years.push(currentYear - i);
    }
    
    return years;
  };

  const totalYearAmount = payments.reduce((sum, payment) => sum + (parseInt(payment.amount) || 0), 0);
  const groupedPayments = groupPaymentsByMonth();

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
      maxWidth: '900px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '2px solid #f3f4f6',
      paddingBottom: '16px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    studentInfo: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '4px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    yearSelect: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    yearSummary: {
      backgroundColor: '#f0f9ff',
      border: '2px solid #bfdbfe',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center'
    },
    yearSummaryTitle: {
      fontSize: '14px',
      color: '#1e40af',
      fontWeight: '500',
      marginBottom: '8px'
    },
    yearSummaryAmount: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#059669'
    },
    yearSummaryCount: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    monthsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    monthCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    monthHeader: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    monthName: {
      fontSize: '18px',
      fontWeight: '600'
    },
    monthTotal: {
      fontSize: '16px',
      fontWeight: '600'
    },
    paymentsGrid: {
      padding: '16px',
      display: 'grid',
      gap: '12px'
    },
    paymentItem: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid #e5e7eb',
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: '16px',
      alignItems: 'center'
    },
    paymentDate: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827'
    },
    paymentDescription: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    },
    paymentMethod: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      backgroundColor: '#f3f4f6',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    paymentAmount: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#059669',
      textAlign: 'right'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '16px',
      borderRadius: '8px',
      textAlign: 'center'
    },
    empty: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>
              💰 To'lovlar tarixi
            </div>
            <div style={styles.studentInfo}>
              {student.name} • {student.phone} • {student.group_name}
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.controls}>
          <div>
            <label style={{fontSize: '14px', fontWeight: '500', marginRight: '8px'}}>
              Yil:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={styles.yearSelect}
            >
              {getAvailableYears().map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.yearSummary}>
            <div style={styles.yearSummaryTitle}>{selectedYear} yil uchun jami</div>
            <div style={styles.yearSummaryAmount}>{formatCurrency(totalYearAmount)}</div>
            <div style={styles.yearSummaryCount}>{payments.length} ta to'lov</div>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div className="spinner"></div>
            <p>To'lovlar yuklanmoqda...</p>
          </div>
        ) : error ? (
          <div style={styles.error}>
            <p>{error}</p>
            <button 
              onClick={fetchStudentPayments}
              style={{
                marginTop: '12px',
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Qayta urinish
            </button>
          </div>
        ) : groupedPayments.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>💳</div>
            <p>{selectedYear} yilda to'lovlar topilmadi</p>
            <p style={{fontSize: '12px', color: '#9ca3af', marginTop: '8px'}}>
              Boshqa yilni tanlang yoki yangi to'lov qo'shing
            </p>
          </div>
        ) : (
          <div style={styles.monthsContainer}>
            {groupedPayments.map(([monthKey, monthData]) => (
              <div key={monthKey} style={styles.monthCard}>
                <div style={styles.monthHeader}>
                  <div style={styles.monthName}>
                    📅 {monthData.monthName}
                  </div>
                  <div style={styles.monthTotal}>
                    {formatCurrency(monthData.totalAmount)} ({monthData.payments.length} ta)
                  </div>
                </div>
                <div style={styles.paymentsGrid}>
                  {monthData.payments.map((payment, index) => (
                    <div key={index} style={styles.paymentItem}>
                      <div>
                        <div style={styles.paymentDate}>
                          📆 {formatDate(payment.payment_date)}
                        </div>
                        <div style={styles.paymentDescription}>
                          {payment.description || 'Izoh yo\'q'}
                        </div>
                      </div>
                      <div style={styles.paymentMethod}>
                        <span>{getPaymentMethodIcon(payment.payment_method)}</span>
                        {getPaymentMethodName(payment.payment_method)}
                      </div>
                      <div style={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPaymentsModal;