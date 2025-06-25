import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { WEEKDAYS, TIME_SLOTS, MESSAGES } from '../utils/constants';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    group_subject_id: '',
    day: '',
    start_time: '',
    end_time: '',
    room: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    loadSchedules();
    loadAssignments();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getSchedules();
      setSchedules(data);
    } catch (error) {
      setError('Dars jadvalini yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      // Get teacher assignments (group-subject combinations)
      const teachersData = await ApiService.getTeachers();
      const assignmentsData = [];
      
      teachersData.forEach(teacher => {
        if (teacher.assignments) {
          teacher.assignments.forEach(assignment => {
            assignmentsData.push({
              id: assignment.id,
              teacher: teacher,
              group: assignment.group,
              subject: assignment.subject,
              label: `${assignment.group?.name} - ${assignment.subject?.name} (${teacher.first_name} ${teacher.last_name})`
            });
          });
        }
      });
      
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Tayinlashlarni yuklashda xatolik:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const submitData = {
        group_subject_id: parseInt(formData.group_subject_id),
        day: parseInt(formData.day),
        start_time: formData.start_time,
        end_time: formData.end_time,
        room: formData.room
      };
      
      if (editingSchedule) {
        await ApiService.updateSchedule(editingSchedule.id, submitData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        await ApiService.createSchedule(submitData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }
      
      setShowModal(false);
      loadSchedules();
      resetForm();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      group_subject_id: schedule.group_subject_id || '',
      day: schedule.day?.toString() || '',
      start_time: schedule.start_time || '',
      end_time: schedule.end_time || '',
      room: schedule.room || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Dars jadvalini o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await ApiService.deleteSchedule(scheduleId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadSchedules();
    } catch (error) {
      setError('O\'chirishda xatolik: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      group_subject_id: '',
      day: '',
      start_time: '',
      end_time: '',
      room: ''
    });
    setEditingSchedule(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getDayName = (dayNumber) => {
    const day = WEEKDAYS.find(d => d.value === dayNumber);
    return day ? day.label : '-';
  };

  const getAssignmentInfo = (groupSubjectId) => {
    const assignment = assignments.find(a => a.id === groupSubjectId);
    return assignment || null;
  };

  const filteredSchedules = schedules.filter(schedule => {
    const assignment = getAssignmentInfo(schedule.group_subject_id);
    if (!assignment) return false;
    
    const matchesGroup = !selectedGroup || assignment.group?.id?.toString() === selectedGroup;
    const matchesDay = !selectedDay || schedule.day?.toString() === selectedDay;
    
    return matchesGroup && matchesDay;
  });

  const columns = [
    {
      key: 'day',
      label: 'Kun',
      render: (schedule) => (
        <span className="badge badge-success">
          {getDayName(schedule.day)}
        </span>
      )
    },
    {
      key: 'time',
      label: 'Vaqt',
      render: (schedule) => (
        <div className="font-medium">
          {schedule.start_time} - {schedule.end_time}
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Fan',
      render: (schedule) => {
        const assignment = getAssignmentInfo(schedule.group_subject_id);
        return assignment ? (
          <div>
            <div className="font-medium">{assignment.subject?.name}</div>
            <div className="text-xs">
              <span className="badge">{assignment.subject?.code}</span>
            </div>
          </div>
        ) : '-';
      }
    },
    {
      key: 'group',
      label: 'Sinf',
      render: (schedule) => {
        const assignment = getAssignmentInfo(schedule.group_subject_id);
        return assignment ? (
          <div>
            <div className="font-medium">{assignment.group?.name}</div>
            <div className="text-sm text-gray-500">
              {assignment.group?.academic_year}
            </div>
          </div>
        ) : '-';
      }
    },
    {
      key: 'teacher',
      label: 'O\'qituvchi',
      render: (schedule) => {
        const assignment = getAssignmentInfo(schedule.group_subject_id);
        return assignment ? (
          <div className="text-sm">
            {assignment.teacher?.first_name} {assignment.teacher?.last_name}
          </div>
        ) : '-';
      }
    },
    {
      key: 'room',
      label: 'Xona',
      render: (schedule) => schedule.room || '-'
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (schedule) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleEdit(schedule)}
          >
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(schedule.id)}
          >
            O'chirish
          </Button>
        </div>
      )
    }
  ];

  // Get unique groups for filter
  const uniqueGroups = [...new Map(
    assignments.map(a => [a.group?.id, a.group])
  ).values()].filter(Boolean);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="header-title">Dars jadvali</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi dars
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      {/* Filters */}
      <Card title="Filtrlar" className="mb-6">
        <div className="grid grid-3 gap-4">
          <div className="form-group">
            <label className="form-label">Sinf bo'yicha</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="form-select"
            >
              <option value="">Barcha sinflar</option>
              {uniqueGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.academic_year})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Kun bo'yicha</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="form-select"
            >
              <option value="">Barcha kunlar</option>
              {WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Natijalar</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredSchedules.length} ta dars topildi
              </span>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedGroup('');
                  setSelectedDay('');
                }}
              >
                Tozalash
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Table 
          columns={columns} 
          data={filteredSchedules}
          loading={loading}
          emptyMessage="Dars jadvali topilmadi"
        />
      </Card>

      {/* Schedule Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingSchedule ? "Dars jadvalini tahrirlash" : "Yangi dars qo'shish"}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Fan va Sinf *</label>
            <select
              name="group_subject_id"
              value={formData.group_subject_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Tanlang...</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.label}
                </option>
              ))}
            </select>
            <small className="text-gray-500 text-xs mt-1">
              Avval o'qituvchilarni fanlarga tayinlash kerak
            </small>
          </div>

          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Kun *</label>
              <select
                name="day"
                value={formData.day}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Kunni tanlang</option>
                {WEEKDAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Xona</label>
              <Input
                name="room"
                value={formData.room}
                onChange={handleChange}
                placeholder="Masalan: 101, Laboratoriya"
              />
            </div>
          </div>

          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Boshlanish vaqti *</label>
              <select
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Vaqtni tanlang</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tugash vaqti *</label>
              <select
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Vaqtni tanlang</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Bekor qilish
            </Button>
            <Button type="submit">
              {editingSchedule ? 'Yangilash' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Schedule;