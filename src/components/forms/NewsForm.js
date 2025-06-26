import React, { useState, useEffect } from 'react';
import { newsService } from '../../services/newsService';
import AuthImage from '../common/AuthImage';

const NewsForm = ({ newsId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    external_links: [],
    is_published: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newLink, setNewLink] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (newsId) {
      fetchNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsId]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getById(newsId);
      const data = response.data;
      setFormData({
        title: data.title,
        content: data.content,
        external_links: data.external_links || [],
        is_published: data.is_published
      });
      setExistingImages(data.image_ids || []);
    } catch (err) {
      setError('Yangilik ma\'lumotlarini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleAddLink = () => {
    if (newLink.trim() && !formData.external_links.includes(newLink.trim())) {
      setFormData(prev => ({
        ...prev,
        external_links: [...prev.external_links, newLink.trim()]
      }));
      setNewLink('');
    }
  };

  const handleRemoveLink = (index) => {
    setFormData(prev => ({
      ...prev,
      external_links: prev.external_links.filter((_, i) => i !== index)
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const uploadImages = async (newsId) => {
    if (selectedImages.length === 0) return;
    
    setUploading(true);
    try {
      for (const file of selectedImages) {
        await newsService.uploadImage(newsId, file);
      }
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Sarlavha kiritilishi shart');
      return;
    }
    if (!formData.content.trim()) {
      setError('Matn kiritilishi shart');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (newsId) {
        response = await newsService.update(newsId, formData);
      } else {
        response = await newsService.create(formData);
      }

      // Upload images if creating new news
      if (!newsId && selectedImages.length > 0) {
        const createdNewsId = response.data.id;
        await uploadImages(createdNewsId);
      } else if (newsId && selectedImages.length > 0) {
        await uploadImages(newsId);
      }

      onSuccess();
    } catch (err) {
      setError('Yangilik saqlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '700px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px'
    },
    textarea: {
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '120px',
      resize: 'vertical'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    linkContainer: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    linkInput: {
      flex: 1,
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px'
    },
    addBtn: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    linksList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    linkItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px',
      fontSize: '14px'
    },
    removeBtn: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '4px 8px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    fileInput: {
      padding: '12px',
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      textAlign: 'center',
      cursor: 'pointer'
    },
    imagePreview: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '8px',
      marginTop: '8px'
    },
    imageItem: {
      width: '150px',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '8px',
      border: '2px solid #e5e7eb'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '8px'
    },
    cancelBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    submitBtn: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      minWidth: '120px'
    },
    submitBtnDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {newsId ? 'Yangilikni tahrirlash' : 'Yangi yangilik qo\'shish'}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Sarlavha *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              placeholder="Yangilik sarlavhasi"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Matn *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Yangilik matni"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tashqi havolalar</label>
            <div style={styles.linkContainer}>
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                style={styles.linkInput}
                placeholder="https://example.com"
              />
              <button
                type="button"
                onClick={handleAddLink}
                style={styles.addBtn}
              >
                Qo'shish
              </button>
            </div>
            {formData.external_links.length > 0 && (
              <div style={styles.linksList}>
                {formData.external_links.map((link, index) => (
                  <div key={index} style={styles.linkItem}>
                    <span>{link}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      style={styles.removeBtn}
                    >
                      O'chirish
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Rasm</label>
            {existingImages.length > 0 ? (
              <div>
                <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '8px'}}>
                  Mavjud rasm:
                </p>
                <AuthImage
                  fileId={existingImages[0]}
                  alt="News"
                  style={styles.imageItem}
                />
                <p style={{fontSize: '12px', color: '#9ca3af', marginTop: '4px'}}>
                  Yangi rasm yuklash uchun avval mavjud rasmni o'chiring
                </p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={styles.fileInput}
                />
                {selectedImages.length > 0 && (
                  <div style={{marginTop: '8px'}}>
                    <img
                      src={URL.createObjectURL(selectedImages[0])}
                      alt="Preview"
                      style={styles.imageItem}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div style={styles.checkbox}>
            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
            />
            <label>Nashr qilish</label>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={onClose}
              disabled={loading || uploading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(loading || uploading ? styles.submitBtnDisabled : {})
              }}
              disabled={loading || uploading}
            >
              {loading || uploading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm;