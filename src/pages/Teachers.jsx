import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { MESSAGES } from '../utils/constants';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
    email: '',
    specialization: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getTeachers();
      setTeachers(data);
    } catch (error) {
      setError('O\'qituvchilarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const submitData = {
        ...formData,
        phone: formData.phone.replace(/\D/g, '') // Remove non-digits
      };
      
      if (editingTeacher) {
        await ApiService.updateTeacher(editingTeacher.id, submitData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        await ApiService.createTeacher(submitData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }
      
      setShowModal(false);
      loadTeachers();
      resetForm();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      phone: teacher.phone || '',
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      password: '', // Don't prefill password
      email: teacher.email || '',
      specialization: teacher.specialization || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('O\'qituvchini o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await ApiService.deleteTeacher(teacherId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadTeachers();
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
      email: '',
      specialization: ''
    });
    setEditingTeacher(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number
    if (name === 'phone') {
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
      render: (teacher) => `${teacher.first_name} ${teacher.last_name}`
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (teacher) => teacher.phone ? `+998${teacher.phone}` : '-'
    },
    {
      key: 'email',
      label: 'Email',
      render: (teacher) => teacher.email || '-'
    },
    {
      key: 'specialization',
      label: 'Mutaxassislik',
      render: (teacher) => teacher.specialization || '-'
    },
    {
      key: 'assignments_count',
      label: 'Tayinlangan fanlar',
      render: (teacher) => teacher.assignments_count || 0
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
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleEdit(teacher)}
          >
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(teacher.id)}
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
        <h1 className="header-title">O'qituvchilar</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi o'qituvchi
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      <Card>
        <Table 
          columns={columns} 
          data={teachers}
          loading={loading}
          emptyMessage="O'qituvchilar topilmadi"
        />
      </Card>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}
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
              <label className="form-label">Telefon raqam *</label>
              <div className="flex items-center">
                <span className="form-input-prefix">+998</span>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="901234567"
                  pattern="[0-9]{9}"
                  maxLength="9"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mutaxassislik</label>
            <Input
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="Masalan: Matematika, Fizika, Kimyo"
            />
            <small className="text-gray-500 text-xs mt-1">
              O'qituvchi qaysi fanlarni o'qitishini kiriting
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              Parol {editingTeacher && "(bo'sh qoldiring, agar o'zgartirmoqchi bo'lmasangiz)"}
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolni kiriting"
              required={!editingTeacher}
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
              {editingTeacher ? 'Yangilash' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;