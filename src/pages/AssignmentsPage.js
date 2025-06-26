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
    if (window.confirm(`${assignment.teacher?.name || 'Tayinlanmagan'} o'qituvchisini ${assignment.group.name} guruhidagi ${assignment.subject.name} fanidan olib tashlashni tasdiqlaysizmi?`)) {
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

  const handleUnassignTeacher = async (assignment) => {
    if (window.confirm(`${assignment.teacher.name} o'qituvchisini ${assignment.subject.name} fanidan olib tashlashni tasdiqlaysizmi? (Fan saqlanib qoladi)`)) {
      try {
        setActionLoading(true);
        await assignmentService.unassignTeacher(assignment.id);
        await fetchData();
      } catch (err) {
        alert(err.response?.data?.detail || 'O\'qituvchini olib tashlashda xatolik');
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
      marginBottom: '32px'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    titleIcon: {
      fontSize: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '24px',
      maxWidth: '600px'
    },
    createBtn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '14px 28px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
      transition: 'all 0.3s ease'
    },
    // Statistics Section
    statsSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    statCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '20px'
    },
    assignmentCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
      marginBottom: '16px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '4px'
    },
    cardSubtitle: {
      fontSize: '14px',
      color: '#6b7280'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statusAssigned: {
      backgroundColor: '#d1fae5',
      color: '#059669'
    },
    statusUnassigned: {
      backgroundColor: '#fef3c7',
      color: '#d97706'
    },
    cardContent: {
      marginBottom: '20px'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
      padding: '8px 0'
    },
    infoIcon: {
      fontSize: '18px',
      minWidth: '20px'
    },
    infoText: {
      fontSize: '14px',
      color: '#374151',
      fontWeight: '500'
    },
    teacherName: {
      fontWeight: '600',
      color: '#111827'
    },
    cardActions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    actionBtn: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      flex: '1',
      minWidth: '80px'
    },
    editBtn: {
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      border: '1px solid #bfdbfe'
    },
    unassignBtn: {
      backgroundColor: '#fef3c7',
      color: '#d97706',
      border: '1px solid #fde68a'
    },
    removeBtn: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca'
    },
    assignBtn: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      border: '1px solid #bbf7d0'
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
              <span style={styles.statIcon}>👥</span>
              <div style={styles.statValue}>{stats.activeTeachers || 0}</div>
              <div style={styles.statLabel}>Faol o'qituvchilar</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controlsSection}>
          <div style={styles.controlsTop}>
            <div style={styles.tabsContainer}>
              {[
                { key: 'all', label: '🔄 Barchasi', count: assignments.length + unassigned.length },
                { key: 'assigned', label: '✅ Tayinlangan', count: stats.assignedCount },
                { key: 'unassigned', label: '⏳ Tayinlanmagan', count: stats.unassignedCount }
              ].map(tab => (
                <button
                  key={tab.key}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.key ? styles.tabActive : styles.tabInactive)
                  }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} ({tab.count || 0})
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filtersRow}>
            <input
              type="text"
              placeholder="🔍 Guruh, fan yoki o'qituvchi nomi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              style={styles.filterSelect}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="all">📚 Barcha guruhlar</option>
              {getUniqueGroups().map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.academic_year})
                </option>
              ))}
            </select>
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
                    {assignment.has_teacher ? 'Tayinlangan' : 'Tayinlanmagan'}
                  </span>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>📚</span>
                    <span style={styles.infoText}>{assignment.subject.name} ({assignment.subject.code})</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoIcon}>👩‍🏫</span>
                    <span style={styles.infoText}>
                      {assignment.teacher ? (
                        <span style={styles.teacherName}>{assignment.teacher.name}</span>
                      ) : (
                        <span style={{color: '#9ca3af', fontStyle: 'italic'}}>O'qituvchi tayinlanmagan</span>
                      )}
                    </span>
                  </div>
                  {assignment.teacher && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>📱</span>
                      <span style={styles.infoText}>{assignment.teacher.phone}</span>
                    </div>
                  )}
                </div>

                <div style={styles.cardActions}>
                  {assignment.has_teacher ? (
                    <>
                      <button
                        style={styles.editBtn}
                        onClick={() => handleEditAssignment(assignment)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dbeafe'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#eff6ff'}
                        disabled={actionLoading}
                      >
                        ✏️ O'zgartirish
                      </button>
                      <button
                        style={styles.unassignBtn}
                        onClick={() => handleUnassignTeacher(assignment)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#fde68a'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#fef3c7'}
                        disabled={actionLoading}
                      >
                        👤➖ Olib tashlash
                      </button>
                      <button
                        style={styles.removeBtn}
                        onClick={() => handleRemoveAssignment(assignment)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#fef2f2'}
                        disabled={actionLoading}
                      >
                        🗑️ O'chirish
                      </button>
                    </>
                  ) : (
                    <button
                      style={styles.assignBtn}
                      onClick={() => handleEditAssignment(assignment)}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#dcfce7'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                      disabled={actionLoading}
                    >
                      👩‍🏫➕ O'qituvchi tayinlash
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