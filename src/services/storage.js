// src/services/storage.js
class StorageService {
  constructor() {
    this.prefix = 'admin_panel_';
  }

  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serializedValue);
    } catch (error) {
      console.error(`Ma'lumotni saqlashda xatolik (${key}):`, error);
    }
  }

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Ma'lumotni o'qishda xatolik (${key}):`, error);
      return defaultValue;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Ma'lumotni o'chirishda xatolik (${key}):`, error);
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Barcha ma\'lumotlarni o\'chirishda xatolik:', error);
    }
  }

  // Specific storage methods
  saveUserPreferences(preferences) {
    this.setItem('user_preferences', preferences);
  }

  getUserPreferences() {
    return this.getItem('user_preferences', {
      theme: 'light',
      language: 'uz',
      pageSize: 20
    });
  }

  saveTableSettings(tableName, settings) {
    this.setItem(`table_${tableName}`, settings);
  }

  getTableSettings(tableName) {
    return this.getItem(`table_${tableName}`, {
      sortBy: null,
      sortOrder: 'asc',
      filters: {},
      columns: []
    });
  }

  saveFormData(formName, data) {
    this.setItem(`form_${formName}`, {
      data,
      timestamp: new Date().toISOString()
    });
  }

  getFormData(formName) {
    const saved = this.getItem(`form_${formName}`);
    if (!saved) return null;

    // Check if data is older than 1 hour
    const oneHour = 60 * 60 * 1000;
    const savedTime = new Date(saved.timestamp).getTime();
    const now = new Date().getTime();

    if (now - savedTime > oneHour) {
      this.removeItem(`form_${formName}`);
      return null;
    }

    return saved.data;
  }

  clearFormData(formName) {
    this.removeItem(`form_${formName}`);
  }

  // Cache management
  setCache(key, data, expirationMinutes = 30) {
    const expirationTime = new Date().getTime() + (expirationMinutes * 60 * 1000);
    this.setItem(`cache_${key}`, {
      data,
      expiration: expirationTime
    });
  }

  getCache(key) {
    const cached = this.getItem(`cache_${key}`);
    if (!cached) return null;

    if (new Date().getTime() > cached.expiration) {
      this.removeItem(`cache_${key}`);
      return null;
    }

    return cached.data;
  }

  clearExpiredCache() {
    try {
      const keys = Object.keys(localStorage);
      const now = new Date().getTime();

      keys.forEach(key => {
        if (key.startsWith(this.prefix + 'cache_')) {
          try {
            const cached = JSON.parse(localStorage.getItem(key));
            if (cached.expiration && now > cached.expiration) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Invalid cache entry, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Eski cache ni tozalashda xatolik:', error);
    }
  }
}

export default new StorageService();