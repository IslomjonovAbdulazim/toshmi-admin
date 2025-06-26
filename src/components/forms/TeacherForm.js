import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';

const TeacherForm = ({ teacherData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacherData) {
      setFormData({
        phone: teacherData.phone,
        password: '',
        first_name: teacherData.name.split(' ')[0] || '',
        last_name: teacherData.name.split(' ').slice(1).join(' ') || ''
      });
    }
  }, [teacherData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name.trim()) {
      setError('Ism kiritilishi shart');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Familiya kiritilishi shart');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Telefon raqami kiritilishi shart');
      return;
    }
    if (!teacherData && !formData.password.trim()) {
      setError('Parol kiritilishi shart');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        phone: formData.phone,
        first_name: formData.first_name,
        last_name: formData.last_name
      };

      if (!teacherData) {
        submitData.password = formData.password;
        await teacherService.create(submitData);
      } else {
        if (formData.password.trim()) {
          submitData.password = formData.password;
        }
        await teacherService.update(teacherData.id, submitData);
      }
      
      onSuccess();
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Bu telefon raqami allaqachon mavjud');
      } else {
        setError('O\'qituvchi saqlashda xatolik yuz berdi');
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
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
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
            {teacherData ? 'O\'qituvchini tahrirlash' : 'Yangi o\'qituvchi qo\'shish'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ism *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ism"
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Familiya *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Familiya"
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Telefon raqami *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(teacherData ? {backgroundColor: '#f9fafb', cursor: 'not-allowed'} : {})
              }}
              placeholder="+998901234567"
              required
              disabled={teacherData}
            />
            {teacherData && (
              <small style={{color: '#6b7280', fontSize: '12px'}}>
                Telefon raqami o'zgartirilmaydi
              </small>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Parol {teacherData ? '(o\'zgartirish uchun kiriting)' : '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder={teacherData ? 'Yangi parol' : 'Parol'}
              required={!teacherData}
            />
          </div>

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
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;