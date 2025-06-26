import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../services/assignmentService';
import { teacherService } from '../../services/teacherService';
import { subjectService } from '../../services/subjectService';

const AssignmentEditModal = ({ assignment, onClose, onSuccess }) => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(assignment.teacher?.id || '');
  const [selectedSubject, setSelectedSubject] = useState(assignment.subject.id);
  const [activeTab, setActiveTab] = useState(assignment.has_teacher ? 'teacher' : 'assign');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setFetchLoading(true);
      const [teachersRes, subjectsRes] = await Promise.all([
        teacherService.getAll(),
        subjectService.getAll()
      ]);

      setTeachers(teachersRes.data.filter(t => t.is_active));
      setSubjects(subjectsRes.data);
    } catch (err) {
      setError('Ma\'lumotlarni olishda xatolik');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChangeTeacher = async () => {
    if (!selectedTeacher) {
      setError('O\'qituvchi tanlanishi shart');
      return;
    }

    if (selectedTeacher === assignment.teacher?.id) {
      setError('Xuddi shu o\'qituvchi allaqachon tayinlangan');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await assignmentService.changeTeacher(assignment.id, parseInt(selectedTeacher));
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'O\'qituvchini o\'zgartirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSubject = async () => {
    if (!selectedSubject) {
      setError('Fan tanlanishi shart');
      return;
    }

    if (selectedSubject === assignment.subject.id) {
      setError('Xuddi shu fan allaqachon tayinlangan');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await assignmentService.changeSubject(assignment.id, parseInt(selectedSubject));
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Fanni o\'zgartirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      setError('O\'qituvchi tanlanishi shart');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Use the main assign teacher endpoint for new assignments
      await assignmentService.assignTeacher({
        group_id: assignment.group.id,
        subject_id: assignment.subject.id,
        teacher_id: parseInt(selectedTeacher)
      });
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'O\'qituvchi tayinlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '0',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      animation: 'modalSlideIn 0.3s ease-out'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '24px 32px',
      borderRadius: '20px 20px 0 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    closeBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease'
    },
    content: {
      padding: '32px'
    },
    assignmentInfo: {
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid #bae6fd'
    },
    infoTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#0c4a6e',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px'
    },
    infoItem: {
      background: 'white',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e0f2fe'
    },
    infoLabel: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '600',
      marginBottom: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0f172a'
    },
    tabsContainer: {
      display: 'flex',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      padding: '4px',
      marginBottom: '24px',
      border: '1px solid #e2e8f0'
    },
    tab: {
      flex: 1,
      padding: '12px 16px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      textAlign: 'center'
    },
    tabActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
    },
    tabInactive: {
      backgroundColor: 'transparent',
      color: '#64748b'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    selectContainer: {
      position: 'relative',
      marginBottom: '16px'
    },
    select: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: 'white',
      transition: 'border-color 0.2s ease',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '16px',
      paddingRight: '40px'
    },
    selectFocused: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    option: {
      padding: '8px'
    },
    currentValue: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #f59e0b',
      marginBottom: '16px',
      fontSize: '14px',
      color: '#92400e'
    },
    actionBtn: {
      width: '100%',
      padding: '14px 24px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    primaryBtn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
    },
    primaryBtnDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    loadingSpinner: {
      textAlign: 'center',
      padding: '40px',
      color: '#64748b'
    },
    badge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    }
  };

  if (fetchLoading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.loadingSpinner}>
            <div className="spinner" style={{marginBottom: '16px'}}></div>
            <p>Ma'lumotlar yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <span>⚡</span>
            Tayinlovni boshqarish
          </h2>
          <button 
            style={styles.closeBtn} 
            onClick={onClose}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            ×
          </button>
        </div>

        <div style={styles.content}>
          {/* Assignment Info */}
          <div style={styles.assignmentInfo}>
            <div style={styles.infoTitle}>
              <span>📋</span>
              Joriy tayinlov ma'lumotlari
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Guruh</div>
                <div style={styles.infoValue}>{assignment.group.name}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>O'quv yili</div>
                <div style={styles.infoValue}>{assignment.group.academic_year}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Fan</div>
                <div style={styles.infoValue}>{assignment.subject.name}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>O'qituvchi</div>
                <div style={styles.infoValue}>
                  {assignment.teacher ? assignment.teacher.name : (
                    <span style={{color: '#ef4444', fontStyle: 'italic'}}>Tayinlanmagan</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabsContainer}>
            {assignment.has_teacher ? (
              <>
                <button
                  style={{
                    ...styles.tab,
                    ...(activeTab === 'teacher' ? styles.tabActive : styles.tabInactive)
                  }}
                  onClick={() => setActiveTab('teacher')}
                >
                  👩‍🏫 O'qituvchini o'zgartirish
                </button>
                <button
                  style={{
                    ...styles.tab,
                    ...(activeTab === 'subject' ? styles.tabActive : styles.tabInactive)
                  }}
                  onClick={() => setActiveTab('subject')}
                >
                  📚 Fanni o'zgartirish
                </button>
              </>
            ) : (
              <button style={{...styles.tab, ...styles.tabActive}}>
                👩‍🏫 O'qituvchi tayinlash
              </button>
            )}
          </div>

          {/* Content based on active tab */}
          {(activeTab === 'teacher' || !assignment.has_teacher) && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <span>👩‍🏫</span>
                {assignment.has_teacher ? 'Yangi o\'qituvchini tanlang' : 'O\'qituvchini tanlang'}
              </div>
              
              {assignment.has_teacher && (
                <div style={styles.currentValue}>
                  <strong>Joriy o'qituvchi:</strong> {assignment.teacher.name} ({assignment.teacher.phone})
                </div>
              )}

              <div style={styles.selectContainer}>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">O'qituvchini tanlang</option>
                  {teachers
                    .filter(teacher => teacher.id !== assignment.teacher?.id)
                    .map(teacher => (
                    <option key={teacher.id} value={teacher.id} style={styles.option}>
                      {teacher.name} ({teacher.phone})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div style={styles.error}>
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <button
                style={{
                  ...styles.actionBtn,
                  ...styles.primaryBtn,
                  ...(loading ? styles.primaryBtnDisabled : {})
                }}
                onClick={assignment.has_teacher ? handleChangeTeacher : handleAssignTeacher}
                disabled={loading || !selectedTeacher}
                onMouseOver={(e) => {
                  if (!loading && selectedTeacher) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{width: '16px', height: '16px'}}></div>
                    {assignment.has_teacher ? 'O\'zgartirilmoqda...' : 'Tayinlanmoqda...'}
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    {assignment.has_teacher ? 'O\'qituvchini o\'zgartirish' : 'O\'qituvchi tayinlash'}
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'subject' && assignment.has_teacher && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <span>📚</span>
                Yangi fanni tanlang
              </div>
              
              <div style={styles.currentValue}>
                <strong>Joriy fan:</strong> {assignment.subject.name} ({assignment.subject.code})
              </div>

              <div style={styles.selectContainer}>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Fanni tanlang</option>
                  {subjects
                    .filter(subject => subject.id !== assignment.subject.id)
                    .map(subject => (
                    <option key={subject.id} value={subject.id} style={styles.option}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div style={styles.error}>
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <button
                style={{
                  ...styles.actionBtn,
                  ...styles.primaryBtn,
                  ...(loading ? styles.primaryBtnDisabled : {})
                }}
                onClick={handleChangeSubject}
                disabled={loading || !selectedSubject}
                onMouseOver={(e) => {
                  if (!loading && selectedSubject) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'none';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{width: '16px', height: '16px'}}></div>
                    O'zgartirilmoqda...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    Fanni o'zgartirish
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentEditModal;