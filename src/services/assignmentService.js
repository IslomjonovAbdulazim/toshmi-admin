import api from './api';

export const assignmentService = {
  // Assign teacher to group-subject
  assignTeacher: async (assignmentData) => {
    console.log('Creating assignment:', assignmentData);
    try {
      const response = await api.post('/admin/assign-teacher', assignmentData);
      console.log('Assignment created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Assignment creation failed:', error);
      throw error;
    }
  },

  // Get all assignments (constructed from teacher data)
  getAllAssignments: async () => {
    try {
      // Since there's no direct endpoint, we get from teachers
      const response = await api.get('/admin/teachers');
      return response;
    } catch (error) {
      console.error('Failed to get assignments:', error);
      throw error;
    }
  },

  // Remove assignment (if backend supports it in the future)
  removeAssignment: async (groupSubjectId) => {
    try {
      // This endpoint might need to be added to backend
      return await api.delete(`/admin/assignments/${groupSubjectId}`);
    } catch (error) {
      console.log('Remove assignment endpoint not available');
      throw error;
    }
  },

  // Get assignment statistics
  getAssignmentStats: async () => {
    try {
      // Future endpoint for statistics
      return await api.get('/admin/assignment-stats');
    } catch (error) {
      console.log('Assignment stats endpoint not available');
      return { data: null };
    }
  }
};