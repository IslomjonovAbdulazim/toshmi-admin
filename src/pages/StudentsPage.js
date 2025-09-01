import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import StudentForm from '../components/forms/StudentForm';
import StudentPaymentsModal from '../components/forms/StudentPaymentsModal';
import { studentService } from '../services/studentService';
import { groupService } from '../services/groupService';
import { activityService } from '../services/activityService';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchGroups();
    connectToActivityFeed();
    
    return () => {
      activityService.disconnect('students');
    };
  }, []);

  const connectToActivityFeed = () => {
    activityService.connect(
      'students',
      (data) => {
        if (data.type === 'student_activity_update') {
          setActivityData(data.data);
        }
      },
      (error) => {
        console.error('Activity WebSocket error:', error);
      }
    );
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      setError('O\'quvchilar ro\'yxatini olishda xatolik');
      console.error('Students fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      const response = await groupService.getAll();
      setGroups(response.data);
    } catch (err) {
      console.error('Groups fetch error:', err);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Get unique graduation years for filter
  const graduationYears = useMemo(() => {
    const years = [...new Set(students.map(student => student.graduation_year))];
    return years.filter(year => year).sort().reverse();
  }, [students]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setGroupFilter('all');
    setYearFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || groupFilter !== 'all' || yearFilter !== 'all';

  const handleAdd = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (student) => {
    if (window.confirm(`${student.name} o'quvchisini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await studentService.delete(student.id);
        fetchStudents();
      } catch (err) {
        alert('O\'quvchi o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleViewPayments = (student) => {
    setSelectedStudent(student);
    setShowPaymentsModal(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStudent(null);
    fetchStudents();
  };

  // Enhanced filtering logic with activity data
  const filteredStudents = useMemo(() => {
    const studentsWithActivity = students.map(student => {
      const activityInfo = activityData.find(activity => activity.user_id === student.id);
      return {
        ...student,
        activityInfo: activityInfo || null
      };
    });
    
    return studentsWithActivity.filter(student => {
      // Search filter (name, phone, group name, parent phone)
      const searchMatch = !searchTerm || (
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        student.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.parent_phone && student.parent_phone.includes(searchTerm))
      );
      
      // Status filter
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && student.is_active) ||
        (statusFilter === 'inactive' && !student.is_active);
      
      // Group filter
      const groupMatch = groupFilter === 'all' || student.group_id === parseInt(groupFilter);
      
      // Year filter
      const yearMatch = yearFilter === 'all' || student.graduation_year === parseInt(yearFilter);
      
      return searchMatch && statusMatch && groupMatch && yearMatch;
    });
  }, [students, searchTerm, statusFilter, groupFilter, yearFilter, activityData]);

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 16px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
      margin: 0
    },
    filtersAndAdd: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'flex-end'
    },
    filtersRow: {
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
      minWidth: '140px'
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '280px'
    },
    addBtn: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    },
    clearFiltersBtn: {
      backgroundColor: '#6b7280',
      color: 'white',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500'
    },
    resultsInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#6b7280'
    },
    resultsCount: {
      fontWeight: '500',
      color: '#374151'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
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
      borderBottom: '1px solid #e5e7eb',
      fontSize: '14px'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '14px'
    },
    studentName: {
      fontWeight: '600',
      color: '#111827'
    },
    phone: {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#6b7280'
    },
    badge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    },
    statusActive: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    statusInactive: {
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    },
    actionBtn: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      marginRight: '8px',
      marginBottom: '4px'
    },
    editBtn: {
      backgroundColor: '#f59e0b',
      color: 'white'
    },
    deleteBtn: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    paymentsBtn: {
      backgroundColor: '#059669',
      color: 'white'
    },
    actionsCell: {
      minWidth: '220px'
    },
    onlineStatus: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    offlineStatus: {
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    },
    lastActiveText: {
      fontSize: '11px',
      color: '#6b7280',
      marginTop: '2px'
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
    noResults: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280',
      backgroundColor: '#f9fafb'
    },
    noResultsIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    '@media (max-width: 768px)': {
      header: {
        flexDirection: 'column',
        alignItems: 'stretch'
      },
      filtersAndAdd: {
        alignItems: 'stretch'
      },
      filtersRow: {
        flexDirection: 'column'
      },
      filterSelect: {
        minWidth: 'auto'
      },
      searchInput: {
        minWidth: 'auto'
      }
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>O'quvchilar boshqaruvi</h1>
          <div style={styles.filtersAndAdd}>
            <div style={styles.filtersRow}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">Barcha holat</option>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
              </select>
              
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                style={styles.filterSelect}
                disabled={groupsLoading}
              >
                <option value="all">
                  {groupsLoading ? 'Guruhlar yuklanmoqda...' : 'Barcha guruhlar'}
                </option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.academic_year})
                  </option>
                ))}
              </select>
              
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">Barcha yillar</option>
                {graduationYears.map(year => (
                  <option key={year} value={year}>
                    {year}-yil
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Ism, telefon, guruh yoki ota-ona telefoni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              
              {hasActiveFilters && (
                <button
                  style={styles.clearFiltersBtn}
                  onClick={clearFilters}
                  title="Barcha filtrlarni tozalash"
                >
                  Tozalash
                </button>
              )}
            </div>
            
            <button
              style={styles.addBtn}
              onClick={handleAdd}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              + Yangi o'quvchi
            </button>
          </div>
        </div>

        {/* Results info */}
        {!loading && !error && (
          <div style={styles.resultsInfo}>
            <span style={styles.resultsCount}>
              {filteredStudents.length} ta o'quvchi topildi
              {hasActiveFilters && ` (${students.length} tadan)`}
            </span>
            {hasActiveFilters && (
              <span>Filtrlar faol</span>
            )}
          </div>
        )}

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div className="spinner"></div>
              <p>O'quvchilar yuklanmoqda...</p>
            </div>
          ) : error ? (
            <div style={styles.error}>
              <p>{error}</p>
              <button 
                onClick={fetchStudents}
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
          ) : filteredStudents.length === 0 ? (
            <div style={hasActiveFilters ? styles.noResults : styles.empty}>
              {hasActiveFilters ? (
                <>
                  <div style={styles.noResultsIcon}>🔍</div>
                  <p><strong>Filtr bo'yicha hech qanday o'quvchi topilmadi</strong></p>
                  <p style={{fontSize: '14px', color: '#9ca3af', marginTop: '8px'}}>
                    Filtrlarni o'zgartirib ko'ring yoki tozalang
                  </p>
                  <button
                    onClick={clearFilters}
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
                    Filtrlarni tozalash
                  </button>
                </>
              ) : (
                <>
                  <p>Hozircha o'quvchilar mavjud emas</p>
                  <button
                    onClick={handleAdd}
                    style={styles.addBtn}
                  >
                    Birinchi o'quvchini qo'shish
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>O'quvchi</th>
                    <th style={styles.th}>Telefon</th>
                    <th style={styles.th}>Guruh</th>
                    <th style={styles.th}>Ota-ona</th>
                    <th style={styles.th}>Bitirish yili</th>
                    <th style={styles.th}>Holat</th>
                    <th style={styles.th}>Faollik holati</th>
                    <th style={styles.th}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td style={styles.td}>
                        <div style={styles.studentName}>{student.name}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.phone}>{student.phone}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge}>
                          {student.group_name}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.phone}>
                          {student.parent_phone || 'Mavjud emas'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        {student.graduation_year || 'Belgilanmagan'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          ...(student.is_active ? styles.statusActive : styles.statusInactive)
                        }}>
                          {student.is_active ? 'Faol' : 'Nofaol'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {student.activityInfo ? (
                          <div>
                            <span style={{
                              ...styles.badge,
                              ...(student.activityInfo.is_online ? styles.onlineStatus : styles.offlineStatus)
                            }}>
                              {student.activityInfo.is_online ? (
                                <>🟢 Onlayn</>
                              ) : (
                                <>🔴 Offline</>
                              )}
                            </span>
                            {!student.activityInfo.is_online && student.activityInfo.last_active && (
                              <div style={styles.lastActiveText}>
                                {activityService.getUserActivityStatus(student.activityInfo.last_active).statusText}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{
                            ...styles.badge,
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280'
                          }}>
                            Ma'lumot yo'q
                          </span>
                        )}
                      </td>
                      <td style={{...styles.td, ...styles.actionsCell}}>
                        <button
                          style={{...styles.actionBtn, ...styles.paymentsBtn}}
                          onClick={() => handleViewPayments(student)}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                          title="To'lovlar tarixi"
                        >
                          💰 To'lovlar
                        </button>
                        <button
                          style={{...styles.actionBtn, ...styles.editBtn}}
                          onClick={() => handleEdit(student)}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                        >
                          Tahrirlash
                        </button>
                        <button
                          style={{...styles.actionBtn, ...styles.deleteBtn}}
                          onClick={() => handleDelete(student)}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student Form Modal */}
        {showForm && (
          <StudentForm
            studentId={editingStudent?.id}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Student Payments Modal */}
        {showPaymentsModal && selectedStudent && (
          <StudentPaymentsModal
            student={selectedStudent}
            onClose={() => {
              setShowPaymentsModal(false);
              setSelectedStudent(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default StudentsPage;