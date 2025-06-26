import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import SubjectForm from '../components/forms/SubjectForm';
import { subjectService } from '../services/subjectService';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await subjectService.getAll();
      setSubjects(response.data);
    } catch (err) {
      setError('Fanlar ro\'yxatini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setShowForm(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleDelete = async (subject) => {
    if (window.confirm(`"${subject.name}" fanini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await subjectService.delete(subject.id);
        fetchSubjects();
      } catch (err) {
        if (err.response?.status === 400) {
          alert('Bu fan o\'chirilmaydi, chunki u tayinlovlarda ishlatilmoqda');
        } else {
          alert('Fan o\'chirishda xatolik yuz berdi');
        }
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSubject(null);
    fetchSubjects();
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: {
      maxWidth: '1200px',
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
      alignItems: 'center'
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '200px'
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
    },
    badge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Fanlar boshqaruvi</h1>
          <div style={styles.searchAndAdd}>
            <input
              type="text"
              placeholder="Fan nomi yoki kodini qidirish..."
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
              + Yangi fan
            </button>
          </div>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div className="spinner"></div>
              <p>Fanlar yuklanmoqda...</p>
            </div>
          ) : error ? (
            <div style={styles.error}>
              <p>{error}</p>
              <button 
                onClick={fetchSubjects}
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
          ) : filteredSubjects.length === 0 ? (
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
                  <p>Hozircha fanlar mavjud emas</p>
                  <button
                    onClick={handleAdd}
                    style={styles.addBtn}
                  >
                    Birinchi fanni qo'shish
                  </button>
                </>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fan nomi</th>
                  <th style={styles.th}>Fan kodi</th>
                  <th style={styles.th}>Tayinlovlar</th>
                  <th style={styles.th}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td style={styles.td}>
                      <strong>{subject.name}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge}>
                        {subject.code}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {subject.assignments?.length || 0} ta guruh
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{...styles.actionBtn, ...styles.editBtn}}
                        onClick={() => handleEdit(subject)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                      >
                        Tahrirlash
                      </button>
                      <button
                        style={{...styles.actionBtn, ...styles.deleteBtn}}
                        onClick={() => handleDelete(subject)}
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
          <SubjectForm
            subjectId={editingSubject?.id}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default SubjectsPage;