
// src/components/Forms/NewsForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { validateForm, validateFileSize, validateFileType } from '../../utils/validators';

const NewsForm = ({ news = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title,
        body: news.body
      });
    }
  }, [news]);

  const validationRules = {
    title: { required: true, label: 'Sarlavha' },
    body: { required: true, label: 'Xabar matni' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    
    if (validation.isValid && !fileError) {
      onSubmit({
        formData,
        file: selectedFile
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (file) {
      // Validate file type
      const typeError = validateFileType(file, ['image/*']);
      if (typeError) {
        setFileError(typeError);
        return;
      }
      
      // Validate file size (max 5MB)
      const sizeError = validateFileSize(file, 5);
      if (sizeError) {
        setFileError(sizeError);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Sarlavha"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
      />
      
      <Input
        label="Xabar matni"
        name="body"
        type="textarea"
        value={formData.body}
        onChange={handleChange}
        error={errors.body}
        required
      />

      <div className="form-group">
        <label className="form-label">Rasm yuklash (ixtiyoriy)</label>
        <div className="file-input">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="file-label">
            📷 {selectedFile ? selectedFile.name : 'Rasm tanlang'}
          </div>
        </div>
        <small style={{ color: '#718096', fontSize: '0.8rem' }}>
          Maksimal hajm: 5MB. Qo'llab-quvvatlanadigan formatlar: JPG, PNG, GIF, WebP
        </small>
        {fileError && <div className="error">{fileError}</div>}
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : (news ? 'Yangilash' : 'Yaratish')}
        </Button>
        <Button type="button" onClick={onCancel}>
          Bekor qilish
        </Button>
      </div>
    </form>
  );
};

export default NewsForm;