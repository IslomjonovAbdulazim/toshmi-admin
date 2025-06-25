import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import TeacherForm from '../components/Forms/TeacherForm';
import ApiService from '../services/api';
import { MESSAGES } from '../utils/constants';
import { formatPhoneNumber } from '../utils/helpers';

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    is_active: 'all',
    has_assignments: 'all'
  });
  const [assignmentData, setAssignmentData] = useState({
    teacher_id: '',
    subject_id: '',
    group_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, subjectsData, groupsData] = await Promise.all([
        ApiService.getTeachers(),
        ApiService.getSubjects(),
        ApiService.getGroups()
      ]);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setGroups(groupsData);
    } catch (error) {
      setError('Ma\'lumotlarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setError('');
    setSuccess('');
    
    try {
      if (editingTeacher) {
        await ApiService.updateTeacher(editingTeacher.id, formData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        await ApiService.createTeacher(formData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }
      
      setShowModal(false);
      setEditingTeacher(null);
      loadData();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowModal(true);
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('O\'qituvchini o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await ApiService.deleteTeacher(teacherId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadData();
    } catch (error) {
      setError('O\'chirishda xatolik: ' + error.message);
    }
  };

  const handleViewDetails = (teacher) => {
    navigate(`/teachers/${teacher.id}`);
  };

  const handleAssignSubject = (teacher) => {
    setSelectedTeacher(teacher);
    setAssignmentData({
      teacher_id: teacher.id,
      subject_id: '',
      group_id: ''
    });
    setShowAssignModal(true);
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await ApiService.assignTeacher({
        teacher_id: parseInt(assignmentData.teacher_id),
        subject_id: parseInt(assignmentData.subject_id),
        group_id: parseInt(assignmentData.group_id)
      });
      
      setSuccess('Fan muvaffaqiyatli tayinlandi');
      setShowAssignModal(false);
      setSelectedTeacher(null);
      setAssignmentData({ teacher_id: '', subject_id: '', group_id: '' });
      loadData();
    } catch (error) {
      setError('Tayinlashda xatolik: ' + error.message);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = !filters.search || 
      `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      (teacher.phone && teacher.phone.includes(filters.search)) ||
      (teacher.specialization && teacher.specialization.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesStatus = filters.is_active === 'all' || 
      (filters.is_active === 'active' && teacher.is_active) ||
      (filters.is_active === 'inactive' && !teacher.is_active);
    
    const hasAssignments = teacher.assigned_subjects && teacher.assigned_subjects.length > 0;
    const matchesAssignments = filters.has_assignments === 'all' ||
      (filters.has_assignments === 'assigned' && hasAssignments) ||
      (filters.has_assignments === 'unassigned' && !hasAssignments);
    
    return matchesSearch && matchesStatus && matchesAssignments;
  });

  const getTeacherStats = () => {
    const total = teachers.length;
    const active = teachers.filter(t => t.is_active).length;
    const assigned = teachers.filter(t => t.assigned_subjects && t.assigned_subjects.length > 0).length;
    const unassigned = total - assigned;
    
    return { total, active, assigned, unassigned };
  };

  const stats = getTeacherStats();

  const columns = [
    {
      key: 'full_name',
      label: 'F.I.Sh',
      render: (teacher) => (
        <div>
          <div className="font-medium">
            {teacher.first_name} {teacher.last_name}
          </div>
          <div className="text-xs text-gray-500">ID: {teacher.id}</div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (teacher) => teacher.phone ? formatPhoneNumber(teacher.phone) : '-'
    },
    {
      key: 'email',
      label: 'Email',
      render: (teacher) => teacher.email || '-'
    },
    {
      key: 'specialization',
      label: 'Mutaxassislik',
      render: (teacher) => (
        <div className="max-w-xs">
          <span className="text-sm">{teacher.specialization || '-'}</span>
        </div>
      )
    },
    {
      key: 'assignments',
      label: 'Tayinlashlar',
      render: (teacher) => {
        const count = teacher.assigned_subjects ? teacher.assigned_subjects.length : 0;
        return (
          <span className={`badge ${count > 0 ? 'badge-success' : 'badge-warning'}`}>
            {count} ta fan
          </span>
        );
      }
    },
    {
      key: 'is_active',
      label: 'Holat',
      render: (teacher) => (
        <span className={`badge ${teacher.is_active ? 'badge-success' : 'badge-danger'}`}>
          {teacher.is_active ? 'Faol' : 'Faol emas'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (teacher) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => handleViewDetails(teacher)}
          >
            👁️ Ko'rish
          </Button>
          <Button
            size="sm"
            onClick={() => handleAssignSubject(teacher)}
          >
            📚 Tayinlash
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(teacher)}
          >
            ✏️ Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(teacher.id)}
          >
            🗑️ O'chirish
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="header-title">O'qituvchilar boshqaruvi</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi o'qituvchi
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      {/* Statistics */}
      <div className="grid grid-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Jami o'qituvchilar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-green-600">{stats.active}</div>
          <div className="stat-label">Faol o'qituvchilar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-blue-600">{stats.assigned}</div>
          <div className="stat-label">Fanlarga tayinlangan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-orange-600">{stats.unassigned}</div>
          <div className="stat-label">Tayinlanmagan</div>
        </div>
      </div>

      {/* Filters */}
      <Card title="Filtrlar" className="mb-6">
        <div className="grid grid-4 gap-4">
          <div className="form-group">
            <label className="form-label">Qidiruv</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Ism, familiya, telefon yoki mutaxassislik..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Holat</label>
            <select
              name="is_active"
              value={filters.is_active}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="all">Barchasi</option>
              <option value="active">Faol</option>
              <option value="inactive">Faol emas</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tayinlashlar</label>
            <select
              name="has_assignments"
              value={filters.has_assignments}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="all">Barchasi</option>
              <option value="assigned">Tayinlangan</option>
              <option value="unassigned">Tayinlanmagan</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Natijalar</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredTeachers.length} ta o'qituvchi
              </span>
              <Button
                size="sm"
                onClick={() => setFilters({ search: '', is_active: 'all', has_assignments: 'all' })}
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
          data={filteredTeachers}
          loading={loading}
          emptyMessage="O'qituvchilar topilmadi"
        />
      </Card>

      {/* Teacher Form Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTeacher(null);
          setError('');
        }}
        title={editingTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}
        size="large"
      >
        <TeacherForm
          initialData={editingTeacher ? {
            first_name: editingTeacher.first_name || '',
            last_name: editingTeacher.last_name || '',
            phone: editingTeacher.phone || '',
            email: editingTeacher.email || '',
            specialization: editingTeacher.specialization || ''
          } : {}}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingTeacher(null);
            setError('');
          }}
          isEditing={!!editingTeacher}
          submitText={editingTeacher ? 'Yangilash' : 'Saqlash'}
        />
        {error && <div className="error mt-4">{error}</div>}
      </Modal>

      {/* Assignment Modal */}
      <Modal
        show={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTeacher(null);
          setAssignmentData({ teacher_id: '', subject_id: '', group_id: '' });
          setError('');
        }}
        title="Fan tayinlash"
      >
        <form onSubmit={handleAssignmentSubmit}>
          {selectedTeacher && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">O'qituvchi:</h4>
              <p className="text-blue-700">
                {selectedTeacher.first_name} {selectedTeacher.last_name}
              </p>
              {selectedTeacher.specialization && (
                <p className="text-blue-600 text-sm">
                  Mutaxassislik: {selectedTeacher.specialization}
                </p>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Fan *</label>
            <select
              name="subject_id"
              value={assignmentData.subject_id}
              onChange={(e) => setAssignmentData({...assignmentData, subject_id: e.target.value})}
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
              value={assignmentData.group_id}
              onChange={(e) => setAssignmentData({...assignmentData, group_id: e.target.value})}
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

          {assignmentData.subject_id && assignmentData.group_id && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Tayinlash ma'lumotlari:</h4>
              <div className="text-green-700 text-sm space-y-1">
                <div>
                  <strong>O'qituvchi:</strong> {selectedTeacher?.first_name} {selectedTeacher?.last_name}
                </div>
                <div>
                  <strong>Fan:</strong> {subjects.find(s => s.id === parseInt(assignmentData.subject_id))?.name}
                </div>
                <div>
                  <strong>Sinf:</strong> {groups.find(g => g.id === parseInt(assignmentData.group_id))?.name}
                </div>
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <div className="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedTeacher(null);
                setAssignmentData({ teacher_id: '', subject_id: '', group_id: '' });
                setError('');
              }}
            >
              Bekor qilish
            </Button>
            <Button type="submit">
              Tayinlash
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;