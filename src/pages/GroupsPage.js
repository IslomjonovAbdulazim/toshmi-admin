import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import GroupForm from '../components/forms/GroupForm';
import GroupScheduleModal from '../components/GroupScheduleModal';
import { groupService } from '../services/groupService';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showStudents, setShowStudents] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleGroup, setScheduleGroup] = useState(null);
    

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await groupService.getAll();
      setGroups(response.data);
    } catch (err) {
      setError('Guruhlar ro\'yxatini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setShowForm(true);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleDelete = async (group) => {
    if (group.student_count > 0) {
      alert(`Bu guruhda ${group.student_count} ta o'quvchi bor. Avval o'quvchilarni boshqa guruhga ko'chiring.`);
      return;
    }

    if (window.confirm(`"${group.name}" guruhini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await groupService.delete(group.id);
        fetchGroups();
      } catch (err) {
        if (err.response?.status === 400) {
          alert('Bu guruh o\'chirilmaydi, chunki unda o\'quvchilar mavjud');
        } else {
          alert('Guruh o\'chirishda xatolik yuz berdi');
        }
      }
    }
  };

  const handleViewStudents = async (group) => {
    try {
      const response = await groupService.getById(group.id);
      setSelectedGroup(response.data);
      setShowStudents(true);
    } catch (err) {
      alert('Guruh ma\'lumotlarini olishda xatolik');
    }
  };

  const handleScheduleSetup = (group) => {
    window.location.href = `/groups/${group.id}/schedule`;
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingGroup(null);
    fetchGroups();
  };

  // Get unique academic years for filter
  const getAcademicYears = () => {
    const years = [...new Set(groups.map(group => group.academic_year))];
    return years.sort().reverse(); // Most recent first
  };

  const filteredGroups = groups.filter(group => {
    // Search filter
    const searchMatch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.academic_year.includes(searchTerm);
    
    // Year filter
    const yearMatch = yearFilter === 'all' || group.academic_year === yearFilter;
    
    return searchMatch && yearMatch;
  });

  // Sort groups by academic year (newest first), then by name
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (a.academic_year !== b.academic_year) {
      return b.academic_year.localeCompare(a.academic_year);
    }
    return a.name.localeCompare(b.name);
  });

  const styles = {
    container: {
      maxWidth: '1400px',
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
      color: '#111827'
    },
    searchAndAdd: {
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
      minWidth: '250px'
    },
    addBtn: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
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
    groupName: {
      fontWeight: '600',
      color: '#111827',
      fontSize: '16px'
    },
    academicYear: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    },
    studentCount: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    studentBadge: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '4px 8px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500'
    },
    viewStudentsBtn: {
      backgroundColor: 'transparent',
      color: '#2563eb',
      border: '1px solid #2563eb',
      padding: '4px 8px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      marginLeft: '8px'
    },
    actionBtn: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      marginRight: '8px'
    },
    editBtn: {
      backgroundColor: '#f59e0b',
      color: 'white'
    },
    deleteBtn: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    scheduleBtn: {
      backgroundColor: '#10b981',
      color: 'white'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
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
    // Students modal styles
    studentsModal: {
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
    studentsModalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '700px',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    studentsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    studentsTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    studentsList: {
      display: 'grid',
      gap: '12px'
    },
    studentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    studentName: {
      fontWeight: '500',
      color: '#111827'
    },
    studentPhone: {
      fontSize: '12px',
      color: '#6b7280',
      fontFamily: 'monospace'
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Guruhlar boshqaruvi</h1>
          <div style={styles.searchAndAdd}>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Barcha o'quv yillari</option>
              {getAcademicYears().map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Guruh nomi yoki o'quv yili..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button
              style={styles.addBtn}
              onClick={handleAdd}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              + Yangi guruh
            </button>
          </div>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div className="spinner"></div>
              <p>Guruhlar yuklanmoqda...</p>
            </div>
          ) : error ? (
            <div style={styles.error}>
              <p>{error}</p>
              <button 
                onClick={fetchGroups}
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
          ) : sortedGroups.length === 0 ? (
            <div style={styles.empty}>
              {searchTerm ? (
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
                <>
                  <p>Hozircha guruhlar mavjud emas</p>
                  <button
                    onClick={handleAdd}
                    style={styles.addBtn}
                  >
                    Birinchi guruhni qo'shish
                  </button>
                </>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Guruh nomi</th>
                  <th style={styles.th}>O'quv yili</th>
                  <th style={styles.th}>O'quvchilar soni</th>
                  <th style={styles.th}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {sortedGroups.map((group) => (
                  <tr key={group.id}>
                    <td style={styles.td}>
                      <div style={styles.groupName}>{group.name}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.academicYear}>
                        {group.academic_year}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.studentCount}>
                        <span style={styles.studentBadge}>
                          {group.student_count} ta o'quvchi
                        </span>
                        {group.student_count > 0 && (
                          <button
                            style={styles.viewStudentsBtn}
                            onClick={() => handleViewStudents(group)}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#eff6ff'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            Ko'rish
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          style={{...styles.actionBtn, ...styles.scheduleBtn}}
                          onClick={() => handleScheduleSetup(group)}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                          title={`${group.name} dars jadvalini sozlash`}
                        >
                          📅 Jadval
                        </button>
                        <button
                          style={{...styles.actionBtn, ...styles.editBtn}}
                          onClick={() => handleEdit(group)}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                        >
                          Tahrirlash
                        </button>
                        <button
                          style={{...styles.actionBtn, ...styles.deleteBtn}}
                          onClick={() => handleDelete(group)}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Group Form Modal */}
        {showForm && (
          <GroupForm
            groupId={editingGroup?.id}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Students Modal */}
        {showStudents && selectedGroup && (
          <div style={styles.studentsModal} onClick={() => setShowStudents(false)}>
            <div style={styles.studentsModalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.studentsHeader}>
                <h3 style={styles.studentsTitle}>
                  {selectedGroup.name} guruhidagi o'quvchilar ({selectedGroup.student_count} ta)
                </h3>
                <button style={styles.closeBtn} onClick={() => setShowStudents(false)}>×</button>
              </div>
              
              {selectedGroup.students && selectedGroup.students.length > 0 ? (
                <div style={styles.studentsList}>
                  {selectedGroup.students.map((student) => (
                    <div key={student.id} style={styles.studentItem}>
                      <div>
                        <div style={styles.studentName}>{student.name}</div>
                        <div style={styles.studentPhone}>{student.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.empty}>
                  Bu guruhda hozircha o'quvchilar yo'q
                </div>
              )}
            </div>
          </div>
        )}

        {/* Group Schedule Modal */}
        {showSchedule && scheduleGroup && (
          <GroupScheduleModal
            group={scheduleGroup}
            onClose={() => setShowSchedule(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default GroupsPage;