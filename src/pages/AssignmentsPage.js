import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import AssignmentForm from '../components/forms/AssignmentForm';
import { teacherService } from '../services/teacherService';
import { groupService } from '../services/groupService';
import { subjectService } from '../services/subjectService';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeTeachers: 0,
    assignedGroups: 0,
    unassignedSubjects: 0
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all required data
      const [teachersRes, groupsRes, subjectsRes] = await Promise.all([
        teacherService.getAll(),
        groupService.getAll(),
        subjectService.getAll()
      ]);

      const teachersData = teachersRes.data;
      const groupsData = groupsRes.data;
      const subjectsData = subjectsRes.data;

      // Extract assignments from teachers
      const allAssignments = [];
      teachersData.forEach(teacher => {
        if (teacher.assigned_subjects && teacher.assigned_subjects.length > 0) {
          teacher.assigned_subjects.forEach(assignment => {
            allAssignments.push({
              id: assignment.group_subject_id || Math.random(),
              teacher_id: teacher.id,
              teacher_name: teacher.name,
              teacher_phone: teacher.phone,
              teacher_active: teacher.is_active,
              group_name: assignment.group_name,
              subject_name: assignment.subject_name,
              group_subject_id: assignment.group_subject_id
            });
          });
        }
      });

      setAssignments(allAssignments);
      calculateStats(allAssignments, teachersData, groupsData, subjectsData);

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Tayinlovlar ma\'lumotlarini olishda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateStats = (assignmentsData, teachersData, groupsData, subjectsData) => {
    const activeTeachers = new Set(
      assignmentsData
        .filter(a => a.teacher_active)
        .map(a => a.teacher_id)
    ).size;

    const assignedGroups = new Set(assignmentsData.map(a => a.group_name)).size;
    
    // Count subjects that don't have any assignments
    const assignedSubjects = new Set(assignmentsData.map(a => a.subject_name));
    const unassignedSubjects = subjectsData.filter(s => !assignedSubjects.has(s.name)).length;

    setStats({
      totalAssignments: assignmentsData.length,
      activeTeachers,
      assignedGroups,
      unassignedSubjects
    });
  };

  const handleAddAssignment = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchData();
  };

  const handleRemoveAssignment = async (assignment) => {
    if (window.confirm(`${assignment.teacher_name}ning ${assignment.group_name} guruhidagi ${assignment.subject_name} fanini o'qitish tayinlovini bekor qilishni tasdiqlaysizmi?`)) {
      try {
        // Note: Backend might need a DELETE endpoint for assignments
        // For now, we'll show a message
        alert('Tayinlovni bekor qilish funksiyasi backendda qo\'shilishi kerak');
      } catch (err) {
        alert('Tayinlovni bekor qilishda xatolik');
      }
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const searchMatch = 
      assignment.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject_name.toLowerCase().includes(searchTerm.toLowerCase());

    const teacherMatch = teacherFilter === 'all' || assignment.teacher_id === parseInt(teacherFilter);
    const groupMatch = groupFilter === 'all' || assignment.group_name === groupFilter;
    const subjectMatch = subjectFilter === 'all' || assignment.subject_name === subjectFilter;

    return searchMatch && teacherMatch && groupMatch && subjectMatch;
  });

  // Get unique values for filters
  const getUniqueTeachers = () => [...new Set(assignments.map(a => ({ id: a.teacher_id, name: a.teacher_name })))];
  const getUniqueGroups = () => [...new Set(assignments.map(a => a.group_name))];
  const getUniqueSubjects = () => [...new Set(assignments.map(a => a.subject_name))];

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
    controls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    viewToggle: {
      display: 'flex',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '4px'
    },
    viewBtn: {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s'
    },
    viewBtnActive: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    viewBtnInactive: {
      backgroundColor: 'transparent',
      color: '#6b7280'
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
      minWidth: '300px'
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
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white'
    },
    statCardTeachers: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      color: 'white'
    },
    statCardGroups: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      color: 'white'
    },
    statCardUnassigned: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
    // Table View
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
    teacherInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    teacherName: {
      fontWeight: '600',
      color: '#111827'
    },
    teacherPhone: {
      fontSize: '12px',
      color: '#6b7280',
      fontFamily: 'monospace'
    },
    assignmentBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500'
    },
    groupBadge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    subjectBadge: {
      backgroundColor: '#f0fdf4',
      color: '#166534'
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
    removeBtn: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca'
    },
    // Grid View
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    gridCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    gridCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    gridCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    gridTeacherName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827'
    },
    gridTeacherIcon: {
      fontSize: '24px'
    },
    gridAssignmentsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    gridAssignmentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px'
    },
    gridAssignmentLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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
            <span style={styles.titleIcon}>🎯</span>
            O'qituvchi tayinlovlari
          </h1>
          <div style={styles.controls}>
            <div style={styles.viewToggle}>
              <button
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === 'table' ? styles.viewBtnActive : styles.viewBtnInactive)
                }}
                onClick={() => setViewMode('table')}
              >
                📋 Jadval
              </button>
              <button
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === 'grid' ? styles.viewBtnActive : styles.viewBtnInactive)
                }}
                onClick={() => setViewMode('grid')}
              >
                🔲 Kartalar
              </button>
            </div>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Barcha o'qituvchilar</option>
              {getUniqueTeachers().map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Barcha guruhlar</option>
              {getUniqueGroups().map(group => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Barcha fanlar</option>
              {getUniqueSubjects().map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="O'qituvchi, guruh yoki fan bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button
              style={styles.addBtn}
              onClick={handleAddAssignment}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <span>🎯</span>
              Yangi tayinlov
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, ...styles.statCardTotal}}>
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>Jami tayinlovlar</div>
              <div style={styles.statIcon}>🎯</div>
            </div>
            <div style={styles.statValue}>{stats.totalAssignments}</div>
            <div style={styles.statSubtext}>Faol tayinlovlar soni</div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardTeachers}}>
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>Faol o'qituvchilar</div>
              <div style={styles.statIcon}>👩‍🏫</div>
            </div>
            <div style={styles.statValue}>{stats.activeTeachers}</div>
            <div style={styles.statSubtext}>Tayinlov olgan o'qituvchilar</div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardGroups}}>
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>Qamrab olingan guruhlar</div>
              <div style={styles.statIcon}>👥</div>
            </div>
            <div style={styles.statValue}>{stats.assignedGroups}</div>
            <div style={styles.statSubtext}>Kamida 1 ta fan tayinlangan</div>
          </div>

          <div style={{...styles.statCard, ...styles.statCardUnassigned}}>
            <div style={styles.statHeader}>
              <div style={styles.statTitle}>Tayinlanmagan fanlar</div>
              <div style={styles.statIcon}>⚠️</div>
            </div>
            <div style={styles.statValue}>{stats.unassignedSubjects}</div>
            <div style={styles.statSubtext}>O'qituvchi tayinlanmagan</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.loading}>
            <div className="spinner"></div>
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
            <div style={styles.emptyIcon}>🎯</div>
            {assignments.length === 0 ? (
              <>
                <p>Hozircha tayinlovlar mavjud emas</p>
                <button
                  onClick={handleAddAssignment}
                  style={styles.addBtn}
                >
                  Birinchi tayinlovni yaratish
                </button>
              </>
            ) : (
              <>
                <p>Filtrlar bo'yicha hech narsa topilmadi</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setTeacherFilter('all');
                    setGroupFilter('all');
                    setSubjectFilter('all');
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
        ) : viewMode === 'table' ? (
          // Table View
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>O'qituvchi</th>
                  <th style={styles.th}>Guruh</th>
                  <th style={styles.th}>Fan</th>
                  <th style={styles.th}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td style={styles.td}>
                      <div style={styles.teacherInfo}>
                        <div style={styles.teacherName}>👩‍🏫 {assignment.teacher_name}</div>
                        <div style={styles.teacherPhone}>{assignment.teacher_phone}</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{...styles.assignmentBadge, ...styles.groupBadge}}>
                        👥 {assignment.group_name}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{...styles.assignmentBadge, ...styles.subjectBadge}}>
                        📚 {assignment.subject_name}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{...styles.actionBtn, ...styles.removeBtn}}
                        onClick={() => handleRemoveAssignment(assignment)}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#fef2f2'}
                      >
                        Bekor qilish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid View
          <div style={styles.gridContainer}>
            {/* Group assignments by teacher */}
            {Object.entries(
              filteredAssignments.reduce((acc, assignment) => {
                if (!acc[assignment.teacher_id]) {
                  acc[assignment.teacher_id] = {
                    teacher: {
                      name: assignment.teacher_name,
                      phone: assignment.teacher_phone
                    },
                    assignments: []
                  };
                }
                acc[assignment.teacher_id].assignments.push(assignment);
                return acc;
              }, {})
            ).map(([teacherId, data]) => (
              <div 
                key={teacherId} 
                style={styles.gridCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = styles.gridCardHover.transform;
                  e.currentTarget.style.boxShadow = styles.gridCardHover.boxShadow;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = styles.gridCard.boxShadow;
                }}
              >
                <div style={styles.gridCardHeader}>
                  <div style={styles.gridTeacherName}>
                    {data.teacher.name}
                  </div>
                  <div style={styles.gridTeacherIcon}>👩‍🏫</div>
                </div>
                <div style={{fontSize: '12px', color: '#6b7280', marginBottom: '16px', fontFamily: 'monospace'}}>
                  {data.teacher.phone}
                </div>
                <div style={styles.gridAssignmentsList}>
                  {data.assignments.map((assignment) => (
                    <div key={assignment.id} style={styles.gridAssignmentItem}>
                      <div style={styles.gridAssignmentLeft}>
                        <span style={{fontSize: '14px', fontWeight: '500'}}>
                          📚 {assignment.subject_name}
                        </span>
                        <span style={{fontSize: '12px', color: '#6b7280'}}>→</span>
                        <span style={{fontSize: '14px', fontWeight: '500'}}>
                          👥 {assignment.group_name}
                        </span>
                      </div>
                      <button
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleRemoveAssignment(assignment)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#1e40af',
                  fontWeight: '500'
                }}>
                  {data.assignments.length} ta tayinlov
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assignment Form Modal */}
        {showForm && (
          <AssignmentForm
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default AssignmentsPage;