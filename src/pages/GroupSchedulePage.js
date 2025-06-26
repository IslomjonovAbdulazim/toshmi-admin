import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { scheduleService } from '../services/scheduleService';
import { groupService } from '../services/groupService';
import api from '../services/api';

const GroupSchedulePage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
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
      const [groupRes, schedulesRes, assignmentsRes] = await Promise.all([
        groupService.getById(groupId),
        scheduleService.getAll(),
        api.get('/admin/assignments')
      ]);
      
      setGroup(groupRes.data);
      
      const groupSchedules = schedulesRes.data.filter(s => s.group_name === groupRes.data.name);
      setSchedules(groupSchedules);
      
      const allAssignments = assignmentsRes.data || [];
      const groupAssignments = allAssignments.filter(a => a.group.name === groupRes.data.name);
      setAssignments(groupAssignments);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickAdd = (dayIndex) => {
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

  const handleAdd = () => {
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

  Object.keys(schedulesByDay).forEach(day => {
    schedulesByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '40px' }}>Yuklanmoqda...</div>
    </Layout>
  );

  if (!group) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '40px' }}>Guruh topilmadi</div>
    </Layout>
  );

  const styles = {
    container: {
      maxWidth: '1400px',
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
      fontSize: '28px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    groupBadge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '500'
    },
    backBtn: {
      backgroundColor: '#6b7280',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: '32px',
      flexWrap: 'wrap'
    },
    addButton: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    weekGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    dayCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    dayHeader: {
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '16px 20px',
      fontSize: '16px',
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
      padding: '6px 12px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    dayContent: {
      padding: '20px'
    },
    scheduleItem: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    scheduleContent: {
      flex: 1
    },
    scheduleTime: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    scheduleSubject: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '8px'
    },
    scheduleDetails: {
      fontSize: '14px',
      color: '#6b7280',
      display: 'flex',
      gap: '16px'
    },
    scheduleActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginLeft: '16px'
    },
    actionBtn: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
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
      fontSize: '14px',
      fontStyle: 'italic',
      padding: '30px 20px'
    },
    // Form styles
    formCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '32px',
      marginBottom: '32px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    formTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '24px',
      color: '#111827'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },
    formField: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
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
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px',
      paddingTop: '20px',
      borderTop: '1px solid #e5e7eb'
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
    saveBtn: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            📅 Dars jadvali
            <span style={styles.groupBadge}>{group.name}</span>
          </h1>
          <button style={styles.backBtn} onClick={() => navigate('/groups')}>
            ← Guruhlar ro'yxatiga qaytish
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>
              {editingSchedule ? 'Darsni tahrirlash' : 'Yangi dars qo\'shish'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div style={{ ...styles.errorText, marginBottom: '16px', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px' }}>
                  {errors.submit}
                </div>
              )}

              <div style={styles.formGrid}>
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
        )}

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
                  onClick={() => handleQuickAdd(dayIndex)}
                  title={`${dayName} uchun dars qo'shish`}
                >
                  + Qo'shish
                </button>
              </div>
              <div style={styles.dayContent}>
                {schedulesByDay[dayIndex] && schedulesByDay[dayIndex].length > 0 ? (
                  schedulesByDay[dayIndex].map(schedule => (
                    <div key={schedule.id} style={styles.scheduleItem}>
                      <div style={styles.scheduleContent}>
                        <div style={styles.scheduleTime}>
                          {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                        </div>
                        <div style={styles.scheduleSubject}>{schedule.subject_name}</div>
                        <div style={styles.scheduleDetails}>
                          <span>📍 {schedule.room}</span>
                          <span>👨‍🏫 {schedule.teacher_name}</span>
                        </div>
                      </div>
                      <div style={styles.scheduleActions}>
                        <button
                          style={{...styles.actionBtn, ...styles.editBtn}}
                          onClick={() => handleEdit(schedule)}
                        >
                          ✏️ Tahrirlash
                        </button>
                        <button
                          style={{...styles.actionBtn, ...styles.deleteBtn}}
                          onClick={() => handleDelete(schedule)}
                        >
                          🗑️ O'chirish
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
      </div>
    </Layout>
  );
};

export default GroupSchedulePage;