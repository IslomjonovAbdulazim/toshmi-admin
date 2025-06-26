import api from './api';

export const assignmentService = {
  // Get all assignments
  getAllAssignments: async () => {
    console.log('Fetching all assignments...');
    try {
      const response = await api.get('/admin/assignments');
      console.log('Assignments fetched:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to get assignments:', error);
      throw error;
    }
  },

  // Get unassigned subjects (subjects without teachers)
  getUnassignedSubjects: async () => {
    try {
      const response = await api.get('/admin/assignments/unassigned');
      console.log('Unassigned subjects:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to get unassigned subjects:', error);
      throw error;
    }
  },

  // Create new assignment (assign teacher to group-subject)
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

  // Remove assignment completely
  removeAssignment: async (groupSubjectId) => {
    console.log('Removing assignment:', groupSubjectId);
    try {
      const response = await api.delete(`/admin/assignments/${groupSubjectId}`);
      console.log('Assignment removed:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to remove assignment:', error);
      throw error;
    }
  },

  // Remove assignment by group and subject IDs
  removeAssignmentByParams: async (groupId, subjectId) => {
    console.log('Removing assignment by params:', { groupId, subjectId });
    try {
      const response = await api.delete('/admin/assignments/by-params', {
        data: { group_id: groupId, subject_id: subjectId }
      });
      console.log('Assignment removed by params:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to remove assignment by params:', error);
      throw error;
    }
  },

  // Change teacher for existing assignment
  changeTeacher: async (groupSubjectId, newTeacherId) => {
    console.log('Changing teacher:', { groupSubjectId, newTeacherId });
    try {
      const response = await api.put(`/admin/assignments/${groupSubjectId}/teacher`, {
        new_teacher_id: newTeacherId
      });
      console.log('Teacher changed:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to change teacher:', error);
      throw error;
    }
  },

  // Change subject for existing assignment
  changeSubject: async (groupSubjectId, newSubjectId) => {
    console.log('Changing subject:', { groupSubjectId, newSubjectId });
    try {
      const response = await api.put(`/admin/assignments/${groupSubjectId}/subject`, {
        new_subject_id: newSubjectId
      });
      console.log('Subject changed:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to change subject:', error);
      throw error;
    }
  },

  // Unassign teacher (keep subject but remove teacher)
  unassignTeacher: async (groupSubjectId) => {
    console.log('Unassigning teacher:', groupSubjectId);
    try {
      const response = await api.put(`/admin/assignments/${groupSubjectId}/unassign-teacher`);
      console.log('Teacher unassigned:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to unassign teacher:', error);
      throw error;
    }
  },

  // Helper: Get assignment statistics
  getAssignmentStats: (assignments) => {
    const stats = {
      totalAssignments: assignments.length,
      assignedCount: assignments.filter(a => a.has_teacher).length,
      unassignedCount: assignments.filter(a => !a.has_teacher).length,
      activeTeachers: new Set(
        assignments
          .filter(a => a.teacher && a.teacher.is_active)
          .map(a => a.teacher.id)
      ).size,
      groupsCovered: new Set(assignments.map(a => a.group.id)).size,
      subjectsCovered: new Set(assignments.map(a => a.subject.id)).size
    };

    // Group by academic year
    const byYear = assignments.reduce((acc, assignment) => {
      const year = assignment.group.academic_year;
      if (!acc[year]) acc[year] = 0;
      acc[year]++;
      return acc;
    }, {});

    stats.byAcademicYear = byYear;
    return stats;
  }
};