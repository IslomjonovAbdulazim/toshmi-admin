import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { MESSAGES } from '../utils/constants';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
    group_id: '',
    parent_phone: '',
    graduation_year: new Date().getFullYear() + 4
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStudents();
    loadGroups();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getStudents();
      setStudents(data);
    } catch (error) {
      setError('O\'quvchilarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const submitData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ''), // Remove non-digits
        parent_phone: formData.parent_phone.replace(/\D/g, ''),
        group_id: parseInt(formData.group_id),
        graduation_year: parseInt(formData.graduation_year)
      };
      
      if (editingStudent) {
        await ApiService.updateStudent(editingStudent.id, submitData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        await ApiService.createStudent(submitData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }
      
      setShowModal(false);
      loadStudents();
      resetForm();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      phone: student.phone || '',
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      password: '', // Don't prefill password
      group_id: student.group_id || '',
      parent_phone: student.parent_phone || '',
      graduation_year: student.graduation_year || new Date().getFullYear() + 4
    });
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('O\'quvchini o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await ApiService.deleteStudent(studentId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadStudents();
    } catch (error) {
      setError('O\'chirishda xatolik: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      phone: '',
      first_name: '',
      last_name: '',
      password: '',
      group_id: '',
      parent_phone: '',
      graduation_year: new Date().getFullYear() + 4
    });
    setEditingStudent(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone numbers
    if (name === 'phone' || name === 'parent_phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 9) {
        setFormData(prev => ({
          ...prev,
          [name]: digits
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const columns = [
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
      key: 'group',
      label: 'Sinf',
      render: (student) => student.group ? student.group.name : '-'
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
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (student) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleEdit(student)}
          >
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(student.id)}
          >
            O'chirish
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="header-title">O'quvchilar</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi o'quvchi
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      <Card>
        <Table 
          columns={columns} 
          data={students}
          loading={loading}
          emptyMessage="O'quvchilar topilmadi"
        />
      </Card>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingStudent ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Ism *</label>
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ismni kiriting"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Familiya *</label>
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Familiyani kiriting"
                required
              />
            </div>
          </div>

          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Telefon raqam</label>
              <div className="flex items-center">
                <span className="form-input-prefix">+998</span>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="901234567"
                  pattern="[0-9]{9}"
                  maxLength="9"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ota-ona telefoni</label>
              <div className="flex items-center">
                <span className="form-input-prefix">+998</span>
                <Input
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  placeholder="901234567"
                  pattern="[0-9]{9}"
                  maxLength="9"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label className="form-label">Sinf</label>
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Sinfni tanlang</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.academic_year})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bitirish yili</label>
              <Input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 10}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Parol {editingStudent && "(bo'sh qoldiring, agar o'zgartirmoqchi bo'lmasangiz)"}
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolni kiriting"
              required={!editingStudent}
              minLength="6"
            />
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
              {editingStudent ? 'Yangilash' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;