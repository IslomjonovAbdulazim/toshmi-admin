import React, { useState, useEffect } from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { useAuth } from '../hooks/useAuth';
import ApiService from '../services/api';
import { MESSAGES } from '../utils/constants';
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
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setSuccess('Profil muvaffaqiyatli yangilandi');
      } else {
        setError(result.error || 'Profilni yangilashda xatolik');
      }
    } catch (error) {
      setError('Profilni yangilashda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Yangi parollar mos kelmaydi');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);

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
      setError('Parolni o\'zgartirishda xatolik: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      await ApiService.uploadProfilePicture(selectedImage);
      setSuccess('Profil rasmi yangilandi');
      setSelectedImage(null);
      setImagePreview(null);
      // Reload profile to get updated image
      window.location.reload();
    } catch (error) {
      setError('Rasm yuklashda xatolik: ' + error.message);
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
    <div>
      <div className="mb-6">
        <h1 className="header-title">Profil sozlamalari</h1>
        <p className="text-gray-600">
          Shaxsiy ma'lumotlaringizni boshqaring va parolingizni o'zgartiring
        </p>
      </div>

      {error && <div className="error mb-4">{error}</div>}
      {success && <div className="success mb-4">{success}</div>}

      {/* User Info Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
            {user?.profile_image_id ? (
              <img 
                src={`/files/${user.profile_image_id}`} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span>{user?.first_name?.charAt(0) || 'A'}</span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-600">{user?.role === 'admin' ? 'Administrator' : user?.role}</p>
            <p className="text-sm text-gray-500">
              Qo'shilgan: {user?.created_at ? formatDate(user.created_at) : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card title="Profil ma'lumotlari">
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Ism *</label>
                <Input
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  placeholder="Ismingizni kiriting"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Familiya *</label>
                <Input
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  placeholder="Familiyangizni kiriting"
                  required
                />
              </div>
            </div>

            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Telefon raqam</label>
                <Input
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="+998901234567"
                  disabled
                />
                <small className="text-gray-500 text-xs">
                  Telefon raqamni o'zgartirish uchun administrator bilan bog'laning
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                loading={loading}
                disabled={loading}
              >
                Saqlash
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card title="Parolni o'zgartirish">
          <form onSubmit={handlePasswordSubmit}>
            <div className="max-w-md">
              <div className="form-group">
                <label className="form-label">Joriy parol *</label>
                <Input
                  type="password"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  placeholder="Joriy parolingizni kiriting"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Yangi parol *</label>
                <Input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Yangi parolingizni kiriting"
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Yangi parolni tasdiqlang *</label>
                <Input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Yangi parolingizni qayta kiriting"
                  required
                  minLength="6"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Parol talablari:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Kamida 6 ta belgi</li>
                  <li>• Kuchli parol uchun harflar, raqamlar va belgilarni aralashtiring</li>
                  <li>• Boshqa joyda ishlatmagan noyob parol kiriting</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  loading={loading}
                  disabled={loading}
                >
                  Parolni o'zgartirish
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'image' && (
        <Card title="Profil rasmi">
          <div className="max-w-md">
            <div className="form-group">
              <label className="form-label">Yangi rasm tanlang</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="form-input"
              />
              <small className="text-gray-500 text-xs mt-1">
                JPG, PNG, GIF formatlarida, maksimal 3MB
              </small>
            </div>

            {imagePreview && (
              <div className="form-group">
                <label className="form-label">Yangi rasm ko'rinishi:</label>
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleImageUpload}
                  loading={loading}
                  disabled={loading}
                >
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
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Joriy profil rasmi:</h4>
                <div className="w-24 h-24 border rounded-lg overflow-hidden">
                  <img 
                    src={`/files/${user.profile_image_id}`} 
                    alt="Current profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Profile;