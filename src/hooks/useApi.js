import { useState, useCallback, useRef, useEffect } from 'react';
import ApiService from '../services/api';

// Custom hook for API calls with loading, error, and caching
export const useApi = (apiMethod, initialData = null, autoLoad = false) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Execute API call
  const execute = useCallback(async (...args) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiMethod(...args);
      
      if (mountedRef.current) {
        setData(result);
        setLastFetch(new Date());
      }
      
      return { success: true, data: result };
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'API xatoligi');
        console.error('API Error:', err);
      }
      
      return { success: false, error: err.message || 'API xatoligi' };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiMethod]);

  // Execute with success/error callbacks
  const executeWithCallbacks = useCallback(async (args = [], onSuccess, onError) => {
    const result = await execute(...args);
    
    if (result.success && onSuccess) {
      onSuccess(result.data);
    } else if (!result.success && onError) {
      onError(result.error);
    }
    
    return result;
  }, [execute]);

  // Refresh data
  const refresh = useCallback(() => {
    return execute();
  }, [execute]);

  // Clear data and error
  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLastFetch(null);
  }, [initialData]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      execute();
    }
  }, [autoLoad, execute]);

  return {
    data,
    loading,
    error,
    lastFetch,
    execute,
    executeWithCallbacks,
    refresh,
    reset
  };
};

// Hook for CRUD operations
export const useCrud = (entityName) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API methods based on entity name
  const getApiMethods = useCallback(() => {
    const methods = {
      students: {
        getAll: ApiService.getStudents,
        getOne: ApiService.getStudent,
        create: ApiService.createStudent,
        update: ApiService.updateStudent,
        delete: ApiService.deleteStudent
      },
      teachers: {
        getAll: ApiService.getTeachers,
        getOne: ApiService.getTeacher,
        create: ApiService.createTeacher,
        update: ApiService.updateTeacher,
        delete: ApiService.deleteTeacher
      },
      parents: {
        getAll: ApiService.getParents,
        getOne: ApiService.getParent,
        create: ApiService.createParent,
        update: ApiService.updateParent,
        delete: ApiService.deleteParent
      },
      groups: {
        getAll: ApiService.getGroups,
        getOne: ApiService.getGroup,
        create: ApiService.createGroup,
        update: ApiService.updateGroup,
        delete: ApiService.deleteGroup
      },
      subjects: {
        getAll: ApiService.getSubjects,
        getOne: ApiService.getSubject,
        create: ApiService.createSubject,
        update: ApiService.updateSubject,
        delete: ApiService.deleteSubject
      },
      news: {
        getAll: ApiService.getNews,
        getOne: ApiService.getNewsArticle,
        create: ApiService.createNews,
        update: ApiService.updateNews,
        delete: ApiService.deleteNews
      }
    };

    return methods[entityName] || {};
  }, [entityName]);

  const apiMethods = getApiMethods();

  // Load all items
  const loadItems = useCallback(async () => {
    if (!apiMethods.getAll) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiMethods.getAll();
      setItems(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiMethods.getAll]);

  // Load single item
  const loadItem = useCallback(async (id) => {
    if (!apiMethods.getOne) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiMethods.getOne(id);
      setSelectedItem(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiMethods.getOne]);

  // Create new item
  const createItem = useCallback(async (itemData) => {
    if (!apiMethods.create) return;

    setLoading(true);
    setError(null);

    try {
      const newItem = await apiMethods.create(itemData);
      setItems(prev => [...prev, newItem]);
      return { success: true, data: newItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiMethods.create]);

  // Update existing item
  const updateItem = useCallback(async (id, itemData) => {
    if (!apiMethods.update) return;

    setLoading(true);
    setError(null);

    try {
      const updatedItem = await apiMethods.update(id, itemData);
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(updatedItem);
      }
      return { success: true, data: updatedItem };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiMethods.update, selectedItem]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    if (!apiMethods.delete) return;

    setLoading(true);
    setError(null);

    try {
      await apiMethods.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [apiMethods.delete, selectedItem]);

  // Refresh items
  const refresh = useCallback(() => {
    return loadItems();
  }, [loadItems]);

  // Reset state
  const reset = useCallback(() => {
    setItems([]);
    setSelectedItem(null);
    setError(null);
  }, []);

  return {
    items,
    selectedItem,
    loading,
    error,
    loadItems,
    loadItem,
    createItem,
    updateItem,
    deleteItem,
    refresh,
    reset,
    setSelectedItem
  };
};

// Hook for file uploads
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const uploadFile = useCallback(async (file, uploadMethod, ...args) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress (since we don't have real progress from API)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadMethod(file, ...args);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setUploadedFiles(prev => [...prev, result]);
      
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const uploadProfilePicture = useCallback((file) => {
    return uploadFile(file, ApiService.uploadProfilePicture);
  }, [uploadFile]);

  const uploadHomeworkFile = useCallback((file, homeworkId) => {
    return uploadFile(file, ApiService.uploadHomeworkFile, homeworkId);
  }, [uploadFile]);

  const uploadExamFile = useCallback((file, examId) => {
    return uploadFile(file, ApiService.uploadExamFile, examId);
  }, [uploadFile]);

  const uploadNewsImage = useCallback((file, newsId) => {
    return uploadFile(file, ApiService.uploadNewsImage, newsId);
  }, [uploadFile]);

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
    setUploadedFiles([]);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedFiles,
    uploadFile,
    uploadProfilePicture,
    uploadHomeworkFile,
    uploadExamFile,
    uploadNewsImage,
    reset
  };
};

export default useApi;