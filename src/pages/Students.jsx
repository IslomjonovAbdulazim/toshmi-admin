import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import StudentForm from '../components/Forms/StudentForm';
import ApiService from '../services/api';
import { MESSAGES } from '../utils/constants';
import { formatPhoneNumber } from '../utils/helpers';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    group_id: '',
    search: '',
    is_active: 'all'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, groupsData] = await Promise.all([
        ApiService.getStudents(),
        ApiService.getGroups()
      ]);
      setStudents(studentsData);
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
      if (editingStudent) {
        await ApiService.updateStudent(editingStudent.id, formData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        await ApiService.createStudent(formData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }
      
      setShowModal(false);
      setEditingStudent(null);
      loadData();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('O\'quvchini o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await ApiService.deleteStudent(studentId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadData();
    } catch (error) {
      setError('O\'chirishda xatolik: ' + error.message);
    }
  };

  const handleViewDetails = (student) => {
    navigate(`/students/${student.id}`);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredStudents = students.filter(student => {
    const matchesGroup = !filters.group_id || student.group_id === parseInt(filters.group_id);
    const matchesSearch = !filters.search || 
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      (student.phone && student.phone.includes(filters.search));
    const matchesStatus = filters.is_active === 'all' || 
      (filters.is_active === 'active' && student.is_active) ||
      (filters.is_active === 'inactive' && !student.is_active);
    
    return matchesGroup && matchesSearch && matchesStatus;
  });

  const getStudentStats = () => {
    const total = students.length;
    const active = students.filter(s => s.is_active).length;
    const withGroups = students.filter(s => s.group_id).length;
    const withParents = students.filter(s => s.parent_phone).length;
    
    return { total, active, withGroups, withParents };
  };

  const stats = getStudentStats();

  const columns = [
    {
      key: 'full_name',
      label: 'F.I.Sh',
      render: (student) => (
        <div>
          <div className="font-medium">
            {student.first_name} {student.last_name}
          </div>
          <div className="text-xs text-gray-500">ID: {student.id}</div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (student) => student.phone ? formatPhoneNumber(student.phone) : '-'
    },
    {
      key: 'group',
      label: 'Sinf',
      render: (student) => student.group ? (
        <div>
          <div className="font-medium">{student.group.name}</div>
          <div className="text-xs text-gray-500">{student.group.academic_year}</div>
        </div>
      ) : '-'
    },
    {
      key: 'parent_phone',
      label: 'Ota-ona',
      render: (student) => student.parent_phone ? formatPhoneNumber(student.parent_phone) : '-'
    },
    {
      key: 'graduation_year',
      label: 'Bitirish yili',
      render: (student) => student.graduation_year || '-'
    },
    {
      key: 'is_active',
      label: 'Holat',
      render: (student) => (
        <span className={`badge ${student.is_active ? 'badge-success' : 'badge-danger'}`}>
          {student.is_active ? 'Faol' : 'Faol emas'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (student) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => handleViewDetails(student)}
          >
            👁️ Ko'rish
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(student)}
          >
            ✏️ Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(student.id)}
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
        <h1 className="header-title">O'quvchilar boshqaruvi</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi o'quvchi
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      {/* Statistics */}
      <div className="grid grid-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Jami o'quvchilar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-green-600">{stats.active}</div>
          <div className="stat-label">Faol o'quvchilar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-blue-600">{stats.withGroups}</div>
          <div className="stat-label">Sinfga biriktirilgan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-purple-600">{stats.withParents}</div>
          <div className="stat-label">Ota-onasi bor</div>
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
              placeholder="Ism, familiya yoki telefon..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sinf</label>
            <select
              name="group_id"
              value={filters.group_id}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">Barcha sinflar</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.academic_year})
                </option>
              ))}
            </select>
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
            <label className="form-label">Natijalar</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredStudents.length} ta o'quvchi
              </span>
              <Button
                size="sm"
                onClick={() => setFilters({ group_id: '', search: '', is_active: 'all' })}
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
          data={filteredStudents}
          loading={loading}
          emptyMessage="O'quvchilar topilmadi"
        />
      </Card>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStudent(null);
          setError('');
        }}
        title={editingStudent ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
        size="large"
      >
        <StudentForm
          initialData={editingStudent ? {
            first_name: editingStudent.first_name || '',
            last_name: editingStudent.last_name || '',
            phone: editingStudent.phone || '',
            group_id: editingStudent.group_id || '',
            parent_phone: editingStudent.parent_phone || '',
            graduation_year: editingStudent.graduation_year || new Date().getFullYear() + 4
          } : {}}
          groups={groups}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingStudent(null);
            setError('');
          }}
          isEditing={!!editingStudent}
          submitText={editingStudent ? 'Yangilash' : 'Saqlash'}
        />
        {error && <div className="error mt-4">{error}</div>}
      </Modal>
    </div>
  );
};

export default Students;