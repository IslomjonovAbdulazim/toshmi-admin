// src/components/Forms/UserForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { validateForm } from '../../utils/validators';

const UserForm = ({ user = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    role: 'student',
    phone: '',
    full_name: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role,
        phone: user.phone.toString(),
        full_name: user.full_name,
        password: ''
      });
    }
  }, [user]);

  const validationRules = {
    full_name: { required: true, label: 'Ism familiya' },
    phone: { required: true, type: 'phone', label: 'Telefon raqam' },
    role: { required: true, label: 'Rol' },
    ...(!user && { password: { required: true, type: 'password', label: 'Parol' } })
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    
    if (validation.isValid) {
      onSubmit({
        ...formData,
        phone: parseInt(formData.phone.replace(/[^\d]/g, ''))
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
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
          Rol <span style={{ color: '#e53e3e' }}>*</span>
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="student">O'quvchi</option>
          <option value="teacher">O'qituvchi</option>
          <option value="parent">Ota-ona</option>
          <option value="admin">Administrator</option>
        </select>
        {errors.role && <div className="error">{errors.role}</div>}
      </div>

      {!user && (
        <Input
          label="Parol"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
      )}

      <div className="flex gap-2 mt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : (user ? 'Yangilash' : 'Yaratish')}
        </Button>
        <Button type="button" onClick={onCancel}>
          Bekor qilish
        </Button>
      </div>
    </form>
  );
};

export default UserForm;