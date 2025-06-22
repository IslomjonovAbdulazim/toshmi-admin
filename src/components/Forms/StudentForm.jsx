// src/components/Forms/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { validateForm } from '../../utils/validators';

const StudentForm = ({ student = null, groups = [], onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    group_id: '',
    graduation_year: new Date().getFullYear() + 1,
    password: 'student123'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.user?.full_name || '',
        phone: student.user?.phone?.toString() || '',
        group_id: student.group_id,
        graduation_year: student.graduation_year,
        password: 'student123'
      });
    }
  }, [student]);

  const validationRules = {
    full_name: { required: true, label: 'Ism familiya' },
    phone: { required: true, type: 'phone', label: 'Telefon raqam' },
    group_id: { required: true, label: 'Guruh' },
    graduation_year: { required: true, type: 'number', min: new Date().getFullYear(), max: new Date().getFullYear() + 15, label: 'Bitirish yili' },
    password: { required: true, label: 'Parol' }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    
    if (validation.isValid) {
      onSubmit({
        ...formData,
        phone: parseInt(formData.phone.replace(/[^\d]/g, '')),
        graduation_year: parseInt(formData.graduation_year)
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Ism familiya"
        name="full_name"
        value={formData.full_name}
        onChange={handleChange}
        error={errors.full_name}
        required
      />
      
      <Input
        label="Telefon raqam"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder="990330919"
        error={errors.phone}
        required
      />

      <div className="form-group">
        <label className="form-label">
          Guruh <span style={{ color: '#e53e3e' }}>*</span>
        </label>
        <select
          name="group_id"
          value={formData.group_id}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="">Guruhni tanlang</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        {errors.group_id && <div className="error">{errors.group_id}</div>}
      </div>

      <Input
        label="Bitirish yili"
        name="graduation_year"
        type="number"
        value={formData.graduation_year}
        onChange={handleChange}
        error={errors.graduation_year}
        required
      />

      <Input
        label="Boshlang'ich parol"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      <div className="flex gap-2 mt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Yaratish'}
        </Button>
        <Button type="button" onClick={onCancel}>
          Bekor qilish
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
