import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { createStudentValidator } from '../../utils/validation';

const StudentForm = ({
  initialData = {},
  groups = [],
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Saqlash',
  cancelText = 'Bekor qilish',
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    group_id: '',
    parent_phone: '',
    graduation_year: new Date().getFullYear() + 4,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [validator] = useState(() => createStudentValidator());

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData,
      password: '', // Always reset password field
      group_id: initialData.group_id || ''
    }));
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone numbers
    if (name === 'phone' || name === 'parent_phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 9) {
        setFormData(prev => ({ ...prev, [name]: digits }));
      }
    } else if (name === 'graduation_year') {
      // Ensure graduation year is a number
      const year = parseInt(value) || '';
      setFormData(prev => ({ ...prev, [name]: year }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    // Create validator with password rule if needed
    const formValidator = createStudentValidator();
    
    if (!isEditing || formData.password) {
      formValidator.required('password', 'Parol kiritilishi shart')
                  .minLength('password', 6, 'Parol kamida 6 belgidan iborat bo\'lishi kerak');
    }

    const result = formValidator.validate(formData);
    setErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = { ...formData };
    
    // Convert group_id to number if selected
    if (submitData.group_id) {
      submitData.group_id = parseInt(submitData.group_id);
    } else {
      delete submitData.group_id; // Remove if not selected
    }

    // Remove password if editing and password is empty
    if (isEditing && !submitData.password) {
      delete submitData.password;
    }

    // Remove empty parent_phone
    if (!submitData.parent_phone) {
      delete submitData.parent_phone;
    }

    onSubmit(submitData);
  };

  const getFieldError = (fieldName) => {
    const fieldErrors = errors[fieldName];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : '';
  };

  const getSelectedGroup = () => {
    return groups.find(group => group.id === parseInt(formData.group_id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Shaxsiy ma'lumotlar</h3>
        
        <div className="grid grid-2 gap-4">
          <div className="form-group">
            <label className="form-label">Ism *</label>
            <Input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Ismni kiriting"
              error={getFieldError('first_name')}
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
              error={getFieldError('last_name')}
              required
            />
          </div>
        </div>

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
              error={getFieldError('phone')}
            />
          </div>
          <small className="text-gray-500 text-xs mt-1">
            O'quvchining shaxsiy telefon raqami (ixtiyoriy)
          </small>
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Ta'lim ma'lumotlari</h3>
        
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
            <small className="text-gray-500 text-xs mt-1">
              O'quvchi qaysi sinfda o'qishini tanlang
            </small>
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
              error={getFieldError('graduation_year')}
            />
            <small className="text-gray-500 text-xs mt-1">
              O'quvchining maktabni bitirish yili
            </small>
          </div>
        </div>

        {/* Display selected group info */}
        {getSelectedGroup() && (
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="text-sm">
              <span className="font-medium">Tanlangan sinf:</span> {getSelectedGroup().name}
              <br />
              <span className="font-medium">O'quv yili:</span> {getSelectedGroup().academic_year}
            </div>
          </div>
        )}
      </div>

      {/* Parent Information */}
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Ota-ona ma'lumotlari</h3>
        
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
              error={getFieldError('parent_phone')}
            />
          </div>
          <small className="text-gray-500 text-xs mt-1">
            Ota-ona telefon raqami (tizimda ro'yxatdan o'tgan bo'lishi kerak)
          </small>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Akkaunt ma'lumotlari</h3>
        
        <div className="form-group">
          <label className="form-label">
            Parol {!isEditing && "*"}
            {isEditing && (
              <span className="text-sm text-gray-500 font-normal ml-2">
                (bo'sh qoldiring, agar o'zgartirmoqchi bo'lmasangiz)
              </span>
            )}
          </label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Parolni kiriting"
            error={getFieldError('password')}
            required={!isEditing}
            minLength="6"
          />
          <small className="text-gray-500 text-xs mt-1">
            O'quvchi tizimga kirish uchun parol (kamida 6 ta belgi)
          </small>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {submitText}
        </Button>
      </div>

      {/* Display validation summary if there are errors */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <h4 className="text-red-800 font-medium mb-2">Xatoliklarni tuzating:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.values(errors).flat().map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

export default StudentForm;