import React, { useState, useEffect } from 'react';
import { groupService } from '../../services/groupService';

const GroupForm = ({ groupId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    academic_year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (groupId) {
      fetchGroup();
    } else {
      // Set default academic year to current academic year (2024-2025)
      const currentYear = new Date().getFullYear();
      const currentAcademicYear = `${currentYear - 1}-${currentYear}`;
      setFormData(prev => ({
        ...prev,
        academic_year: currentAcademicYear
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await groupService.getById(groupId);
      setFormData({
        name: response.data.name,
        academic_year: response.data.academic_year
      });
    } catch (err) {
      setError('Guruh ma\'lumotlarini olishda xatolik');
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
      setError('Guruh nomi kiritilishi shart');
      return;
    }
    if (!formData.academic_year.trim()) {
      setError('O\'quv yili kiritilishi shart');
      return;
    }

    // Validate academic year format (YYYY-YYYY)
    const yearPattern = /^\d{4}-\d{4}$/;
    if (!yearPattern.test(formData.academic_year)) {
      setError('O\'quv yili formati: 2024-2025');
      return;
    }

    try {
      setLoading(true);
      if (groupId) {
        await groupService.update(groupId, formData);
      } else {
        await groupService.create(formData);
      }
      onSuccess();
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Bu guruh nomi allaqachon mavjud');
      } else {
        setError('Guruh saqlashda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic academic year options
  // Example: In 2025, shows: 2024-2025 (current), 2025-2026, ..., 2031-2032
  // Next year (2026): shows 2025-2026 (current), 2026-2027, ..., 2032-2033
  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear(); // 2025
    const years = [];
    
    // Start from previous year (current academic year: 2024-2025)
    // Go for 8 years total (current + next 7 years)
    for (let i = 0; i < 8; i++) {
      const startYear = currentYear - 1 + i; // 2024, 2025, 2026, ..., 2031
      const endYear = startYear + 1;         // 2025, 2026, 2027, ..., 2032
      years.push(`${startYear}-${endYear}`);
    }
    
    return years;
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
    select: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    helpText: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
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
            {groupId ? 'Guruhni tahrirlash' : 'Yangi guruh qo\'shish'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Guruh nomi *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(error && !formData.name.trim() ? styles.inputError : {})
              }}
              placeholder="Masalan: 10-A"
              required
            />
            <div style={styles.helpText}>
              Guruh nomi noyob bo'lishi kerak
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>O'quv yili *</label>
            <select
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              style={{
                ...styles.select,
                ...(error && !formData.academic_year.trim() ? styles.inputError : {})
              }}
              required
            >
              <option value="">O'quv yilini tanlang</option>
              {generateAcademicYears().map((year, index) => {
                const currentYear = new Date().getFullYear();
                const currentAcademicYear = `${currentYear - 1}-${currentYear}`;
                const isCurrent = year === currentAcademicYear;
                
                return (
                  <option key={year} value={year}>
                    {year} {isCurrent ? '(joriy)' : ''}
                  </option>
                );
              })}
            </select>
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

export default GroupForm;