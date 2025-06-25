import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { createParentValidator } from '../../utils/validation';

const ParentForm = ({
  initialData = {},
  students = [],
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
    email: '',
    password: '',
    children: [],
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [validator] = useState(() => createParentValidator());

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData,
      password: '', // Always reset password field
      children: initialData.children || []
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

  const handleChildrenChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => parseInt(option.value));
    setFormData(prev => ({ ...prev, children: selectedIds }));
  };

  const validateForm = () => {
    // Create validator with password rule if needed
    const formValidator = createParentValidator();
    
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
    
    // Remove password if editing and password is empty
    if (isEditing && !submitData.password) {
      delete submitData.password;
    }

    // Remove empty email
    if (!submitData.email) {
      delete submitData.email;
    }

    onSubmit(submitData);
  };

  const getFieldError = (fieldName) => {
    const fieldErrors = errors[fieldName];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : '';
  };

  const getSelectedChildren = () => {
    return students.filter(student => formData.children.includes(student.id));
  };

  const getAvailableStudents = () => {
    // Show students that don't have parents or are already connected to this parent
    return students.filter(student => 
      !student.parent_phone || 
      student.parent_phone === formData.phone ||
      formData.children.includes(student.id)
    );
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
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Aloqa ma'lumotlari</h3>
        
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
              Bu telefon raqam farzandlarni bog'lash uchun ishlatiladi
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
            <small className="text-gray-500 text-xs mt-1">
              Email manzili (ixtiyoriy)
            </small>
          </div>
        </div>
      </div>

      {/* Children Information */}
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Farzandlar ma'lumotlari</h3>
        
        <div className="form-group">
          <label className="form-label">Farzandlari</label>
          <select
            multiple
            className="form-select"
            value={formData.children}
            onChange={handleChildrenChange}
            size="6"
          >
            {getAvailableStudents().map((student) => (
              <option key={student.id} value={student.id}>
                {student.first_name} {student.last_name}
                {student.group && ` (${student.group.name})`}
                {student.parent_phone && student.parent_phone !== formData.phone && ' - Boshqa ota-onaga bog\'langan'}
              </option>
            ))}
          </select>
          <small className="text-gray-500 text-xs mt-1">
            Ctrl+Click yoki Cmd+Click bilan bir nechta farzandni tanlash mumkin
          </small>
        </div>

        {/* Selected children display */}
        {getSelectedChildren().length > 0 && (
          <div className="mt-3 p-3 bg-white border rounded-lg">
            <div className="text-sm font-medium mb-2">Tanlangan farzandlar:</div>
            <div className="space-y-2">
              {getSelectedChildren().map((child) => (
                <div key={child.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div>
                    <span className="font-medium">{child.first_name} {child.last_name}</span>
                    {child.group && (
                      <span className="text-gray-500 text-sm ml-2">({child.group.name})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        children: prev.children.filter(id => id !== child.id)
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    O'chirish
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information about connecting children */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Farzandlarni bog'lash</h4>
          <div className="text-blue-700 text-sm space-y-1">
            <div>• Farzandlar avtomatik ravishda ota-onaga bog'lanadi</div>
            <div>• Ota-ona o'z farzandlarining natijalarini ko'ra oladi</div>
            <div>• Bir farzand bir nechta ota-onaga bog'lanishi mumkin</div>
            <div>• O'quvchining "Ota-ona telefoni" maydoni bu telefon raqamga o'rnatiladi</div>
          </div>
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
            Ota-ona tizimga kirish uchun parol (kamida 6 ta belgi)
          </small>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Muhim ma'lumot</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div>• Ota-ona o'z farzandlarining baholarini ko'ra oladi</div>
          <div>• Davomat ma'lumotlarini kuzatishi mumkin</div>
          <div>• To'lovlar haqida ma'lumot oladi</div>
          <div>• Maktab yangiliklarini ko'ra oladi</div>
          <div>• Telefon raqam orqali farzandlar avtomatik bog'lanadi</div>
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

export default ParentForm;