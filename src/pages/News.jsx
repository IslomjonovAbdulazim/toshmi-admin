import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';
import { MESSAGES } from '../utils/constants';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    external_links: '',
    is_published: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getNews();
      setNews(data);
    } catch (error) {
      setError('Yangiliklarni yuklashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const submitData = {
        ...formData,
        external_links: formData.external_links 
          ? formData.external_links.split('\n').filter(link => link.trim())
          : []
      };
      
      let newsItem;
      if (editingNews) {
        newsItem = await ApiService.updateNews(editingNews.id, submitData);
        setSuccess(MESSAGES.SUCCESS.UPDATED);
      } else {
        newsItem = await ApiService.createNews(submitData);
        setSuccess(MESSAGES.SUCCESS.CREATED);
      }

      // Upload images if any
      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          try {
            await ApiService.uploadNewsImage(newsItem.id, image);
          } catch (error) {
            console.error('Rasm yuklashda xatolik:', error);
          }
        }
      }
      
      setShowModal(false);
      loadNews();
      resetForm();
    } catch (error) {
      setError(error.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title || '',
      content: newsItem.content || '',
      external_links: newsItem.external_links ? newsItem.external_links.join('\n') : '',
      is_published: newsItem.is_published !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (newsId) => {
    if (!window.confirm('Yanglikni o\'chirishni tasdiqlaysizmi?')) {
      return;
    }

    try {
      await ApiService.deleteNews(newsId);
      setSuccess(MESSAGES.SUCCESS.DELETED);
      loadNews();
    } catch (error) {
      setError('O\'chirishda xatolik: ' + error.message);
    }
  };

  const handleTogglePublish = async (newsItem) => {
    try {
      await ApiService.updateNews(newsItem.id, {
        ...newsItem,
        is_published: !newsItem.is_published
      });
      setSuccess(`Yangilik ${newsItem.is_published ? 'yashirildi' : 'nashr qilindi'}`);
      loadNews();
    } catch (error) {
      setError('Holatni o\'zgartirishda xatolik: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      external_links: '',
      is_published: true
    });
    setEditingNews(null);
    setSelectedImages([]);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '-';
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  const columns = [
    {
      key: 'title',
      label: 'Sarlavha',
      render: (newsItem) => (
        <div>
          <div className="font-medium">{newsItem.title}</div>
          {newsItem.images && newsItem.images.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              📷 {newsItem.images.length} ta rasm
            </div>
          )}
        </div>
      )
    },
    {
      key: 'content',
      label: 'Matn',
      render: (newsItem) => (
        <div className="max-w-xs">
          <span className="text-sm text-gray-600">
            {truncateContent(newsItem.content)}
          </span>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Muallif',
      render: (newsItem) => (
        <div className="text-sm">
          {newsItem.author?.first_name} {newsItem.author?.last_name}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Yaratilgan',
      render: (newsItem) => new Date(newsItem.created_at).toLocaleDateString('uz-UZ')
    },
    {
      key: 'is_published',
      label: 'Holat',
      render: (newsItem) => (
        <span className={`badge ${newsItem.is_published ? 'badge-success' : 'badge-warning'}`}>
          {newsItem.is_published ? 'Nashr qilingan' : 'Yashirilgan'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (newsItem) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleTogglePublish(newsItem)}
          >
            {newsItem.is_published ? 'Yashirish' : 'Nashr qilish'}
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(newsItem)}
          >
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(newsItem.id)}
          >
            O'chirish
          </Button>
        </div>
      )
    }
  ];

  const publishedCount = news.filter(item => item.is_published).length;
  const draftCount = news.filter(item => !item.is_published).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="header-title">Yangiliklar</h1>
        <Button onClick={() => setShowModal(true)}>
          + Yangi yangilik
        </Button>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      {/* Statistics */}
      <div className="grid grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-number">{news.length}</div>
          <div className="stat-label">Jami yangiliklar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{publishedCount}</div>
          <div className="stat-label">Nashr qilingan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{draftCount}</div>
          <div className="stat-label">Qoralama</div>
        </div>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={news}
          loading={loading}
          emptyMessage="Yangiliklar topilmadi"
        />
      </Card>

      {/* News Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingNews ? "Yanglikni tahrirlash" : "Yangi yangilik"}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Sarlavha *</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Yangilik sarlavhasini kiriting"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Matn *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Yangilik matnini kiriting..."
              className="form-textarea"
              rows="8"
              required
            />
            <small className="text-gray-500 text-xs mt-1">
              To'liq matnni kiriting. Formatlar qo'llab-quvvatlanmaydi.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Tashqi havolalar</label>
            <textarea
              name="external_links"
              value={formData.external_links}
              onChange={handleChange}
              placeholder="Har bir qatorga bitta havola kiriting..."
              className="form-textarea"
              rows="3"
            />
            <small className="text-gray-500 text-xs mt-1">
              Har bir qatorga bitta URL kiriting (ixtiyoriy)
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Rasmlar</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="form-input"
            />
            <small className="text-gray-500 text-xs mt-1">
              Bir nechta rasm tanlash mumkin (ixtiyoriy)
            </small>
            {selectedImages.length > 0 && (
              <div className="mt-2">
                <div className="text-sm text-gray-600">
                  Tanlangan rasmlar: {selectedImages.length} ta
                </div>
                <div className="text-xs text-gray-500">
                  {selectedImages.map(file => file.name).join(', ')}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="form-label mb-0">Darhol nashr qilish</span>
            </label>
            <small className="text-gray-500 text-xs mt-1">
              Belgilanmasa, qoralama sifatida saqlanadi
            </small>
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
              {editingNews ? 'Yangilash' : 'Saqlash'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default News;