import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { groupService } from '../../services/groupService';
import { parentService } from '../../services/parentService';

const StudentForm = ({ studentId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    first_name: '',
    last_name: '',
    group_id: '',
    parent_phone: '',
    graduation_year: new Date().getFullYear() + 4
  });
  const [groups, setGroups] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchParents();
    if (studentId) {
      fetchStudent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const fetchGroups = async () => {
    try {
      const response = await groupService.getAll();
      setGroups(response.data);
    } catch (err) {
      console.error('Groups fetch error:', err);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await parentService.getAll();
      setParents(response.data);
    } catch (err) {
      console.error('Parents fetch error:', err);
    }
  };

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await studentService.getById(studentId);
      const data = response.data;
      setFormData({
        phone: data.phone,
        password: '', // Never populate password
        first_name: data.name.split(' ')[0] || '',
        last_name: data.name.split(' ').slice(1).join(' ') || '',
        group_id: data.group_id,
        parent_phone: data.parent_phone,
        graduation_year: data.graduation_year
      });
      
      // Set parent search if parent exists
      if (data.parent_phone) {
        const parent = parents.find(p => p.phone === data.parent_phone);
        if (parent) {
          setParentSearch(`${parent.name} (${parent.phone})`);
        } else {
          setParentSearch(data.parent_phone);
        }
      }
    } catch (err) {
      setError('O\'quvchi ma\'lumotlarini olishda xatolik');
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
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
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
    if (!studentId && !formData.password.trim()) {
      setError('Parol kiritilishi shart');
      return;
    }
    if (!formData.group_id) {
      setError('Guruh tanlanishi shart');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        phone: formData.phone,
        first_name: formData.first_name,
        last_name: formData.last_name,
        group_id: parseInt(formData.group_id),
        parent_phone: formData.parent_phone,
        graduation_year: parseInt(formData.graduation_year)
      };

      if (!studentId) {
        submitData.password = formData.password;
        await studentService.create(submitData);
      } else {
        const updateData = {
          user_data: {
            phone: formData.phone,
            first_name: formData.first_name,
            last_name: formData.last_name
          },
          group_id: parseInt(formData.group_id),
          parent_phone: formData.parent_phone,
          graduation_year: parseInt(formData.graduation_year)
        };
        
        if (formData.password.trim()) {
          updateData.user_data.password = formData.password;
        }
        
        await studentService.update(studentId, updateData);
      }
      
      onSuccess();
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Bu telefon raqami allaqachon mavjud');
      } else {
        setError('O\'quvchi saqlashda xatolik yuz berdi');
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
      maxWidth: '600px',
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
      gap: '4px',
      position: 'relative'
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
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      maxHeight: '200px',
      overflowY: 'auto'
    },
    dropdownItem: {
      padding: '12px',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f4f6'
    },
    dropdownEmpty: {
      padding: '12px',
      color: '#9ca3af',
      textAlign: 'center'
    },
    parentName: {
      fontWeight: '500',
      color: '#111827'
    },
    parentPhone: {
      fontSize: '12px',
      color: '#6b7280'
    },
    selectedParent: {
      marginTop: '8px',
      padding: '8px',
      backgroundColor: '#f0f9ff',
      borderRadius: '6px',
      fontSize: '14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    clearBtn: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      fontSize: '12px'
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
            {studentId ? 'O\'quvchini tahrirlash' : 'Yangi o\'quvchi qo\'shish'}
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
                placeholder="O'quvchi ismi"
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
                placeholder="O'quvchi familiyasi"
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
                ...(studentId ? {backgroundColor: '#f9fafb', cursor: 'not-allowed'} : {})
              }}
              placeholder="+998901234567"
              required
              disabled={studentId}
            />
            {studentId && (
              <small style={{color: '#6b7280', fontSize: '12px'}}>
                Telefon raqami o'zgartirilmaydi
              </small>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Parol {studentId ? '(o\'zgartirish uchun kiriting)' : '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder={studentId ? 'Yangi parol' : 'Parol'}
              required={!studentId}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Guruh *</label>
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="">Guruhni tanlang</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.academic_year})
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Bitirish yili *</label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                style={styles.input}
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Ota-ona (ixtiyoriy)</label>
            <input
              type="text"
              value={parentSearch}
              onChange={(e) => {
                setParentSearch(e.target.value);
                setShowParentDropdown(true);
              }}
              onFocus={() => setShowParentDropdown(true)}
              onBlur={() => setTimeout(() => setShowParentDropdown(false), 200)}
              style={styles.input}
              placeholder="Ota-ona ismini qidiring..."
            />
            {showParentDropdown && parentSearch && (
              <div style={styles.dropdown}>
                {parents
                  .filter(parent => 
                    parent.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
                    parent.phone.includes(parentSearch)
                  )
                  .slice(0, 5)
                  .map(parent => (
                    <div
                      key={parent.id}
                      style={styles.dropdownItem}
                      onClick={() => {
                        setFormData(prev => ({...prev, parent_phone: parent.phone}));
                        setParentSearch(`${parent.name} (${parent.phone})`);
                        setShowParentDropdown(false);
                      }}
                    >
                      <div style={styles.parentName}>{parent.name}</div>
                      <div style={styles.parentPhone}>{parent.phone}</div>
                    </div>
                  ))
                }
                {parents.filter(parent => 
                  parent.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
                  parent.phone.includes(parentSearch)
                ).length === 0 && (
                  <div style={styles.dropdownEmpty}>Ota-ona topilmadi</div>
                )}
              </div>
            )}
            {formData.parent_phone && (
              <div style={styles.selectedParent}>
                Tanlangan: {parentSearch}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({...prev, parent_phone: ''}));
                    setParentSearch('');
                  }}
                  style={styles.clearBtn}
                >
                  ×
                </button>
              </div>
            )}
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

export default StudentForm;