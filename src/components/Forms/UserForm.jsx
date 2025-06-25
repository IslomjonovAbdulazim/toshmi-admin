import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { createUserValidator } from '../../utils/validation';

const UserForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Saqlash',
  cancelText = 'Bekor qilish',
  showRole = false,
  showPassword = true,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    role: 'student',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [validator] = useState(() => createUserValidator());

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData,
      password: '' // Always reset password field
    }));
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 9) {
        setFormData(prev => ({ ...prev, [name]: digits }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    // Create validator and add password rule only if needed
    const formValidator = createUserValidator();
    
    if (showPassword && (!isEditing || formData.password)) {
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
    
    // Remove password if editing and password is empty
    if (isEditing && !submitData.password) {
      delete submitData.password;
    }

    onSubmit(submitData);
  };

  const getFieldError = (fieldName) => {
    const fieldErrors = errors[fieldName];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Fields */}
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

      {/* Contact Fields */}
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
              error={getFieldError('phone')}
              required
            />
          </div>
          <small className="text-gray-500 text-xs mt-1">
            9 ta raqam kiriting
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            error={getFieldError('email')}
          />
        </div>
      </div>

      {/* Role Field */}
      {showRole && (
        <div className="form-group">
          <label className="form-label">Rol *</label>
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
        </div>
      )}

      {/* Password Field */}
      {showPassword && (
        <div className="form-group">
          <label className="form-label">
            Parol {isEditing && "*"}
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
            Kamida 6 ta belgi kiriting
          </small>
        </div>
      )}

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

export default UserForm;