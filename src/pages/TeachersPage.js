import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import TeacherForm from '../components/forms/TeacherForm';
import { teacherService } from '../services/teacherService';
import { activityService } from '../services/activityService';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    fetchTeachers();
    connectToActivityFeed();
    
    return () => {
      activityService.disconnect('teachers');
    };
  }, []);

  const connectToActivityFeed = () => {
    activityService.connect(
      'teachers',
      (data) => {
        if (data.type === 'teacher_activity_update') {
          setActivityData(data.data);
        }
      },
      (error) => {
        console.error('Activity WebSocket error:', error);
      }
    );
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await teacherService.getAll();
      setTeachers(response.data);
    } catch (err) {
      setError('O\'qituvchilar ro\'yxatini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  const handleEdit = async (teacher) => {
    try {
      // Get detailed teacher info including assignments
      const response = await teacherService.getById(teacher.id);
      setEditingTeacher(response.data);
      setShowForm(true);
    } catch (err) {
      alert('O\'qituvchi ma\'lumotlarini olishda xatolik');
    }
  };

  const handleDelete = async (teacher) => {
    if (window.confirm(`${teacher.name} o'qituvchisini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await teacherService.delete(teacher.id);
        fetchTeachers();
      } catch (err) {
        alert('O\'qituvchi o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTeacher(null);
    fetchTeachers();
  };

  const filteredTeachers = teachers.map(teacher => {
    const activityInfo = activityData.find(activity => activity.user_id === teacher.id);
    return {
      ...teacher,
      activityInfo: activityInfo || null
    };
  }).filter(teacher => {
    // Search filter
    const searchMatch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phone.includes(searchTerm);
    
    // Status filter
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && teacher.is_active) ||
      (statusFilter === 'inactive' && !teacher.is_active);
    
    return searchMatch && statusMatch;
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
      minWidth: '120px'
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
    teacherName: {
      fontWeight: '600',
      color: '#111827',
      marginBottom: '4px'
    },
    teacherRole: {
      fontSize: '12px',
      color: '#6b7280',
      backgroundColor: '#f3f4f6',
      padding: '2px 6px',
      borderRadius: '4px',
      display: 'inline-block'
    },
    phone: {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#6b7280'
    },
    assignmentsList: {
      fontSize: '13px',
      color: '#374151'
    },
    assignmentItem: {
      backgroundColor: '#f0f9ff',
      color: '#1e40af',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '11px',
      marginRight: '4px',
      marginBottom: '2px',
      display: 'inline-block'
    },
    noAssignments: {
      color: '#9ca3af',
      fontSize: '12px',
      fontStyle: 'italic'
    },
    badge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
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
    assignBtn: {
      backgroundColor: '#10b981',
      color: 'white'
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
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>O'qituvchilar boshqaruvi</h1>
          <div style={styles.searchAndAdd}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Barcha holat</option>
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
            </select>
            <input
              type="text"
              placeholder="Ism yoki telefon bo'yicha qidirish..."
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
              + Yangi o'qituvchi
            </button>
          </div>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div className="spinner"></div>
              <p>O'qituvchilar yuklanmoqda...</p>
            </div>
          ) : error ? (
            <div style={styles.error}>
              <p>{error}</p>
              <button 
                onClick={fetchTeachers}
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
          ) : filteredTeachers.length === 0 ? (
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
                  <p>Hozircha o'qituvchilar mavjud emas</p>
                  <button
                    onClick={handleAdd}
                    style={styles.addBtn}
                  >
                    Birinchi o'qituvchini qo'shish
                  </button>
                </>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>O'qituvchi</th>
                  <th style={styles.th}>Telefon</th>
                  <th style={styles.th}>Tayinlovlar</th>
                  <th style={styles.th}>Holat</th>
                  <th style={styles.th}>Faollik holati</th>
                  <th style={styles.th}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td style={styles.td}>
                      <div style={styles.teacherName}>{teacher.name}</div>
                      <div style={styles.teacherRole}>O'qituvchi</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.phone}>{teacher.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.assignmentsList}>
                        {teacher.assigned_subjects && teacher.assigned_subjects.length > 0 ? (
                          teacher.assigned_subjects.map((assignment, index) => (
                            <span key={index} style={styles.assignmentItem}>
                              {assignment.group_name} - {assignment.subject_name}
                            </span>
                          ))
                        ) : (
                          <span style={styles.noAssignments}>Hech qanday tayinlov yo'q</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        ...(teacher.is_active ? styles.statusActive : styles.statusInactive)
                      }}>
                        {teacher.is_active ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {teacher.activityInfo ? (
                        <div>
                          <span style={{
                            ...styles.badge,
                            ...(teacher.activityInfo.is_online ? styles.onlineStatus : styles.offlineStatus)
                          }}>
                            {teacher.activityInfo.is_online ? (
                              <>🟢 Onlayn</>
                            ) : (
                              <>🔴 Offline</>
                            )}
                          </span>
                          {!teacher.activityInfo.is_online && teacher.activityInfo.last_active && (
                            <div style={styles.lastActiveText}>
                              {activityService.getUserActivityStatus(teacher.activityInfo.last_active).statusText}
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
                    <td style={styles.td}>
                      <button
                        style={{...styles.actionBtn, ...styles.editBtn}}
                        onClick={() => handleEdit(teacher)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                      >
                        Tahrirlash
                      </button>
                      <button
                        style={{...styles.actionBtn, ...styles.assignBtn}}
                        onClick={() => {
                          // TODO: Implement teacher assignment interface
                          alert('Tayinlov interface yaratilmoqda...');
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                      >
                        Tayinlash
                      </button>
                      <button
                        style={{...styles.actionBtn, ...styles.deleteBtn}}
                        onClick={() => handleDelete(teacher)}
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
          )}
        </div>

        {showForm && (
          <TeacherForm
            teacherData={editingTeacher}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default TeachersPage;