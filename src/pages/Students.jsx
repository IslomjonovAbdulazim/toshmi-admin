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
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchForm, setSearchForm] = useState({
    name: '',
    group_id: '',
    graduation_year: ''
  });
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    phone: `99123${Math.floor(1000 + Math.random() * 9000)}`,
    group_id: '',
    parent_id: '',
    graduation_year: new Date().getFullYear() + 1,
    password: 'student123'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
    loadParents();
    searchStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadParents = async () => {
    try {
      const data = await ApiService.getUsers({ role: 'parent' });
      setParents(data);
    } catch (error) {
      console.error('Ota-onalarni yuklashda xatolik:', error);
    }
  };

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
      // Filter out empty values
      const cleanParams = {};
      if (searchForm.name.trim()) cleanParams.name = searchForm.name;
      if (searchForm.group_id) cleanParams.group_id = searchForm.group_id;
      if (searchForm.graduation_year) cleanParams.graduation_year = searchForm.graduation_year;
      
      const data = await ApiService.searchStudents(cleanParams);
      setStudents(data);
    } catch (error) {
      setError('O\'quvchilarni qidirishda xatolik');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validate form data
      if (!newStudent.full_name.trim()) {
        setError('Ism familiya kiritilmagan');
        return;
      }
      if (!newStudent.group_id) {
        setError('Guruh tanlanmagan');
        return;
      }

      // Create user first 
      const userData = {
        role: 'student',
        phone: parseInt(newStudent.phone.replace(/[^\d]/g, '')),
        full_name: newStudent.full_name.trim(),
        password: newStudent.password
      };
      
      const user = await ApiService.createUser(userData);
      
      // Try to create student - if it fails, delete the user
      try {
        const studentData = {
          user_id: user.id,
          group_id: newStudent.group_id,
          parent_id: newStudent.parent_id || null,
          graduation_year: parseInt(newStudent.graduation_year)
        };
        
        await ApiService.createStudent(studentData);
        
        setShowModal(false);
        searchStudents();
        resetForm();
      } catch (studentError) {
        // Student creation failed, clean up the user
        try {
          await ApiService.deleteUser(user.id);
        } catch (deleteError) {
          console.error('Failed to clean up user:', deleteError);
        }
        throw new Error('Backend xatoligi: StudentCreate schema da parent_id yo\'q. Backend ni tuzatish kerak.');
      }
      
    } catch (error) {
      let errorMessage = 'O\'quvchi yaratishda xatolik';
      
      if (error.message.includes('UNIQUE constraint failed: users.phone')) {
        errorMessage = 'Bu telefon raqam allaqachon ro\'yxatga olingan';
      } else if (error.message.includes('parent_id')) {
        errorMessage = 'Backend xatoligi: Student yaratish funksiyasini tuzatish kerak';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server ichki xatoligi. Backend kodini tekshiring.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    const randomPhone = `99123${Math.floor(1000 + Math.random() * 9000)}`;
    
    setNewStudent({
      full_name: '',
      phone: randomPhone,
      group_id: '',
      parent_id: '',
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

          <div className="form-group">
            <label className="form-label">Ota-ona (ixtiyoriy)</label>
            <select
              value={newStudent.parent_id}
              onChange={(e) => setNewStudent({...newStudent, parent_id: e.target.value})}
              className="form-select"
            >
              <option value="">Ota-onani tanlang</option>
              {parents.map(parent => (
                <option key={parent.id} value={parent.id}>{parent.full_name}</option>
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