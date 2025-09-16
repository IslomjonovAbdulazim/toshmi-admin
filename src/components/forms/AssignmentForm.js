import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import { groupService } from '../../services/groupService';
import { subjectService } from '../../services/subjectService';
import { assignmentService } from '../../services/assignmentService';

const AssignmentForm = ({ assignmentId, onClose, onSuccess, preSelectedData = null }) => {
  const [formData, setFormData] = useState({
    group_id: '',
    subject_id: '',
    teacher_id: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchData();
    if (preSelectedData) {
      setFormData({
        group_id: preSelectedData.group_id || '',
        subject_id: preSelectedData.subject_id || '',
        teacher_id: preSelectedData.teacher_id || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedData]);

  const fetchData = async () => {
    try {
      setFetchLoading(true);
      
      // Fetch all required data
      const [teachersRes, groupsRes, subjectsRes] = await Promise.all([
        teacherService.getAll(),
        groupService.getAll(),
        subjectService.getAll()
      ]);

      // Filter only active teachers
      const activeTeachers = teachersRes.data.filter(teacher => teacher.is_active);
      
      setTeachers(activeTeachers);
      setGroups(groupsRes.data);
      setSubjects(subjectsRes.data);

    } catch (err) {
      setError('Ma\'lumotlarni olishda xatolik yuz berdi');
      console.error('Fetch error:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update selected items for preview
    if (name === 'group_id') {
      const group = groups.find(g => g.id === parseInt(value));
      setSelectedGroup(group);
    } else if (name === 'subject_id') {
      const subject = subjects.find(s => s.id === parseInt(value));
      setSelectedSubject(subject);
    } else if (name === 'teacher_id') {
      const teacher = teachers.find(t => t.id === parseInt(value));
      setSelectedTeacher(teacher);
    }

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.group_id) {
      setError('Guruh tanlanishi shart');
      return;
    }
    if (!formData.subject_id) {
      setError('Fan tanlanishi shart');
      return;
    }
    if (!formData.teacher_id) {
      setError('O\'qituvchi tanlanishi shart');
      return;
    }

    try {
      setLoading(true);
      
      const assignmentData = {
        group_id: parseInt(formData.group_id),
        subject_id: parseInt(formData.subject_id),
        teacher_id: parseInt(formData.teacher_id)
      };

      await assignmentService.assignTeacher(assignmentData);
      
      onSuccess();
    } catch (err) {
      console.error('Assignment error:', err);
      let errorMessage = 'Tayinlashda xatolik yuz berdi';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 400) {
        errorMessage = 'Bu tayinlov allaqachon mavjud yoki noto\'g\'ri ma\'lumotlar';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '700px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    titleIcon: {
      fontSize: '24px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    labelIcon: {
      fontSize: '16px'
    },
    select: {
      padding: '14px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      transition: 'border-color 0.2s',
      minHeight: '48px'
    },
    option: {
      padding: '8px'
    },
    preview: {
      backgroundColor: '#f0f9ff',
      border: '2px solid #bfdbfe',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '16px'
    },
    previewTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e40af',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    previewContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    previewItem: {
      backgroundColor: 'white',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e0f2fe'
    },
    previewLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500',
      marginBottom: '4px'
    },
    previewValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827'
    },
    loadingSpinner: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '8px'
    },
    cancelBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    submitBtn: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      minWidth: '140px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    submitBtnDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    }
  };

  if (fetchLoading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.loadingSpinner}>
            <div className="spinner"></div>
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
            <span style={styles.titleIcon}>🎯</span>
            O'qituvchi tayinlash
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Group Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>👥</span>
              Guruh *
            </label>
            <select
              name="group_id"
              value={formData.group_id}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Guruhni tanlang</option>
              {groups.map(group => (
                <option key={group.id} value={group.id} style={styles.option}>
                  {group.name} ({group.academic_year}) - {group.student_count} ta o'quvchi
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📚</span>
              Fan *
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Fanni tanlang</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id} style={styles.option}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>👩‍🏫</span>
              O'qituvchi *
            </label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">O'qituvchini tanlang</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id} style={styles.option}>
                  {teacher.name} ({teacher.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Preview */}
          {(selectedGroup || selectedSubject || selectedTeacher) && (
            <div style={styles.preview}>
              <div style={styles.previewTitle}>
                ⚡ Tayinlov ko'rinishi
              </div>
              <div style={styles.previewContent}>
                {selectedTeacher && (
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>O'qituvchi</div>
                    <div style={styles.previewValue}>👩‍🏫 {selectedTeacher.name}</div>
                  </div>
                )}
                {selectedSubject && (
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Fan</div>
                    <div style={styles.previewValue}>📚 {selectedSubject.name}</div>
                  </div>
                )}
                {selectedGroup && (
                  <div style={styles.previewItem}>
                    <div style={styles.previewLabel}>Guruh</div>
                    <div style={styles.previewValue}>👥 {selectedGroup.name}</div>
                  </div>
                )}
              </div>
              {selectedGroup && selectedSubject && selectedTeacher && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#166534'
                }}>
                  🎉 {selectedTeacher.name} o'qituvchisi {selectedGroup.name} guruhida {selectedSubject.name} fanini o'qitadi
                </div>
              )}
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{width: '16px', height: '16px'}}></div>
                  Tayinlanmoqda...
                </>
              ) : (
                <>
                  🎯 Tayinlash
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;