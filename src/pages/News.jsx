import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import ApiService from '../services/api';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newNews, setNewNews] = useState({
    title: '',
    body: '',
    media_urls: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getNews();
      setNews(data);
    } catch (error) {
      setError('Yangiliklarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let mediaUrls = [];
      
      // Upload image if selected
      if (selectedFile) {
        const uploadResult = await ApiService.uploadFile(selectedFile);
        mediaUrls.push(uploadResult.file_path);
      }

      await ApiService.createNews({
        ...newNews,
        media_urls: mediaUrls
      });
      
      setShowModal(false);
      loadNews();
      resetForm();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteNews = async (newsItem) => {
    if (window.confirm(`"${newsItem.title}" ni o'chirishni tasdiqlaysizmi?`)) {
      try {
        await ApiService.deleteNews(newsItem.id);
        loadNews();
      } catch (error) {
        setError('O\'chirishda xatolik');
      }
    }
  };

  const resetForm = () => {
    setNewNews({
      title: '',
      body: '',
      media_urls: []
    });
    setSelectedFile(null);
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Faqat rasm fayllari qo\'shish mumkin');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Fayl hajmi 5MB dan oshmasligi kerak');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const columns = [
    { key: 'title', title: 'Sarlavha' },
    { key: 'body', title: 'Matn', render: (body) => 
      body.length > 100 ? body.substring(0, 100) + '...' : body 
    },
    { key: 'media_urls', title: 'Rasm', render: (urls) => 
      urls && urls.length > 0 ? '📷' : '' 
    },
    { key: 'created_at', title: 'Yaratilgan', render: (date) => 
      new Date(date).toLocaleDateString('uz-UZ') 
    }
  ];

  const actions = (newsItem) => (
    <Button 
      size="sm" 
      variant="danger" 
      onClick={() => handleDeleteNews(newsItem)}
    >
      O'chirish
    </Button>
  );

  return (
    <div>
      <Card 
        title="Yangiliklar"
        actions={
          <Button 
            variant="primary" 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Yangi xabar
          </Button>
        }
      >
        {error && <div className="error mb-4">{error}</div>}
        
        {loading ? (
          <div className="loading">Yuklanmoqda...</div>
        ) : (
          <Table 
            columns={columns}
            data={news}
            actions={actions}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yangi xabar yaratish"
      >
        <form onSubmit={handleCreateNews}>
          <Input
            label="Sarlavha"
            value={newNews.title}
            onChange={(e) => setNewNews({...newNews, title: e.target.value})}
            required
          />
          
          <Input
            label="Xabar matni"
            type="textarea"
            value={newNews.body}
            onChange={(e) => setNewNews({...newNews, body: e.target.value})}
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
              Maksimal hajm: 5MB. Qo'llab-quvvatlanadigan formatlar: JPG, PNG, GIF
            </small>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="primary">
              Yaratish
            </Button>
            <Button onClick={() => setShowModal(false)}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default News;