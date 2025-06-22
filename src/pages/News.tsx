import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import { News } from '../types';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNews, setNewNews] = useState({
    title: '',
    body: '',
    media_urls: '',
    links: ''
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get('/admin/news');
      setNews(response.data);
    } catch (error) {
      console.error('Yangiliklarni olishda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newsData = {
        ...newNews,
        media_urls: newNews.media_urls ? newNews.media_urls.split(',').map(url => url.trim()) : [],
        links: newNews.links ? newNews.links.split(',').map(link => link.trim()) : []
      };
      
      await api.post('/admin/news', newsData);
      setShowCreateModal(false);
      setNewNews({ title: '', body: '', media_urls: '', links: '' });
      fetchNews();
    } catch (error) {
      console.error('Yangilik yaratishda xatolik:', error);
    }
  };

  const deleteNews = async (id: string) => {
    if (confirm('Rostdan ham bu yangilikni o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/admin/news/${id}`);
        fetchNews();
      } catch (error) {
        console.error('Yangilikni o\'chirishda xatolik:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yangiliklar</h1>
          <p className="text-gray-600">Maktab yangiliklar va e'lonlarini boshqarish</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + Yangilik qo'shish
        </Button>
      </div>

      {/* News List */}
      <div className="space-y-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          news.map(item => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => deleteNews(item.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {item.body}
                  </p>
                  
                  {item.media_urls && item.media_urls.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Media:</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.media_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            📷 Media {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {item.links && item.links.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Foydali havolalar:</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            🔗 Havola {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Yangi yangilik</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={createNews} className="space-y-4">
              <Input
                label="Sarlavha"
                value={newNews.title}
                onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                placeholder="Yangilik sarlavhasi"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matn <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newNews.body}
                  onChange={(e) => setNewNews({...newNews, body: e.target.value})}
                  placeholder="Yangilik matni..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                />
              </div>

              <Input
                label="Media URL'lar (ixtiyoriy)"
                value={newNews.media_urls}
                onChange={(e) => setNewNews({...newNews, media_urls: e.target.value})}
                placeholder="Vergul bilan ajrating: url1, url2, url3"
              />

              <Input
                label="Havolalar (ixtiyoriy)"
                value={newNews.links}
                onChange={(e) => setNewNews({...newNews, links: e.target.value})}
                placeholder="Vergul bilan ajrating: link1, link2, link3"
              />
              
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit">E'lon qilish</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}