import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Loading from '../components/Common/Loading';
import TeacherForm from '../components/Forms/TeacherForm';
import ApiService from '../services/api';
import { MESSAGES } from '../utils/constants';
import { formatPhoneNumber, formatDate } from '../utils/helpers';

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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    assigned: 0,
    subjects: 0
  });
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

  useEffect(() => {
    calculateStats();
  }, [teachers]);

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

  const calculateStats = () => {
    const active = teachers.filter(t => t.is_active).length;
    const assigned = teachers.filter(t => t.assigned_subjects && t.assigned_subjects.length > 0).length;
    const uniqueSubjects = new Set();
    
    teachers.forEach(teacher => {
      if (teacher.assigned_subjects) {
        teacher.assigned_subjects.forEach(sub => uniqueSubjects.add(sub.subject_id));
      }
    });

    setStats({
      total: teachers.length,
      active,
      assigned,
      subjects: uniqueSubjects.size
    });
  };

  const getFilteredTeachers = () => {
    return teachers.filter(teacher => {
      const matchesSearch = !filters.search || 
        `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        teacher.phone.includes(filters.search) ||
        teacher.email?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesActive = filters.is_active === 'all' || 
        (filters.is_active === 'true' && teacher.is_active) ||
        (filters.is_active === 'false' && !teacher.is_active);

      const matchesAssignment = filters.has_assignments === 'all' ||
        (filters.has_assignments === 'true' && teacher.assigned_subjects && teacher.assigned_subjects.length > 0) ||
        (filters.has_assignments === 'false' && (!teacher.assigned_subjects || teacher.assigned_subjects.length === 0));

      return matchesSearch && matchesActive && matchesAssignment;
    });
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
    if (!window.confirm('O\'qituvchini o\'chirishni tasdiqlaysizmi?')) return;
    
    try {
      await ApiService.deleteTeacher(teacherId);
      setSuccess('O\'qituvchi muvaffaqiyatli o\'chirildi');
      loadData();
    } catch (error) {
      setError('O\'chirishda xatolik: ' + error.message);
    }
  };

  const handleAssignTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setAssignmentData({ teacher_id: teacher.id, subject_id: '', group_id: '' });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await ApiService.assignTeacher(assignmentData);
      setSuccess('O\'qituvchi muvaffaqiyatli tayinlandi');
      setShowAssignModal(false);
      loadData();
    } catch (error) {
      setError('Tayinlashda xatolik: ' + error.message);
    }
  };

  const handleDetailView = (teacher) => {
    navigate(`/teachers/${teacher.id}`);
  };

  const columns = [
    {
      key: 'name',
      title: 'F.I.O.',
      render: (teacher) => (
        <div className="user-info">
          <div className="avatar">
            {teacher.profile_picture ? (
              <img src={teacher.profile_picture} alt={teacher.first_name} />
            ) : (
              <span className="initials">
                {teacher.first_name[0]}{teacher.last_name[0]}
              </span>
            )}
          </div>
          <div className="details">
            <div className="name">{teacher.first_name} {teacher.last_name}</div>
            <div className="meta">{formatPhoneNumber(teacher.phone)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (teacher) => teacher.email || 'Kiritilmagan'
    },
    {
      key: 'subjects',
      title: 'Fanlar',
      render: (teacher) => {
        if (!teacher.assigned_subjects || teacher.assigned_subjects.length === 0) {
          return <span className="text-muted">Tayinlanmagan</span>;
        }
        return (
          <div className="subjects-list">
            {teacher.assigned_subjects.slice(0, 2).map((assignment, index) => (
              <span key={index} className="subject-tag">
                {assignment.subject_name}
              </span>
            ))}
            {teacher.assigned_subjects.length > 2 && (
              <span className="more-count">+{teacher.assigned_subjects.length - 2}</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'groups',
      title: 'Guruhlar',
      render: (teacher) => {
        const uniqueGroups = teacher.assigned_subjects 
          ? [...new Set(teacher.assigned_subjects.map(a => a.group_name))]
          : [];
        
        if (uniqueGroups.length === 0) {
          return <span className="text-muted">Tayinlanmagan</span>;
        }
        
        return (
          <div className="groups-list">
            {uniqueGroups.slice(0, 2).map((group, index) => (
              <span key={index} className="group-tag">
                {group}
              </span>
            ))}
            {uniqueGroups.length > 2 && (
              <span className="more-count">+{uniqueGroups.length - 2}</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Holat',
      render: (teacher) => (
        <span className={`status ${teacher.is_active ? 'active' : 'inactive'}`}>
          {teacher.is_active ? 'Faol' : 'Nofaol'}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Qo\'shilgan',
      render: (teacher) => formatDate(teacher.created_at)
    },
    {
      key: 'actions',
      title: 'Amallar',
      render: (teacher) => (
        <div className="actions">
          <Button size="small" onClick={() => handleDetailView(teacher)}>
            Ko'rish
          </Button>
          <Button variant="secondary" size="small" onClick={() => handleEdit(teacher)}>
            Tahrirlash
          </Button>
          <Button variant="secondary" size="small" onClick={() => handleAssignTeacher(teacher)}>
            Tayinlash
          </Button>
          <Button variant="danger" size="small" onClick={() => handleDelete(teacher.id)}>
            O'chirish
          </Button>
        </div>
      )
    }
  ];

  const filteredTeachers = getFilteredTeachers();

  return (
    <div className="teachers-page">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <Card className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Jami o'qituvchilar</div>
          </div>
        </Card>
        
        <Card className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Faol o'qituvchilar</div>
          </div>
        </Card>
        
        <Card className="stat-card assigned">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{stats.assigned}</div>
            <div className="stat-label">Tayinlangan</div>
          </div>
        </Card>
        
        <Card className="stat-card subjects">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-number">{stats.subjects}</div>
            <div className="stat-label">O'qitiladigan fanlar</div>
          </div>
        </Card>
      </div>

      {/* Header */}
      <Card>
        <div className="page-header">
          <div className="header-content">
            <h1>O'qituvchilar</h1>
            <p>Jami {filteredTeachers.length} ta o'qituvchi</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            O'qituvchi qo'shish
          </Button>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Ism, telefon yoki email bo'yicha qidiring..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filters.is_active}
              onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
            >
              <option value="all">Barcha holatlar</option>
              <option value="true">Faol</option>
              <option value="false">Nofaol</option>
            </select>
            
            <select
              value={filters.has_assignments}
              onChange={(e) => setFilters(prev => ({ ...prev, has_assignments: e.target.value }))}
            >
              <option value="all">Barcha tayinlovlar</option>
              <option value="true">Tayinlangan</option>
              <option value="false">Tayinlanmagan</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Loading text="O'qituvchilar yuklanmoqda..." />
        ) : (
          <Table
            columns={columns}
            data={filteredTeachers}
            emptyMessage="O'qituvchilar topilmadi"
          />
        )}

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </Card>

      {/* Teacher Form Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTeacher(null);
        }}
        title={editingTeacher ? 'O\'qituvchini tahrirlash' : 'Yangi o\'qituvchi'}
      >
        <TeacherForm
          initialData={editingTeacher}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingTeacher(null);
          }}
        />
      </Modal>

      {/* Assignment Modal */}
      <Modal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="O'qituvchini tayinlash"
      >
        <form onSubmit={handleAssignSubmit} className="assignment-form">
          <div className="form-group">
            <label>O'qituvchi</label>
            <input
              type="text"
              value={selectedTeacher ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}` : ''}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Fan</label>
            <select
              value={assignmentData.subject_id}
              onChange={(e) => setAssignmentData(prev => ({ ...prev, subject_id: e.target.value }))}
              required
            >
              <option value="">Fanni tanlang</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Guruh</label>
            <select
              value={assignmentData.group_id}
              onChange={(e) => setAssignmentData(prev => ({ ...prev, group_id: e.target.value }))}
              required
            >
              <option value="">Guruhni tanlang</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)}>
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