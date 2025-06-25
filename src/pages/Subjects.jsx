import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { COMMON_SUBJECTS, MESSAGES } from '../utils/constants';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getSubjects();
      setSubjects(data);
    } catch (error) {
      setError('Fanlarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (editingSubject) {
        await ApiService.updateSubject(editingSubject.id, formData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        await ApiService.createSubject(formData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }
      
      setShowModal(false);
      loadSubjects();
      resetForm();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Fanni o\'chirishni tasdiqlaysizmi? Bu amal qaytarilmaydi.')) {
      return;
    }

    try {
      await ApiService.deleteSubject(subjectId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadSubjects();
    } catch (error) {
      setError('O\'chirishda xatolik: ' + error.message);
    }
  };

  const handleViewDetails = async (subject) => {
    try {
      const subjectData = await ApiService.getSubject(subject.id);
      setSelectedSubject(subjectData);
      setShowDetailsModal(true);
    } catch (error) {
      setError('Fan ma\'lumotlarini yuklashda xatolik: ' + error.message);
    }
  };

  const handleQuickAdd = (subjectName) => {
    setFormData({
      name: subjectName,
      code: generateCode(subjectName),
      description: ''
    });
    setShowModal(true);
  };

  const generateCode = (name) => {
    // Generate a simple code from subject name
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    return words.map(word => word.charAt(0)).join('').toUpperCase();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: ''
    });
    setEditingSubject(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // Auto-generate code when name changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        code: prev.code || generateCode(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Fan nomi',
      render: (subject) => (
        <div className="font-medium">{subject.name}</div>
      )
    },
    {
      key: 'code',
      label: 'Fan kodi',
      render: (subject) => (
        <span className="badge">{subject.code}</span>
      )
    },
    {
      key: 'description',
      label: 'Tavsif',
      render: (subject) => (
        <div className="max-w-xs">
          <span className="text-sm text-gray-600">
            {subject.description || '-'}
          </span>
        </div>
      )
    },
    {
      key: 'assignments_count',
      label: 'Tayinlangan o\'qituvchilar',
      render: (subject) => (
        <span className="badge badge-success">
          {subject.assignments_count || 0}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Yaratilgan sana',
      render: (subject) => new Date(subject.created_at).toLocaleDateString('uz-UZ')
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (subject) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleViewDetails(subject)}
          >
            📋 Batafsil
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(subject)}
          >
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(subject.id)}
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
        <h1 className="header-title">Fanlar boshqaruvi</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi fan
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      {/* Quick Add Common Subjects */}
      <Card title="Tez qo'shish" className="mb-6">
        <p className="text-gray-600 text-sm mb-3">
          Umumiy fanlarni tez qo'shish uchun quyidagi tugmalardan foydalaning:
        </p>
        <div className="grid grid-4 gap-2">
          {COMMON_SUBJECTS.map((subject, index) => (
            <Button
              key={index}
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAdd(subject)}
              className="text-xs"
            >
              + {subject}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <Table 
          columns={columns} 
          data={subjects}
          loading={loading}
          emptyMessage="Fanlar topilmadi"
        />
      </Card>

      {/* Create/Edit Subject Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingSubject ? "Fanni tahrirlash" : "Yangi fan"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Fan nomi *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masalan: Matematika, Fizika"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fan kodi *</label>
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="MAT, FIZ, KIM"
              required
              maxLength="10"
            />
            <small className="text-gray-500 text-xs mt-1">
              Fan kodi avtomatik yaratiladi, ammo o'zgartirishingiz mumkin
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Fan haqida qisqacha ma'lumot..."
              className="form-textarea"
              rows="3"
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
              {editingSubject ? 'Yangilash' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subject Details Modal */}
      <Modal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedSubject(null);
        }}
        title={selectedSubject ? `${selectedSubject.name} - Batafsil ma'lumot` : ''}
        size="large"
      >
        {selectedSubject && (
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-2 gap-4">
                <div>
                  <span className="text-gray-600">Fan kodi:</span>
                  <span className="ml-2 font-medium">{selectedSubject.code}</span>
                </div>
                <div>
                  <span className="text-gray-600">Yaratilgan:</span>
                  <span className="ml-2 font-medium">
                    {new Date(selectedSubject.created_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              </div>
              {selectedSubject.description && (
                <div className="mt-3">
                  <span className="text-gray-600">Tavsif:</span>
                  <p className="mt-1 text-gray-800">{selectedSubject.description}</p>
                </div>
              )}
            </div>

            {selectedSubject.assignments && selectedSubject.assignments.length > 0 ? (
              <div>
                <h4 className="font-medium mb-3">
                  Tayinlangan o'qituvchilar ({selectedSubject.assignments.length})
                </h4>
                <div className="space-y-3">
                  {selectedSubject.assignments.map((assignment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {assignment.teacher?.first_name} {assignment.teacher?.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Sinf: {assignment.group?.name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.group?.academic_year}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">👩‍🏫</div>
                <p className="mb-4">Bu fanga hali o'qituvchi tayinlanmagan</p>
                <Button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    window.location.href = '/assignments';
                  }}
                >
                  O'qituvchi tayinlash
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Subjects;