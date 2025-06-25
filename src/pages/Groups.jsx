import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { ACADEMIC_YEARS, MESSAGES } from '../utils/constants';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getGroups();
      setGroups(data);
    } catch (error) {
      setError('Sinflarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (editingGroup) {
        await ApiService.updateGroup(editingGroup.id, formData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        await ApiService.createGroup(formData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }
      
      setShowModal(false);
      loadGroups();
      resetForm();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name || '',
      academic_year: group.academic_year || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Sinfni o\'chirishni tasdiqlaysizmi? Bu amal qaytarilmaydi.')) {
      return;
    }

    try {
      await ApiService.deleteGroup(groupId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadGroups();
    } catch (error) {
      setError('O\'chirishda xatolik: ' + error.message);
    }
  };

  const handleViewStudents = async (group) => {
    try {
      const groupData = await ApiService.getGroup(group.id);
      setSelectedGroup(groupData);
      setShowStudentsModal(true);
    } catch (error) {
      setError('O\'quvchilar ma\'lumotlarini yuklashda xatolik: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
    });
    setEditingGroup(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Sinf nomi',
      render: (group) => (
        <div className="font-medium">{group.name}</div>
      )
    },
    {
      key: 'academic_year',
      label: 'O\'quv yili',
      render: (group) => group.academic_year
    },
    {
      key: 'student_count',
      label: 'O\'quvchilar soni',
      render: (group) => (
        <span className="badge badge-success">
          {group.students ? group.students.length : 0}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Yaratilgan sana',
      render: (group) => new Date(group.created_at).toLocaleDateString('uz-UZ')
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (group) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleViewStudents(group)}
          >
            👥 O'quvchilar
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(group)}
          >
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(group.id)}
          >
            O'chirish
          </Button>
        </div>
      )
    }
  ];

  const studentColumns = [
    {
      key: 'full_name',
      label: 'F.I.Sh',
      render: (student) => `${student.first_name} ${student.last_name}`
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (student) => student.phone ? `+998${student.phone}` : '-'
    },
    {
      key: 'parent_phone',
      label: 'Ota-ona telefoni',
      render: (student) => student.parent_phone ? `+998${student.parent_phone}` : '-'
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
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="header-title">Sinflar boshqaruvi</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi sinf
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      <Card>
        <Table 
          columns={columns} 
          data={groups}
          loading={loading}
          emptyMessage="Sinflar topilmadi"
        />
      </Card>

      {/* Create/Edit Group Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingGroup ? "Sinfni tahrirlash" : "Yangi sinf"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Sinf nomi *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masalan: 10-A, 11-B"
              required
            />
            <small className="text-gray-500 text-xs mt-1">
              Sinf nomini 10-A, 11-B kabi formatda kiriting
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">O'quv yili *</label>
            <select
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="form-select"
              required
            >
              {ACADEMIC_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
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
              {editingGroup ? 'Yangilash' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Students Modal */}
      <Modal
        show={showStudentsModal}
        onClose={() => {
          setShowStudentsModal(false);
          setSelectedGroup(null);
        }}
        title={selectedGroup ? `${selectedGroup.name} sinfi o'quvchilari` : ''}
        size="large"
      >
        {selectedGroup && (
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium mb-2">{selectedGroup.name}</h3>
              <div className="grid grid-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">O'quv yili:</span>
                  <span className="ml-2 font-medium">{selectedGroup.academic_year}</span>
                </div>
                <div>
                  <span className="text-gray-600">Jami o'quvchilar:</span>
                  <span className="ml-2 font-medium">
                    {selectedGroup.students ? selectedGroup.students.length : 0}
                  </span>
                </div>
              </div>
            </div>

            {selectedGroup.students && selectedGroup.students.length > 0 ? (
              <Table 
                columns={studentColumns} 
                data={selectedGroup.students}
                emptyMessage="Bu sinfda o'quvchilar yo'q"
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">👥</div>
                <p className="mb-4">Bu sinfda hali o'quvchilar mavjud emas</p>
                <Button 
                  onClick={() => {
                    setShowStudentsModal(false);
                    window.location.href = '/students';
                  }}
                >
                  O'quvchi qo'shish
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Groups;