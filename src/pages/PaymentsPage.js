import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import PaymentForm from '../components/forms/PaymentForm';
import { paymentService } from '../services/paymentService';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalPayments: 0,
    averagePayment: 0,
    methodBreakdown: {}
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching payments using new API endpoint...');
      
      // Use the new payments endpoint
      const paymentsResponse = await paymentService.getAllPayments();
      const paymentsData = paymentsResponse.data;
      
      console.log('Payments data:', paymentsData);

      // Sort by date (newest first)
      paymentsData.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
      setPayments(paymentsData);

      // Calculate statistics
      calculateStats(paymentsData);

    } catch (err) {
      console.error('Payment fetch error:', err);
      setError(`To'lovlar ma'lumotlarini olishda xatolik: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateStats = (paymentsData) => {
    console.log('Calculating stats for:', paymentsData);
    
    if (!paymentsData || paymentsData.length === 0) {
      setStats({ 
        totalAmount: 0, 
        totalPayments: 0, 
        averagePayment: 0, 
        methodBreakdown: {} 
      });
      return;
    }

    const totalAmount = paymentsData.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'number' ? payment.amount : parseInt(payment.amount) || 0;
      return sum + amount;
    }, 0);
    
    const totalPayments = paymentsData.length;
    const averagePayment = totalAmount / totalPayments;

    const methodBreakdown = paymentsData.reduce((acc, payment) => {
      const method = payment.payment_method || 'unknown';
      const amount = typeof payment.amount === 'number' ? payment.amount : parseInt(payment.amount) || 0;
      acc[method] = (acc[method] || 0) + amount;
      return acc;
    }, {});

    const newStats = {
      totalAmount,
      totalPayments,
      averagePayment,
      methodBreakdown
    };
    
    console.log('Calculated stats:', newStats);
    setStats(newStats);
  };

  const handleAddPayment = (student = null) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedStudent(null);
    fetchData();
  };

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    // Search filter
    const searchMatch = payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student_phone.includes(searchTerm) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.payment_date);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          dateMatch = paymentDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = paymentDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = paymentDate >= monthAgo;
          break;
        case 'year':
          dateMatch = paymentDate.getFullYear() === now.getFullYear();
          break;
        default:
          dateMatch = true;
      }
    }
    
    // Method filter
    const methodMatch = methodFilter === 'all' || payment.payment_method === methodFilter;
    
    return searchMatch && dateMatch && methodMatch;
  });

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

  const styles = {
    container: {
      maxWidth: '1600px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    titleIcon: {
      fontSize: '28px'
    },
    filtersAndAdd: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      minWidth: '120px'
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '300px'
    },
    addBtn: {
      backgroundColor: '#059669',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    // Statistics Cards
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    statCardTotal: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      color: 'white'
    },
    statCardAverage: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white'
    },
    statCardCount: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      color: 'white'
    },
    statHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    statTitle: {
      fontSize: '14px',
      fontWeight: '500',
      opacity: 0.9
    },
    statIcon: {
      fontSize: '24px'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    statSubtext: {
      fontSize: '12px',
      opacity: 0.8
    },
    methodBreakdown: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    methodItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px'
    },
    methodLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      fontWeight: '500'
    },
    methodAmount: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#059669'
    },
    // Payments Table
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #f3f4f6'
    },
    studentInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    studentName: {
      fontWeight: '600',
      color: '#111827'
    },
    studentDetails: {
      fontSize: '12px',
      color: '#6b7280'
    },
    amountCell: {
      fontWeight: '600',
      color: '#059669',
      fontSize: '16px'
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
    description: {
      maxWidth: '200px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: '13px',
      color: '#6b7280'
    },
    payBtn: {
      backgroundColor: '#059669',
      color: 'white',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500'
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
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>💰</span>
            To'lovlar boshqaruvi
          </h1>
          <div style={styles.filtersAndAdd}>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Barcha vaqt</option>
              <option value="today">Bugun</option>
              <option value="week">So'nggi hafta</option>
              <option value="month">So'nggi oy</option>
              <option value="year">Bu yil</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Barcha usullar</option>
              <option value="cash">💵 Naqd</option>
              <option value="card">💳 Karta</option>
              <option value="transfer">📱 O'tkazma</option>
            </select>
            <input
              type="text"
              placeholder="O'quvchi nomi, telefon yoki izoh bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button
              style={styles.addBtn}
              onClick={() => handleAddPayment()}
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              <span>💰</span>
              Yangi to'lov
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, ...styles.statCardTotal}}>
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>Jami to'lovlar</div>
              <div style={styles.statIcon}>💎</div>
            </div>
            <div style={styles.statValue}>{formatCurrency(stats.totalAmount)}</div>
            <div style={styles.statSubtext}>Barcha vaqt davomida</div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardCount}}>
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>To'lovlar soni</div>
              <div style={styles.statIcon}>📊</div>
            </div>
            <div style={styles.statValue}>{stats.totalPayments}</div>
            <div style={styles.statSubtext}>Jami tranzaksiyalar</div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardAverage}}>
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>O'rtacha to'lov</div>
              <div style={styles.statIcon}>📈</div>
            </div>
            <div style={styles.statValue}>{formatCurrency(Math.round(stats.averagePayment))}</div>
            <div style={styles.statSubtext}>Har bir to'lov uchun</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>To'lov usullari</div>
              <div style={styles.statIcon}>💳</div>
            </div>
            <div style={styles.methodBreakdown}>
              {Object.entries(stats.methodBreakdown).map(([method, amount]) => (
                <div key={method} style={styles.methodItem}>
                  <div style={styles.methodLabel}>
                    <span>{getPaymentMethodIcon(method)}</span>
                    {getPaymentMethodName(method)}
                  </div>
                  <div style={styles.methodAmount}>{formatCurrency(amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div className="spinner"></div>
              <p>To'lovlar yuklanmoqda...</p>
            </div>
          ) : error ? (
            <div style={styles.error}>
              <p>{error}</p>
              <button 
                onClick={fetchData}
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
          ) : filteredPayments.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>💳</div>
              {payments.length === 0 ? (
                // No payments at all
                <>
                  <p>Hozircha to'lovlar mavjud emas</p>
                  <p style={{fontSize: '12px', color: '#9ca3af', marginTop: '8px'}}>
                    To'lovlar ko'rinishi uchun biror o'quvchi uchun to'lov qayd eting
                  </p>
                  <button
                    onClick={() => handleAddPayment()}
                    style={styles.addBtn}
                  >
                    Birinchi to'lovni qayd etish
                  </button>
                </>
              ) : searchTerm ? (
                // Filtered but no results
                <>
                  <p>"{searchTerm}" bo'yicha hech narsa topilmadi</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      marginTop: '12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Filtrni tozalash
                  </button>
                </>
              ) : (
                // Filtered by date/method but no results
                <>
                  <p>Tanlangan filtrlar bo'yicha to'lovlar topilmadi</p>
                  <button
                    onClick={() => {
                      setDateFilter('all');
                      setMethodFilter('all');
                    }}
                    style={{
                      marginTop: '12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Barcha filtrlarni tozalash
                  </button>
                </>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>O'quvchi</th>
                  <th style={styles.th}>Miqdor</th>
                  <th style={styles.th}>Sana</th>
                  <th style={styles.th}>Usul</th>
                  <th style={styles.th}>Izoh</th>
                  <th style={styles.th}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr key={`${payment.student_name}-${payment.payment_date}-${index}`}>
                    <td style={styles.td}>
                      <div style={styles.studentInfo}>
                        <div style={styles.studentName}>{payment.student_name}</div>
                        <div style={styles.studentDetails}>
                          {payment.student_phone} • {payment.group_name}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.amountCell}>
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {formatDate(payment.payment_date)}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.paymentMethod}>
                        <span>{getPaymentMethodIcon(payment.payment_method)}</span>
                        {getPaymentMethodName(payment.payment_method)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.description} title={payment.description}>
                        {payment.description || 'Izoh yo\'q'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.payBtn}
                        onClick={() => handleAddPayment({
                          id: payment.student_id,
                          name: payment.student_name,
                          phone: payment.student_phone,
                          group_name: payment.group_name
                        })}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                      >
                        + To'lov qo'shish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payment Form Modal */}
        {showForm && (
          <PaymentForm
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
            preSelectedStudent={selectedStudent}
          />
        )}
      </div>
    </Layout>
  );
};

export default PaymentsPage;