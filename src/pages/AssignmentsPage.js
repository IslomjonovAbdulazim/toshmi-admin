import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import AssignmentForm from '../components/forms/AssignmentForm';
import AssignmentEditModal from '../components/forms/AssignmentEditModal';
import { assignmentService } from '../services/assignmentService';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned', 'unassigned'
  const [groupFilter, setGroupFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [assignmentsRes, unassignedRes] = await Promise.all([
        assignmentService.getAllAssignments(),
        assignmentService.getUnassignedSubjects()
      ]);

      const assignmentsData = assignmentsRes.data;
      const unassignedData = unassignedRes.data;

      setAssignments(assignmentsData);
      setUnassigned(unassignedData);
      setStats(assignmentService.getAssignmentStats(assignmentsData));

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Ma\'lumotlarni olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setShowForm(true);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
  };

  const handleRemoveAssignment = async (assignment) => {
    if (window.confirm(`${assignment.teacher?.name || 'Tayinlanmagan'} o'qituvchisini ${assignment.group.name} guruhidagi ${assignment.subject.name} fanidan o'chirishni tasdiqlaysizmi?`)) {
      try {
        setActionLoading(true);
        await assignmentService.removeAssignment(assignment.id);
        await fetchData();
      } catch (err) {
        alert(err.response?.data?.detail || 'Tayinlovni o\'chirishda xatolik');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAssignment(null);
    fetchData();
  };

  // Get unique groups for filter
  const getUniqueGroups = () => {
    const allGroups = [...assignments.map(a => a.group), ...unassigned.map(u => u.group)];
    const uniqueGroups = allGroups.filter((group, index, arr) => 
      arr.findIndex(g => g.id === group.id) === index
    );
    return uniqueGroups.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Filter assignments based on current filters
  const getFilteredAssignments = () => {
    let filtered = [...assignments];

    if (activeTab === 'assigned') {
      filtered = filtered.filter(a => a.has_teacher);
    } else if (activeTab === 'unassigned') {
      filtered = [...filtered.filter(a => !a.has_teacher), ...unassigned];
    } else {
      filtered = [...filtered, ...unassigned];
    }

    if (searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (groupFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.group.id === parseInt(groupFilter));
    }

    return filtered;
  };

  const styles = {
    container: {
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '0 16px'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '32px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '20px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    titleIcon: {
      fontSize: '36px'
    },
    subtitle: {
      fontSize: '16px',
      opacity: 0.9,
      lineHeight: '1.5',
      maxWidth: '600px'
    },
    createBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
      padding: '14px 28px',
      borderRadius: '16px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
    },
    // Statistics Section
    statsSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    statCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    statIcon: {
      fontSize: '32px',
      marginBottom: '12px',
      display: 'block'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500'
    },
    // Controls Section
    controlsSection: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6'
    },
    controlsTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    tabsContainer: {
      display: 'flex',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      padding: '4px',
      border: '1px solid #e5e7eb'
    },
    tab: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      minWidth: '100px'
    },
    tabActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
    },
    tabInactive: {
      backgroundColor: 'transparent',
      color: '#6b7280'
    },
    filtersRow: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchInput: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '14px',
      minWidth: '300px',
      transition: 'border-color 0.2s ease'
    },
    filterSelect: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: 'white',
      minWidth: '150px',
      transition: 'border-color 0.2s ease'
    },
    // Content Grid
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '24px'
    },
    assignmentCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    assignmentCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '4px'
    },
    cardSubtitle: {
      fontSize: '14px',
      color: '#6b7280'
    },
    statusBadge: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusAssigned: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    statusUnassigned: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    cardContent: {
      marginBottom: '24px'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
      padding: '12px 0'
    },
    infoIcon: {
      width: '20px',
      height: '20px',
      opacity: 0.7
    },
    infoText: {
      fontSize: '16px',
      color: '#374151',
      fontWeight: '500'
    },
    teacherName: {
      fontWeight: '600',
      color: '#111827'
    },
    subjectName: {
      color: '#7c3aed',
      fontWeight: '600'
    },
    divider: {
      height: '1px',
      background: '#e5e7eb',
      margin: '20px 0'
    },
    cardActions: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    actionBtn: {
      flex: 1,
      padding: '12px 16px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      minWidth: '120px'
    },
    editBtn: {
      backgroundColor: '#3b82f6',
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
      padding: '60px 20px',
      color: '#6b7280'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center'
    },
    empty: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
      display: 'block'
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#374151'
    },
    emptyText: {
      fontSize: '14px',
      marginBottom: '24px'
    }
  };

  const filteredAssignments = getFilteredAssignments();

  return (
    <Layout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>
                <span style={styles.titleIcon}>🎯</span>
                Tayinlovlar boshqaruvi
              </h1>
              <p style={styles.subtitle}>
                O'qituvchilarni guruhlarga fanlar bo'yicha tayinlang va boshqaring. 
                Har bir guruh uchun barcha fanlar bo'yicha o'qituvchilar tayinlangan bo'lishi kerak.
              </p>
            </div>
            <button
              style={styles.createBtn}
              onClick={handleCreateAssignment}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'none';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              <span>✨</span>
              Yangi tayinlov
            </button>
          </div>

          {/* Statistics */}
          <div style={styles.statsSection}>
            <div 
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = styles.statCardHover.transform;
                e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.statCard.boxShadow;
              }}
            >
              <span style={styles.statIcon}>📊</span>
              <div style={styles.statValue}>{stats.totalAssignments || 0}</div>
              <div style={styles.statLabel}>Jami tayinlovlar</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = styles.statCardHover.transform;
                e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.statCard.boxShadow;
              }}
            >
              <span style={styles.statIcon}>✅</span>
              <div style={styles.statValue}>{stats.assignedCount || 0}</div>
              <div style={styles.statLabel}>Tayinlangan</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = styles.statCardHover.transform;
                e.currentTarget.style.boxShadow = styles.statCardHover.boxShadow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.statCard.boxShadow;
              }}
            >
              <span style={styles.statIcon}>⏳</span>
              <div style={styles.statValue}>{stats.unassignedCount || 0}</div>
              <div style={styles.statLabel}>Tayinlanmagan</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controlsSection}>
          <div style={styles.controlsTop}>
            <div style={styles.tabsContainer}>
              {[
                { key: 'all', label: 'Barchasi' },
                { key: 'assigned', label: 'Tayinlangan' },
                { key: 'unassigned', label: 'Tayinlanmagan' }
              ].map(tab => (
                <button
                  key={tab.key}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.key ? styles.tabActive : styles.tabInactive)
                  }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={styles.filtersRow}>
              <input
                type="text"
                placeholder="Guruh, fan yoki o'qituvchi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                style={styles.filterSelect}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="all">Barcha guruhlar</option>
                {getUniqueGroups().map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.loading}>
            <div className="spinner" style={{marginBottom: '16px'}}></div>
            <p>Tayinlovlar yuklanmoqda...</p>
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
        ) : filteredAssignments.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>🎯</span>
            <div style={styles.emptyTitle}>
              {activeTab === 'unassigned' ? 'Barcha fanlar tayinlangan!' : 'Hech qanday tayinlov topilmadi'}
            </div>
            <div style={styles.emptyText}>
              {searchTerm || groupFilter !== 'all' 
                ? 'Filtrlarni o\'zgartirib ko\'ring yoki yangi tayinlov yarating'
                : activeTab === 'unassigned' 
                  ? 'Barcha guruh-fanlar kombinatsiyalari uchun o\'qituvchilar tayinlangan'
                  : 'Birinchi tayinlovni yarating'
              }
            </div>
            {(!searchTerm && groupFilter === 'all' && activeTab !== 'unassigned') && (
              <button
                onClick={handleCreateAssignment}
                style={styles.createBtn}
              >
                <span>✨</span>
                Birinchi tayinlovni yaratish
              </button>
            )}
          </div>
        ) : (
          <div style={styles.contentGrid}>
            {filteredAssignments.map((assignment) => (
              <div 
                key={assignment.id || `${assignment.group.id}-${assignment.subject.id}`}
                style={styles.assignmentCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = styles.assignmentCardHover.transform;
                  e.currentTarget.style.boxShadow = styles.assignmentCardHover.boxShadow;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = styles.assignmentCard.boxShadow;
                }}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTitle}>{assignment.group.name}</div>
                    <div style={styles.cardSubtitle}>{assignment.group.academic_year}</div>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    ...(assignment.has_teacher ? styles.statusAssigned : styles.statusUnassigned)
                  }}>
                    {assignment.has_teacher ? 'TAYINLANGAN' : 'TAYINLANMAGAN'}
                  </span>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.infoRow}>
                    <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                    <span style={{...styles.infoText, ...styles.subjectName}}>
                      {assignment.subject.name} ({assignment.subject.code})
                    </span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span style={{...styles.infoText, ...styles.teacherName}}>
                      {assignment.teacher?.name || 'O\'qituvchi tayinlanmagan'}
                    </span>
                  </div>
                </div>
                
                <div style={styles.divider}></div>
                
                <div style={styles.cardActions}>
                  {assignment.has_teacher ? (
                    <>
                      <button
                        style={{...styles.actionBtn, ...styles.editBtn}}
                        onClick={() => handleEditAssignment(assignment)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        disabled={actionLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        O'zgartirish
                      </button>
                      <button
                        style={{...styles.actionBtn, ...styles.deleteBtn}}
                        onClick={() => handleRemoveAssignment(assignment)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        disabled={actionLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        O'chirish
                      </button>
                    </>
                  ) : (
                    <button
                      style={{...styles.actionBtn, ...styles.assignBtn}}
                      onClick={() => handleEditAssignment(assignment)}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                      disabled={actionLoading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      O'qituvchi tayinlash
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showForm && (
          <AssignmentForm
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}

        {editingAssignment && (
          <AssignmentEditModal
            assignment={editingAssignment}
            onClose={() => setEditingAssignment(null)}
            onSuccess={() => {
              setEditingAssignment(null);
              fetchData();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default AssignmentsPage;