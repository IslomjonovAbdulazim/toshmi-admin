import React, { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import api from '../services/api';

const GroupScheduleModal = ({ group, onClose }) => {
  const [schedules, setSchedules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    group_subject_id: '',
    day: '',
    start_time: '',
    end_time: '',
    room: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const dayNames = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [schedulesRes, assignmentsRes] = await Promise.all([
        scheduleService.getAll(),
        api.get('/admin/assignments') // Correct endpoint
      ]);
      
      // Filter schedules for this group
      const groupSchedules = schedulesRes.data.filter(s => s.group_name === group.name);
      setSchedules(groupSchedules);
      
      // Filter assignments for this group using correct structure
      const allAssignments = assignmentsRes.data || [];
      const groupAssignments = allAssignments.filter(a => a.group.name === group.name);
      
      console.log('Group assignments:', groupAssignments);
      setAssignments(groupAssignments);
    } catch (err) {
      console.error('Error loading data:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [group.name]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickAdd = (e, dayIndex) => {
    e.stopPropagation(); // Prevent event bubbling
    setEditingSchedule(null);
    setFormData({
      group_subject_id: '',
      day: dayIndex.toString(),
      start_time: '',
      end_time: '',
      room: ''
    });
    setErrors({});
    setShowAddForm(true);
  };

  const handleAdd = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setEditingSchedule(null);
    setFormData({
      group_subject_id: '',
      day: '',
      start_time: '',
      end_time: '',
      room: ''
    });
    setErrors({});
    setShowAddForm(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      group_subject_id: schedule.group_subject_id,
      day: schedule.day.toString(),
      start_time: schedule.start_time.slice(0, 5),
      end_time: schedule.end_time.slice(0, 5),
      room: schedule.room
    });
    setErrors({});
    setShowAddForm(true);
  };

  const handleDelete = async (schedule) => {
    if (window.confirm(`${schedule.subject_name} darsini ${dayNames[schedule.day]} kunidan o'chirishni tasdiqlaysizmi?`)) {
      try {
        await scheduleService.delete(schedule.id);
        loadData();
      } catch (err) {
        alert('Dars jadvalini o\'chirishda xatolik');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.group_subject_id) newErrors.group_subject_id = 'Fan-o\'qituvchini tanlang';
    if (!formData.day && formData.day !== '0') newErrors.day = 'Kunni tanlang';
    if (!formData.start_time) newErrors.start_time = 'Boshlanish vaqtini kiriting';
    if (!formData.end_time) newErrors.end_time = 'Tugash vaqtini kiriting';
    if (!formData.room.trim()) newErrors.room = 'Xona raqamini kiriting';

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'Tugash vaqti boshlanish vaqtidan keyin bo\'lishi kerak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const data = {
        ...formData,
        day: parseInt(formData.day)
      };

      if (editingSchedule) {
        await scheduleService.update(editingSchedule.id, data);
      } else {
        await scheduleService.create(data);
      }
      
      setShowAddForm(false);
      loadData();
    } catch (err) {
      setErrors({ submit: err.response?.data?.detail || 'Xatolik yuz berdi' });
    } finally {
      setSaving(false);
    }
  };

  // Group schedules by day
  const schedulesByDay = {};
  schedules.forEach(schedule => {
    if (!schedulesByDay[schedule.day]) {
      schedulesByDay[schedule.day] = [];
    }
    schedulesByDay[schedule.day].push(schedule);
  });

  // Sort by time within each day
  Object.keys(schedulesByDay).forEach(day => {
    schedulesByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

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
      borderRadius: '16px',
      width: '95%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)'
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    groupBadge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '8px'
    },
    content: {
      padding: '24px',
      maxHeight: '70vh',
      overflowY: 'auto'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    addButton: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    weekGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px'
    },
    dayCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    dayHeader: {
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '12px 16px',
      fontSize: '15px',
      fontWeight: '600',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    quickAddBtn: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '4px 8px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    dayContent: {
      padding: '16px'
    },
    scheduleItem: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '12px'
    },
    scheduleTime: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '6px'
    },
    scheduleSubject: {
      fontSize: '15px',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '6px'
    },
    scheduleDetails: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '8px',
      display: 'flex',
      gap: '12px'
    },
    scheduleActions: {
      display: 'flex',
      gap: '6px'
    },
    actionBtn: {
      padding: '4px 8px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '500'
    },
    editBtn: {
      backgroundColor: '#f59e0b',
      color: 'white'
    },
    deleteBtn: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    emptyDay: {
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '13px',
      fontStyle: 'italic',
      padding: '20px'
    },
    // Form styles
    formOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100
    },
    formModal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    formTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#111827'
    },
    formField: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '12px',
      marginTop: '4px'
    },
    timeRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    cancelBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    saveBtn: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            📅 Dars jadvali
            <span style={styles.groupBadge}>{group.name}</span>
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.content}>
          {loading ? (
            <div style={styles.loading}>Yuklanmoqda...</div>
          ) : (
            <>
              <div style={styles.buttonGroup}>
                <button style={styles.addButton} onClick={handleAdd}>
                  + Yangi dars qo'shish
                </button>
              </div>

              <div style={styles.weekGrid}>
                {dayNames.map((dayName, dayIndex) => (
                  <div key={dayIndex} style={styles.dayCard}>
                    <div style={styles.dayHeader}>
                      <span>{dayName}</span>
                      <button
                        style={styles.quickAddBtn}
                        onClick={(e) => handleQuickAdd(e, dayIndex)}
                        title={`${dayName} uchun dars qo'shish`}
                      >
                        + Qo'shish
                      </button>
                    </div>
                    <div style={styles.dayContent}>
                      {schedulesByDay[dayIndex] && schedulesByDay[dayIndex].length > 0 ? (
                        schedulesByDay[dayIndex].map(schedule => (
                          <div key={schedule.id} style={styles.scheduleItem}>
                            <div style={styles.scheduleTime}>
                              {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                            </div>
                            <div style={styles.scheduleSubject}>{schedule.subject_name}</div>
                            <div style={styles.scheduleDetails}>
                              <span>📍 {schedule.room}</span>
                              <span>👨‍🏫 {schedule.teacher_name}</span>
                            </div>
                            <div style={styles.scheduleActions}>
                              <button
                                style={{...styles.actionBtn, ...styles.editBtn}}
                                onClick={() => handleEdit(schedule)}
                              >
                                Tahrirlash
                              </button>
                              <button
                                style={{...styles.actionBtn, ...styles.deleteBtn}}
                                onClick={() => handleDelete(schedule)}
                              >
                                O'chirish
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={styles.emptyDay}>Darslar yo'q</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={styles.formOverlay} onClick={(e) => e.stopPropagation()}>
          <div style={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.formTitle}>
              {editingSchedule ? 'Darsni tahrirlash' : 'Yangi dars qo\'shish'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div style={{ ...styles.errorText, marginBottom: '16px', backgroundColor: '#fef2f2', padding: '8px', borderRadius: '4px' }}>
                  {errors.submit}
                </div>
              )}

              <div style={styles.formField}>
                <label style={styles.label}>Fan va o'qituvchi *</label>
                <select
                  value={formData.group_subject_id}
                  onChange={(e) => setFormData({...formData, group_subject_id: e.target.value})}
                  style={{...styles.input, ...(errors.group_subject_id ? styles.inputError : {})}}
                >
                  <option value="">Tanlang...</option>
                  {assignments.map(assignment => (
                    <option key={assignment.id} value={assignment.group_subject_id}>
                      {assignment.subject.name} - {assignment.teacher.name}
                    </option>
                  ))}
                </select>
                {errors.group_subject_id && <div style={styles.errorText}>{errors.group_subject_id}</div>}
                {assignments.length === 0 && (
                  <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                    Bu guruh uchun hech qanday fan tayinlanmagan. Avval fanlar bo'limidan guruhga fan tayinlang.
                  </div>
                )}
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Kun *</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({...formData, day: e.target.value})}
                  style={{...styles.input, ...(errors.day ? styles.inputError : {})}}
                >
                  <option value="">Kunni tanlang...</option>
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
                {errors.day && <div style={styles.errorText}>{errors.day}</div>}
              </div>

              <div style={styles.timeRow}>
                <div style={styles.formField}>
                  <label style={styles.label}>Boshlanish vaqti *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    style={{...styles.input, ...(errors.start_time ? styles.inputError : {})}}
                  />
                  {errors.start_time && <div style={styles.errorText}>{errors.start_time}</div>}
                </div>

                <div style={styles.formField}>
                  <label style={styles.label}>Tugash vaqti *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    style={{...styles.input, ...(errors.end_time ? styles.inputError : {})}}
                  />
                  {errors.end_time && <div style={styles.errorText}>{errors.end_time}</div>}
                </div>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Xona *</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="masalan: 101-xona"
                  style={{...styles.input, ...(errors.room ? styles.inputError : {})}}
                />
                {errors.room && <div style={styles.errorText}>{errors.room}</div>}
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  style={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? 'Saqlanmoqda...' : (editingSchedule ? 'Saqlash' : 'Qo\'shish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupScheduleModal;