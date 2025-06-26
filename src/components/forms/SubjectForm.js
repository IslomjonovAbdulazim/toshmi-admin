import React, { useState, useEffect } from 'react';
import { subjectService } from '../../services/subjectService';

const SubjectForm = ({ subjectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const response = await subjectService.getById(subjectId);
      setFormData({
        name: response.data.name,
        code: response.data.code
      });
    } catch (err) {
      setError('Fan ma\'lumotlarini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Fan nomi kiritilishi shart');
      return;
    }
    if (!formData.code.trim()) {
      setError('Fan kodi kiritilishi shart');
      return;
    }

    try {
      setLoading(true);
      if (subjectId) {
        await subjectService.update(subjectId, formData);
      } else {
        await subjectService.create(formData);
      }
      onSuccess();
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Bu fan kodi allaqachon mavjud');
      } else {
        setError('Fan saqlashda xatolik yuz berdi');
      }
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
      maxWidth: '500px',
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
      color: '#111827'
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
      gap: '16px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    inputError: {
      borderColor: '#ef4444'
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
      minWidth: '100px'
    },
    submitBtnDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {subjectId ? 'Fanni tahrirlash' : 'Yangi fan qo\'shish'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Fan nomi *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(error && !formData.name.trim() ? styles.inputError : {})
              }}
              placeholder="Masalan: Matematika"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Fan kodi *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(error && !formData.code.trim() ? styles.inputError : {})
              }}
              placeholder="Masalan: MATH"
              required
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

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
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectForm;