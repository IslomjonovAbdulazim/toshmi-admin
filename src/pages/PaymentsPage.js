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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [pageSize] = useState(20); // Items per page
  
  // Stats for all payments and filtered payments
  const [allTimeStats, setAllTimeStats] = useState({
    totalAmount: 0,
    totalPayments: 0,
    averagePayment: 0,
    methodBreakdown: {}
  });
  
  const [filteredStats, setFilteredStats] = useState({
    totalAmount: 0,
    totalPayments: 0,
    averagePayment: 0,
    methodBreakdown: {}
  });

  const fetchData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching all payments for filtering and pagination');
      
      // Get ALL payments first (for proper filtering)
      const allPaymentsResponse = await paymentService.getAllPayments({
        limit: 10000 // Large number to get all payments
      });
      const allPaymentsData = allPaymentsResponse.data;
      
      console.log('All payments data:', allPaymentsData);

      // Sort by date (newest first)
      allPaymentsData.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
      
      // Calculate all-time statistics
      calculateAllTimeStats(allPaymentsData);
      
      // Apply filters to get filtered payments
      const filteredPayments = filterPayments(allPaymentsData);
      calculateFilteredStats(filteredPayments);
      setTotalPayments(filteredPayments.length);
      
      // Apply pagination to filtered results
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
      
      console.log('Filtered payments:', filteredPayments.length, 'Paginated:', paginatedPayments.length);
      setPayments(paginatedPayments);

    } catch (err) {
      console.error('Payment fetch error:', err);
      setError(`To'lovlar ma'lumotlarini olishda xatolik: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [pageSize, searchTerm, dateFilter, methodFilter]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchData(1);
  }, [searchTerm, dateFilter, methodFilter]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const filterPayments = (paymentsData) => {
    return paymentsData.filter(payment => {
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
  };

  const calculateAllTimeStats = (paymentsData) => {
    console.log('Calculating all-time stats for:', paymentsData);
    
    if (!paymentsData || paymentsData.length === 0) {
      setAllTimeStats({ 
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
    
    console.log('Calculated all-time stats:', newStats);
    setAllTimeStats(newStats);
  };

  const calculateFilteredStats = (filteredPayments) => {
    console.log('Calculating filtered stats for:', filteredPayments);
    
    if (!filteredPayments || filteredPayments.length === 0) {
      setFilteredStats({ 
        totalAmount: 0, 
        totalPayments: 0, 
        averagePayment: 0, 
        methodBreakdown: {} 
      });
      return;
    }

    const totalAmount = filteredPayments.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'number' ? payment.amount : parseInt(payment.amount) || 0;
      return sum + amount;
    }, 0);
    
    const totalPayments = filteredPayments.length;
    const averagePayment = totalAmount / totalPayments;

    const methodBreakdown = filteredPayments.reduce((acc, payment) => {
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
    
    console.log('Calculated filtered stats:', newStats);
    setFilteredStats(newStats);
  };

  const handleAddPayment = (student = null) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleDeletePayment = async (payment) => {
    if (window.confirm(`${payment.student_name}ning ${formatCurrency(payment.amount)} to'lovini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await paymentService.deletePayment(payment.id);
        // Refresh current page data
        fetchData(currentPage);
      } catch (err) {
        alert('To\'lov o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedStudent(null);
    fetchData(currentPage);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getTotalPages = () => {
    return Math.ceil(totalPayments / pageSize);
  };

  const hasFiltersApplied = () => {
    return searchTerm !== '' || dateFilter !== 'all' || methodFilter !== 'all';
  };

  // Use filtered stats when filters are applied, otherwise use all-time stats
  const displayStats = hasFiltersApplied() ? filteredStats : allTimeStats;

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
      border: '1px solid #e5e7eb',
      position: 'relative'
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
    filterBadge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '10px',
      fontSize: '10px',
      fontWeight: '600'
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
    tableContainer: {
      overflowX: 'auto'
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
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    deleteBtn: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500'
    },
    // Pagination
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '24px',
      padding: '16px'
    },
    pageBtn: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      backgroundColor: 'white',
      transition: 'all 0.2s'
    },
    pageBtn_active: {
      backgroundColor: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
    },
    pageBtn_disabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    pageInfo: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '0 16px'
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

  const totalPages = getTotalPages();
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);

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
            {hasFiltersApplied() && (
              <div style={styles.filterBadge}>FILTRLANGAN</div>
            )}
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>
                {hasFiltersApplied() ? 'Filtrlangan to\'lovlar' : 'Jami to\'lovlar'}
              </div>
              <div style={styles.statIcon}>💎</div>
            </div>
            <div style={styles.statValue}>{formatCurrency(displayStats.totalAmount)}</div>
            <div style={styles.statSubtext}>
              {hasFiltersApplied() ? 'Filtr bo\'yicha' : 'Barcha vaqt davomida'}
            </div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardCount}}>
            {hasFiltersApplied() && (
              <div style={styles.filterBadge}>FILTRLANGAN</div>
            )}
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>To'lovlar soni</div>
              <div style={styles.statIcon}>📊</div>
            </div>
            <div style={styles.statValue}>{displayStats.totalPayments}</div>
            <div style={styles.statSubtext}>
              {hasFiltersApplied() ? 'Filtr bo\'yicha tranzaksiyalar' : 'Jami tranzaksiyalar'}
            </div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardAverage}}>
            {hasFiltersApplied() && (
              <div style={styles.filterBadge}>FILTRLANGAN</div>
            )}
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>O'rtacha to'lov</div>
              <div style={styles.statIcon}>📈</div>
            </div>
            <div style={styles.statValue}>{formatCurrency(Math.round(displayStats.averagePayment))}</div>
            <div style={styles.statSubtext}>Har bir to'lov uchun</div>
          </div>

          <div style={styles.statCard}>
            {hasFiltersApplied() && (
              <div style={{...styles.filterBadge, backgroundColor: '#e5e7eb', color: '#374151'}}>FILTRLANGAN</div>
            )}
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>To'lov usullari</div>
              <div style={styles.statIcon}>💳</div>
            </div>
            <div style={styles.methodBreakdown}>
              {Object.entries(displayStats.methodBreakdown).map(([method, amount]) => (
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
                onClick={() => fetchData(currentPage)}
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
          ) : payments.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>💳</div>
              {hasFiltersApplied() ? (
                <>
                  <p>Filtrlar bo'yicha to'lovlar topilmadi</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
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
              ) : (
                <>
                  <p>Hozircha to'lovlar mavjud emas</p>
                  <button
                    onClick={() => handleAddPayment()}
                    style={styles.addBtn}
                  >
                    Birinchi to'lovni qayd etish
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={styles.tableContainer}>
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
                    {payments.map((payment, index) => (
                      <tr key={`${payment.id || payment.student_name}-${payment.payment_date}-${index}`}>
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
                          <div style={styles.actionButtons}>
                            {payment.id && (
                              <button
                                style={styles.deleteBtn}
                                onClick={() => handleDeletePayment(payment)}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                              >
                                O'chirish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage === 1 ? styles.pageBtn_disabled : {})
                    }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹ Oldingi
                  </button>

                  {startPage > 1 && (
                    <>
                      <button
                        style={styles.pageBtn}
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                      {startPage > 2 && <span style={styles.pageInfo}>...</span>}
                    </>
                  )}

                  {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                    <button
                      key={page}
                      style={{
                        ...styles.pageBtn,
                        ...(page === currentPage ? styles.pageBtn_active : {})
                      }}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && <span style={styles.pageInfo}>...</span>}
                      <button
                        style={styles.pageBtn}
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage === totalPages ? styles.pageBtn_disabled : {})
                    }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Keyingi ›
                  </button>

                  <div style={styles.pageInfo}>
                    Sahifa {currentPage} / {totalPages} ({totalPayments} ta natija)
                  </div>
                </div>
              )}
            </>
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