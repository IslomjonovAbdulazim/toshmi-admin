import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { useAuth } from '../hooks/useAuth';
import ApiService from '../services/api';
import { formatDate } from '../utils/helpers';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Profile image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) { // 3MB limit
        setError('Fayl hajmi 3MB dan oshmasligi kerak');
        return;
      }

      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Faqat JPG, PNG, GIF formatdagi rasmlar qabul qilinadi');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await ApiService.updateProfile(profileData);
      if (updateProfile) {
        updateProfile(response);
      }
      setSuccess('Profil muvaffaqiyatli yangilandi');
    } catch (error) {
      setError(error.message || 'Profilni yangilashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Yangi parollar mos kelmaydi');
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setLoading(false);
      return;
    }

    try {
      await ApiService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      
      setSuccess('Parol muvaffaqiyatli o\'zgartirildi');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      setError(error.message || 'Parolni o\'zgartirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await ApiService.uploadProfilePicture(selectedImage);
      if (updateProfile) {
        updateProfile({
          ...user,
          profile_image_id: response.file_id
        });
      }
      setSuccess('Profil rasmi muvaffaqiyatli yangilandi');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      setError(error.message || 'Rasmni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil ma\'lumotlari', icon: '👤' },
    { id: 'password', label: 'Parolni o\'zgartirish', icon: '🔒' },
    { id: 'image', label: 'Profil rasmi', icon: '🖼️' }
  ];

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Admin profili</h1>
        <p>Shaxsiy ma'lumotlarni va sozlamalarni boshqarish</p>
      </div>

      {/* User Info Card */}
      <Card className="user-info-card">
        <div className="user-avatar">
          {user?.profile_image_id ? (
            <img src={`/files/${user.profile_image_id}`} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          )}
        </div>
        <div className="user-details">
          <h2>{user?.first_name} {user?.last_name}</h2>
          <p className="user-role">Administrator</p>
          <p className="user-meta">
            Ro'yxatdan o'tgan: {user?.created_at ? formatDate(user.created_at) : 'Noma\'lum'}
          </p>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="tabs-header">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card className="form-card">
            <h3>Shaxsiy ma'lumotlar</h3>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-grid">
                <Input
                  label="Ism"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Familiya"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              
              <Input
                label="Telefon raqami"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                required
              />
              
              <Input
                label="Email (ixtiyoriy)"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
              />

              <div className="form-actions">
                <Button type="submit" loading={loading}>
                  O'zgarishlarni saqlash
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card className="form-card">
            <h3>Parolni o'zgartirish</h3>
            <form onSubmit={handlePasswordSubmit}>
              <Input
                label="Joriy parol"
                name="old_password"
                type="password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
              />
              
              <Input
                label="Yangi parol"
                name="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                help="Kamida 6 ta belgi"
              />
              
              <Input
                label="Yangi parolni tasdiqlash"
                name="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
              />

              <div className="form-actions">
                <Button type="submit" loading={loading}>
                  Parolni o'zgartirish
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activeTab === 'image' && (
          <Card className="form-card">
            <h3>Profil rasmi</h3>
            
            <div className="form-group">
              <label className="form-label">Yangi rasm tanlash</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageSelect}
                className="file-input"
              />
              <small className="form-help">
                JPG, PNG, GIF formatlarida, maksimal 3MB
              </small>
            </div>

            {imagePreview && (
              <div className="form-group">
                <label className="form-label">Yangi rasm ko'rinishi:</label>
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="form-actions">
                <Button onClick={handleImageUpload} loading={loading}>
                  Rasmni yuklash
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  Bekor qilish
                </Button>
              </div>
            )}

            {user?.profile_image_id && (
              <div className="current-image">
                <h4>Joriy profil rasmi:</h4>
                <div className="image-preview">
                  <img src={`/files/${user.profile_image_id}`} alt="Current profile" />
                </div>
              </div>
            )}
          </Card>
        )}
      </Card>
    </div>
  );
};

export default Profile;