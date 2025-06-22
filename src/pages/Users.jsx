import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    role: 'student',
    phone: '',
    full_name: '',
    password: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getUsers();
      setUsers(data);
    } catch (error) {
      setError('Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingUser) {
        await ApiService.updateUser(editingUser.id, formData);
      } else {
        await ApiService.createUser({
          ...formData,
          phone: parseInt(formData.phone)
        });
      }
      setShowModal(false);
      loadUsers();
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      role: user.role,
      phone: user.phone.toString(),
      full_name: user.full_name,
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`${user.full_name} ni o'chirishni tasdiqlaysizmi?`)) {
      try {
        await ApiService.deleteUser(user.id);
        loadUsers();
      } catch (error) {
        setError('O\'chirishda xatolik');
      }
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const result = await ApiService.resetUserPassword(user.id);
      alert(`Yangi parol: ${result.temporary_password}`);
    } catch (error) {
      setError('Parolni tiklashda xatolik');
    }
  };

  const resetForm = () => {
    setFormData({
      role: 'student',
      phone: '',
      full_name: '',
      password: ''
    });
    setEditingUser(null);
    setError('');
  };

  const columns = [
    { key: 'full_name', title: 'Ism familiya' },
    { key: 'phone', title: 'Telefon' },
    { key: 'role', title: 'Rol', render: (value) => {
      const roleNames = {
        admin: 'Administrator',
        teacher: 'O\'qituvchi', 
        student: 'O\'quvchi',
        parent: 'Ota-ona'
      };
      return <span className="badge">{roleNames[value]}</span>;
    }},
    { key: 'created_at', title: 'Yaratilgan', render: (value) => 
      new Date(value).toLocaleDateString('uz-UZ') 
    }
  ];

  const actions = (user) => (
    <>
      <Button size="sm" onClick={() => handleEdit(user)}>
        Tahrirlash
      </Button>
      <Button size="sm" onClick={() => handleResetPassword(user)}>
        Parolni tiklash
      </Button>
      <Button 
        size="sm" 
        variant="danger" 
        onClick={() => handleDelete(user)}
      >
        O'chirish
      </Button>
    </>
  );

  return (
    <div>
      <Card 
        title="Foydalanuvchilar"
        actions={
          <Button 
            variant="primary" 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Yangi foydalanuvchi
          </Button>
        }
      >
        {error && <div className="error mb-4">{error}</div>}
        
        {loading ? (
          <div className="loading">Yuklanmoqda...</div>
        ) : (
          <Table 
            columns={columns}
            data={users}
            actions={actions}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Ism familiya"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required
          />
          
          <Input
            label="Telefon raqam"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="990330919"
            required
          />

          <div className="form-group">
            <label className="form-label">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="form-select"
              required
            >
              <option value="student">O'quvchi</option>
              <option value="teacher">O'qituvchi</option>
              <option value="parent">Ota-ona</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {!editingUser && (
            <Input
              label="Parol"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required={!editingUser}
            />
          )}

          {error && <div className="error">{error}</div>}

          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary">
              {editingUser ? 'Yangilash' : 'Yaratish'}
            </Button>
            <Button onClick={() => setShowModal(false)}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;