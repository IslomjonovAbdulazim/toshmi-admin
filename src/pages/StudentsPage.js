import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import StudentForm from '../components/forms/StudentForm';
import { studentService } from '../services/studentService';
import { groupService } from '../services/groupService';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await studentService.getAll();
      setStudents(response.data);
    } catch (err) {
      setError('O\'quvchilar ro\'yxatini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await groupService.getAll();
      setGroups(response.data);
    } catch (err) {
      console.error('Groups fetch error:', err);
    }
  };

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

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStudent(null);
    fetchStudents();
  };

  const filteredStudents = students.filter(student => {
    // Search filter
    const searchMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.group_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && student.is_active) ||
      (statusFilter === 'inactive' && !student.is_active);
    
    // Group filter
    const groupMatch = groupFilter === 'all' || student.group_id === parseInt(groupFilter);
    
    return searchMatch && statusMatch && groupMatch;
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
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>O'quvchilar boshqaruvi</h1>
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
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Barcha guruhlar</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Ism, telefon yoki guruh bo'yicha qidirish..."
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
              + Yangi o'quvchi
            </button>
          </div>
        </div>

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
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>O'quvchi</th>
                  <th style={styles.th}>Telefon</th>
                  <th style={styles.th}>Guruh</th>
                  <th style={styles.th}>Ota-ona</th>
                  <th style={styles.th}>Bitirish yili</th>
                  <th style={styles.th}>Holat</th>
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
                      <div style={styles.phone}>{student.parent_phone}</div>
                    </td>
                    <td style={styles.td}>
                      {student.graduation_year}
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
          )}
        </div>

        {showForm && (
          <StudentForm
            studentId={editingStudent?.id}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default StudentsPage;