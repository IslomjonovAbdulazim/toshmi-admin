import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchForm, setSearchForm] = useState({
    name: '',
    group_id: '',
    graduation_year: ''
  });
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    phone: '',
    group_id: '',
    graduation_year: new Date().getFullYear() + 1,
    password: 'student123'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
    searchStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGroups = async () => {
    try {
      const data = await ApiService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Guruhlarni yuklashda xatolik:', error);
    }
  };

  const searchStudents = async () => {
    setLoading(true);
    try {
      const data = await ApiService.searchStudents(searchForm);
      setStudents(data);
    } catch (error) {
      setError('O\'quvchilarni qidirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Create user first
      const userData = {
        role: 'student',
        phone: parseInt(newStudent.phone),
        full_name: newStudent.full_name,
        password: newStudent.password
      };
      
      const user = await ApiService.createUser(userData);
      
      // Create student profile
      const studentData = {
        user_id: user.id,
        group_id: newStudent.group_id,
        graduation_year: parseInt(newStudent.graduation_year)
      };
      
      await ApiService.createStudent(studentData);
      
      setShowModal(false);
      searchStudents();
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };

  const resetForm = () => {
    setNewStudent({
      full_name: '',
      phone: '',
      group_id: '',
      graduation_year: new Date().getFullYear() + 1,
      password: 'student123'
    });
    setError('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchStudents();
  };

  const getGroupName = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Noma\'lum';
  };

  const columns = [
    { key: 'user', title: 'Ism familiya', render: (user) => user?.full_name || 'N/A' },
    { key: 'user', title: 'Telefon', render: (user) => user?.phone || 'N/A' },
    { key: 'group_id', title: 'Guruh', render: (groupId) => getGroupName(groupId) },
    { key: 'graduation_year', title: 'Bitirish yili' }
  ];

  return (
    <div>
      <Card title="O'quvchilarni qidirish">
        <form onSubmit={handleSearch} className="grid grid-3">
          <Input
            label="Ism familiya"
            value={searchForm.name}
            onChange={(e) => setSearchForm({...searchForm, name: e.target.value})}
            placeholder="Ism familiyani kiriting"
          />
          
          <div className="form-group">
            <label className="form-label">Guruh</label>
            <select
              value={searchForm.group_id}
              onChange={(e) => setSearchForm({...searchForm, group_id: e.target.value})}
              className="form-select"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Bitirish yili"
            type="number"
            value={searchForm.graduation_year}
            onChange={(e) => setSearchForm({...searchForm, graduation_year: e.target.value})}
            placeholder="2025"
          />
          
          <div className="form-group">
            <Button type="submit" variant="primary">Qidirish</Button>
          </div>
        </form>
      </Card>

      <Card 
        title="O'quvchilar ro'yxati"
        actions={
          <Button 
            variant="primary" 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Yangi o'quvchi
          </Button>
        }
      >
        {error && <div className="error mb-4">{error}</div>}
        
        {loading ? (
          <div className="loading">Yuklanmoqda...</div>
        ) : (
          <Table 
            columns={columns}
            data={students}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yangi o'quvchi qo'shish"
      >
        <form onSubmit={handleCreateStudent}>
          <Input
            label="Ism familiya"
            value={newStudent.full_name}
            onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
            required
          />
          
          <Input
            label="Telefon raqam"
            type="tel"
            value={newStudent.phone}
            onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
            placeholder="990330919"
            required
          />

          <div className="form-group">
            <label className="form-label">Guruh</label>
            <select
              value={newStudent.group_id}
              onChange={(e) => setNewStudent({...newStudent, group_id: e.target.value})}
              className="form-select"
              required
            >
              <option value="">Guruhni tanlang</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Bitirish yili"
            type="number"
            value={newStudent.graduation_year}
            onChange={(e) => setNewStudent({...newStudent, graduation_year: e.target.value})}
            required
          />

          <Input
            label="Boshlang'ich parol"
            value={newStudent.password}
            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
            required
          />

          {error && <div className="error">{error}</div>}

          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary">
              Yaratish
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

export default Students;