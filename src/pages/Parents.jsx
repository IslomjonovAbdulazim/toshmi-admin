import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { MESSAGES } from '../utils/constants';

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getParents();
      setParents(data);
    } catch (error) {
      setError('Ota-onalarni yuklashda xatolik: ' + error.message);
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
      
      if (editingParent) {
        await ApiService.updateParent(editingParent.id, submitData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        await ApiService.createParent(submitData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }
      
      setShowModal(false);
      loadParents();
      resetForm();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setFormData({
      phone: parent.phone || '',
      first_name: parent.first_name || '',
      last_name: parent.last_name || '',
      password: '', // Don't prefill password
      email: parent.email || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (parentId) => {
    if (!window.confirm('Ota-onani o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await ApiService.deleteParent(parentId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadParents();
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
      email: ''
    });
    setEditingParent(null);
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

  const getChildrenNames = (parent) => {
    if (!parent.children || parent.children.length === 0) {
      return '-';
    }
    return parent.children.map(child => 
      `${child.first_name} ${child.last_name}`
    ).join(', ');
  };

  const getChildrenCount = (parent) => {
    return parent.children ? parent.children.length : 0;
  };

  const columns = [
    {
      key: 'full_name',
      label: 'F.I.Sh',
      render: (parent) => `${parent.first_name} ${parent.last_name}`
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (parent) => parent.phone ? `+998${parent.phone}` : '-'
    },
    {
      key: 'email',
      label: 'Email',
      render: (parent) => parent.email || '-'
    },
    {
      key: 'children_count',
      label: 'Farzandlar soni',
      render: (parent) => getChildrenCount(parent)
    },
    {
      key: 'children',
      label: 'Farzandlari',
      render: (parent) => (
        <div className="max-w-xs">
          <span className="text-sm">{getChildrenNames(parent)}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Holat',
      render: (parent) => (
        <span className={`badge ${parent.is_active ? 'badge-success' : 'badge-danger'}`}>
          {parent.is_active ? 'Faol' : 'Faol emas'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (parent) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleEdit(parent)}
          >
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(parent.id)}
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
        <h1 className="header-title">Ota-onalar</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi ota-ona
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      <Card>
        <Table 
          columns={columns} 
          data={parents}
          loading={loading}
          emptyMessage="Ota-onalar topilmadi"
        />
      </Card>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingParent ? "Ota-onani tahrirlash" : "Yangi ota-ona"}
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
            <label className="form-label">
              Parol {editingParent && "(bo'sh qoldiring, agar o'zgartirmoqchi bo'lmasangiz)"}
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolni kiriting"
              required={!editingParent}
              minLength="6"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Farzandlarni bog'lash</h4>
            <p className="text-blue-600 text-sm">
              Ota-onani yaratgandan so'ng, farzandlarni bog'lash uchun o'quvchilar 
              sahifasida ularning "Ota-ona telefoni" maydoniga bu telefon raqamni kiriting.
            </p>
            <div className="text-xs text-blue-500 mt-2">
              💡 Bir ota-ona bir nechta farzandga bog'lanishi mumkin
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
              {editingParent ? 'Yangilash' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Parents;