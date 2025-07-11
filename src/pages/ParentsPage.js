import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ParentForm from '../components/forms/ParentForm';
import { parentService } from '../services/parentService';

const ParentsPage = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await parentService.getAll();
      setParents(response.data);
    } catch (err) {
      setError('Ota-onalar ro\'yxatini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingParent(null);
    setShowForm(true);
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setShowForm(true);
  };

  const handleDelete = async (parent) => {
    if (window.confirm(`${parent.name} ota-onasini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await parentService.delete(parent.id);
        fetchParents();
      } catch (err) {
        alert('Ota-ona o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingParent(null);
    fetchParents();
  };

  const filteredParents = parents.filter(parent => {
    const searchMatch = parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm);
    
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && parent.is_active) ||
      (statusFilter === 'inactive' && !parent.is_active);
    
    return searchMatch && statusMatch;
  });

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
    parentName: {
      fontWeight: '600',
      color: '#111827'
    },
    phone: {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#6b7280'
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
          <h1 style={styles.title}>Ota-onalar boshqaruvi</h1>
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
              + Yangi ota-ona
            </button>
          </div>
        </div>

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>
              <div className="spinner"></div>
              <p>Ota-onalar yuklanmoqda...</p>
            </div>
          ) : error ? (
            <div style={styles.error}>
              <p>{error}</p>
              <button 
                onClick={fetchParents}
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
          ) : filteredParents.length === 0 ? (
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
                  <p>Hozircha ota-onalar mavjud emas</p>
                  <button
                    onClick={handleAdd}
                    style={styles.addBtn}
                  >
                    Birinchi ota-onani qo'shish
                  </button>
                </>
              )}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>To'liq ism</th>
                  <th style={styles.th}>Telefon</th>
                  <th style={styles.th}>Holat</th>
                  <th style={styles.th}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map((parent) => (
                  <tr key={parent.id}>
                    <td style={styles.td}>
                      <div style={styles.parentName}>{parent.name}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.phone}>{parent.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        ...(parent.is_active ? styles.statusActive : styles.statusInactive)
                      }}>
                        {parent.is_active ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{...styles.actionBtn, ...styles.editBtn}}
                        onClick={() => handleEdit(parent)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                      >
                        Tahrirlash
                      </button>
                      <button
                        style={{...styles.actionBtn, ...styles.deleteBtn}}
                        onClick={() => handleDelete(parent)}
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
          <ParentForm
            parentData={editingParent}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default ParentsPage;