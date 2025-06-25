import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import ApiService from '../services/api';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    teacher_id: '',
    group_id: '',
    subject_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAssignments();
    loadTeachers();
    loadGroups();
    loadSubjects();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      // Since there's no specific endpoint for assignments list,
      // we'll need to get this data from teachers with their assignments
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
              created_at: assignment.created_at
            });
          });
        }
      });
      
      setAssignments(assignmentsData);
    } catch (error) {
      setError('Tayinlashlarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await ApiService.getTeachers();
      setTeachers(data.filter(teacher => teacher.is_active));
    } catch (error) {
      console.error('O\'qituvchilarni yuklashda xatolik:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await ApiService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Sinflarni yuklashda xatolik:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await ApiService.getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Fanlarni yuklashda xatolik:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const submitData = {
        teacher_id: parseInt(formData.teacher_id),
        group_id: parseInt(formData.group_id),
        subject_id: parseInt(formData.subject_id)
      };
      
      await ApiService.assignTeacher(submitData);
      setSuccess('O\'qituvchi muvaffaqiyatli tayinlandi');
      
      setShowModal(false);
      loadAssignments();
      resetForm();
    } catch (error) {
      setError(error.message || 'Tayinlashda xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      teacher_id: '',
      group_id: '',
      subject_id: ''
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getSelectedTeacher = () => {
    return teachers.find(t => t.id === parseInt(formData.teacher_id));
  };

  const isAssignmentExists = () => {
    return assignments.some(assignment => 
      assignment.teacher?.id === parseInt(formData.teacher_id) &&
      assignment.group?.id === parseInt(formData.group_id) &&
      assignment.subject?.id === parseInt(formData.subject_id)
    );
  };

  const columns = [
    {
      key: 'teacher',
      label: 'O\'qituvchi',
      render: (assignment) => (
        <div>
          <div className="font-medium">
            {assignment.teacher?.first_name} {assignment.teacher?.last_name}
          </div>
          <div className="text-sm text-gray-500">
            {assignment.teacher?.specialization || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Fan',
      render: (assignment) => (
        <div>
          <div className="font-medium">{assignment.subject?.name}</div>
          <div className="text-xs">
            <span className="badge">{assignment.subject?.code}</span>
          </div>
        </div>
      )
    },
    {
      key: 'group',
      label: 'Sinf',
      render: (assignment) => (
        <div>
          <div className="font-medium">{assignment.group?.name}</div>
          <div className="text-sm text-gray-500">
            {assignment.group?.academic_year}
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Aloqa',
      render: (assignment) => (
        <div className="text-sm">
          <div>{assignment.teacher?.phone ? `+998${assignment.teacher.phone}` : '-'}</div>
          <div className="text-gray-500">{assignment.teacher?.email || '-'}</div>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Tayinlangan sana',
      render: (assignment) => assignment.created_at 
        ? new Date(assignment.created_at).toLocaleDateString('uz-UZ')
        : '-'
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (assignment) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleRemoveAssignment(assignment)}
          >
            Bekor qilish
          </Button>
        </div>
      )
    }
  ];

  const handleRemoveAssignment = async (assignment) => {
    if (!window.confirm('Bu tayinlashni bekor qilishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      // Since there's no specific endpoint to remove assignment,
      // we would need to implement this in the backend
      // For now, show a message
      setError('Tayinlashni bekor qilish funksiyasi hali ishlab chiqilmagan');
    } catch (error) {
      setError('Bekor qilishda xatolik: ' + error.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="header-title">O'qituvchi tayinlash</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi tayinlash
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      {/* Statistics */}
      <div className="grid grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-number">{assignments.length}</div>
          <div className="stat-label">Jami tayinlashlar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{teachers.length}</div>
          <div className="stat-label">Faol o'qituvchilar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{subjects.length}</div>
          <div className="stat-label">Jami fanlar</div>
        </div>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={assignments}
          loading={loading}
          emptyMessage="Tayinlashlar topilmadi"
        />
      </Card>

      {/* Assignment Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Yangi tayinlash"
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">O'qituvchi *</label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">O'qituvchini tanlang</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                  {teacher.specialization && ` - ${teacher.specialization}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fan *</label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Fanni tanlang</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sinf *</label>
            <select
              name="group_id"
              value={formData.group_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Sinfni tanlang</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.academic_year})
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Preview */}
          {formData.teacher_id && formData.subject_id && formData.group_id && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Tayinlash ma'lumotlari:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>
                  <strong>O'qituvchi:</strong> {getSelectedTeacher()?.first_name} {getSelectedTeacher()?.last_name}
                </div>
                <div>
                  <strong>Fan:</strong> {subjects.find(s => s.id === parseInt(formData.subject_id))?.name}
                </div>
                <div>
                  <strong>Sinf:</strong> {groups.find(g => g.id === parseInt(formData.group_id))?.name}
                </div>
              </div>
              {isAssignmentExists() && (
                <div className="mt-3 text-red-600 text-sm">
                  ⚠️ Bu tayinlash allaqachon mavjud!
                </div>
              )}
            </div>
          )}

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
            <Button 
              type="submit"
              disabled={isAssignmentExists()}
            >
              Tayinlash
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;