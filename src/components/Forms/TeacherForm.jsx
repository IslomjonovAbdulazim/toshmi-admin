import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { createTeacherValidator } from '../../utils/validation';
import { COMMON_SUBJECTS } from '../../utils/constants';

const TeacherForm = ({
  initialData = {},
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
    specialization: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [validator] = useState(() => createTeacherValidator());
  const [showSpecializationSuggestions, setShowSpecializationSuggestions] = useState(false);

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
    // Create validator with password rule if needed
    const formValidator = createTeacherValidator();
    
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

    // Remove empty fields
    if (!submitData.email) {
      delete submitData.email;
    }
    if (!submitData.specialization) {
      delete submitData.specialization;
    }

    onSubmit(submitData);
  };

  const getFieldError = (fieldName) => {
    const fieldErrors = errors[fieldName];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : '';
  };

  const handleSpecializationSuggestion = (subject) => {
    const currentSpecialization = formData.specialization;
    const subjects = currentSpecialization.split(',').map(s => s.trim()).filter(s => s);
    
    if (!subjects.includes(subject)) {
      const newSpecialization = subjects.length > 0 
        ? `${currentSpecialization}, ${subject}`
        : subject;
      
      setFormData(prev => ({ ...prev, specialization: newSpecialization }));
    }
    
    setShowSpecializationSuggestions(false);
  };

  const getFilteredSubjects = () => {
    const currentSubjects = formData.specialization.split(',').map(s => s.trim()).filter(s => s);
    return COMMON_SUBJECTS.filter(subject => !currentSubjects.includes(subject));
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
              O'qituvchining telefon raqami
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

      {/* Professional Information */}
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Kasbiy ma'lumotlar</h3>
        
        <div className="form-group">
          <label className="form-label">Mutaxassislik</label>
          <div className="relative">
            <textarea
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              onFocus={() => setShowSpecializationSuggestions(true)}
              placeholder="Masalan: Matematika, Fizika, Kimyo"
              className="form-textarea"
              rows="2"
            />
            <Button
              type="button"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setShowSpecializationSuggestions(!showSpecializationSuggestions)}
            >
              Fanlar
            </Button>
          </div>
          <small className="text-gray-500 text-xs mt-1">
            O'qituvchi qaysi fanlarni o'qitishini kiriting (vergul bilan ajrating)
          </small>

          {/* Subject suggestions */}
          {showSpecializationSuggestions && (
            <div className="mt-2 p-3 bg-white border rounded-lg">
              <div className="text-sm font-medium mb-2">Fanlarni tanlang:</div>
              <div className="flex flex-wrap gap-2">
                {getFilteredSubjects().map((subject, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSpecializationSuggestion(subject)}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                  >
                    + {subject}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSpecializationSuggestions(false)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Yopish
              </button>
            </div>
          )}

          {/* Current specializations display */}
          {formData.specialization && (
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Tanlangan fanlar:</div>
              <div className="flex flex-wrap gap-1">
                {formData.specialization.split(',').map((subject, index) => (
                  subject.trim() && (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                    >
                      {subject.trim()}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
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
            O'qituvchi tizimga kirish uchun parol (kamida 6 ta belgi)
          </small>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3">Qo'shimcha ma'lumot</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div>• O'qituvchi yaratilgandan so'ng, uni fanlarga tayinlash mumkin</div>
          <div>• O'qituvchi o'z parolini keyinchalik o'zgartirishi mumkin</div>
          <div>• Email manzili xabarlar yuborish uchun ishlatiladi</div>
          <div>• Mutaxassislik ma'lumoti fanlarni tayinlashda yordam beradi</div>
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

export default TeacherForm;