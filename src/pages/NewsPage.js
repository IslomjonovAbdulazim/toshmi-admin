import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import NewsForm from '../components/forms/NewsForm';
import AuthImage from '../components/common/AuthImage';
import { newsService } from '../services/newsService';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await newsService.getAll();
      console.log('Fetched news:', response.data); // Debug log
      setNews(response.data);
    } catch (err) {
      setError('Yangiliklar ro\'yxatini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingNews(null);
    setShowForm(true);
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setShowForm(true);
  };

  const handleDelete = async (newsItem) => {
    if (window.confirm(`"${newsItem.title}" yangiligini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await newsService.delete(newsItem.id);
        fetchNews();
      } catch (err) {
        alert('Yangilik o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNews(null);
    fetchNews();
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNews = [...filteredNews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'published':
        return b.is_published - a.is_published;
      case 'draft':
        return a.is_published - b.is_published;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827'
    },
    searchAndAdd: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    sortSelect: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '200px'
    },
    addBtn: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    imageContainer: {
      height: '200px',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    noImage: {
      color: '#9ca3af',
      fontSize: '14px',
      textAlign: 'center',
      padding: '8px'
    },
    cardContent: {
      padding: '16px'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px',
      lineHeight: '1.4'
    },
    cardText: {
      color: '#6b7280',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '12px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    cardMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#9ca3af',
      marginBottom: '12px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    },
    published: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    draft: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    cardActions: {
      display: 'flex',
      gap: '8px'
    },
    actionBtn: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      flex: 1,
      textAlign: 'center'
    },
    editBtn: {
      backgroundColor: '#f59e0b',
      color: 'white'
    },
    deleteBtn: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    },
    error: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '16px',
      borderRadius: '8px',
      textAlign: 'center'
    },
    empty: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    },
    linksSection: {
      marginTop: '12px',
      padding: '8px 0'
    },
    linksTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '6px'
    },
    linksList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontSize: '12px',
      padding: '2px 0',
      display: 'block',
      wordBreak: 'break-all'
    },
    moreLinks: {
      fontSize: '11px',
      color: '#9ca3af',
      fontStyle: 'italic'
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Yangiliklar boshqaruvi</h1>
          <div style={styles.searchAndAdd}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="newest">Eng yangilari</option>
              <option value="oldest">Eng eskilari</option>
              <option value="published">Nashr qilinganlar</option>
              <option value="draft">Qoralamalar</option>
              <option value="title">Sarlavha bo'yicha</option>
            </select>
            <input
              type="text"
              placeholder="Yangilik sarlavhasini qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button
              style={styles.addBtn}
              onClick={handleAdd}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              + Yangi yangilik
            </button>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div className="spinner"></div>
            <p>Yangiliklar yuklanmoqda...</p>
          </div>
        ) : error ? (
          <div style={styles.error}>
            <p>{error}</p>
            <button 
              onClick={fetchNews}
              style={{
                marginTop: '12px',
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Qayta urinish
            </button>
          </div>
        ) : sortedNews.length === 0 ? (
          <div style={styles.empty}>
            {searchTerm ? (
              <>
                <p>"{searchTerm}" bo'yicha hech narsa topilmadi</p>
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    marginTop: '12px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Filtrni tozalash
                </button>
              </>
            ) : (
              <>
                <p>Hozircha yangiliklar mavjud emas</p>
                <button
                  onClick={handleAdd}
                  style={styles.addBtn}
                >
                  Birinchi yangilikni qo'shish
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {sortedNews.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.imageContainer}>
                  {item.image_ids && item.image_ids.length > 0 ? (
                    <AuthImage
                      fileId={item.image_ids[0]}
                      alt={item.title}
                      style={styles.image}
                    />
                  ) : (
                    <div style={styles.noImage}>
                      {item.image_ids && item.image_ids.length > 0 
                        ? `Image IDs: ${item.image_ids.join(', ')}`
                        : 'Rasm mavjud emas'
                      }
                    </div>
                  )}
                </div>
                
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  
                  <div style={styles.cardMeta}>
                    <span>{new Date(item.created_at).toLocaleDateString('uz-UZ')}</span>
                    <span style={{
                      ...styles.statusBadge,
                      ...(item.is_published ? styles.published : styles.draft)
                    }}>
                      {item.is_published ? 'Nashr qilingan' : 'Qoralama'}
                    </span>
                  </div>
                  
                  <p style={styles.cardText}>{item.content}</p>
                  
                  {item.external_links && item.external_links.length > 0 && (
                    <div style={styles.linksSection}>
                      <p style={styles.linksTitle}>Tashqi havolalar:</p>
                      <div style={styles.linksList}>
                        {item.external_links.slice(0, 3).map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.link}
                            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                          >
                            🔗 {link.length > 35 ? link.substring(0, 35) + '...' : link}
                          </a>
                        ))}
                        {item.external_links.length > 3 && (
                          <span style={styles.moreLinks}>
                            +{item.external_links.length - 3} ta yana...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.cardActions}>
                    <button
                      style={{...styles.actionBtn, ...styles.editBtn}}
                      onClick={() => handleEdit(item)}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                    >
                      Tahrirlash
                    </button>
                    <button
                      style={{...styles.actionBtn, ...styles.deleteBtn}}
                      onClick={() => handleDelete(item)}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <NewsForm
            newsId={editingNews?.id}
            onClose={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default NewsPage;