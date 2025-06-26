import api from './api';

export const paymentService = {
  // Get all payments with filtering
  getAllPayments: async (params = {}) => {
    console.log('Fetching payments with params:', params);
    try {
      const response = await api.get('/admin/payments', { params });
      console.log('Payments fetched successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  },

  // Get specific payment
  getPayment: async (paymentId) => {
    try {
      return await api.get(`/admin/payments/${paymentId}`);
    } catch (error) {
      console.error('Failed to get payment:', error);
      throw error;
    }
  },

  // Record a new payment
  recordPayment: async (paymentData) => {
    console.log('Recording payment:', paymentData);
    try {
      const response = await api.post('/admin/payments', paymentData);
      console.log('Payment recorded successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Payment recording failed:', error);
      throw error;
    }
  },

  // Update existing payment
  updatePayment: async (paymentId, paymentData) => {
    console.log('Updating payment:', paymentId, paymentData);
    try {
      const response = await api.put(`/admin/payments/${paymentId}`, paymentData);
      console.log('Payment updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Payment update failed:', error);
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (paymentId) => {
    console.log('Deleting payment:', paymentId);
    try {
      const response = await api.delete(`/admin/payments/${paymentId}`);
      console.log('Payment deleted successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Payment deletion failed:', error);
      throw error;
    }
  },

  // Get payment statistics (if backend supports it in the future)
  getStats: async () => {
    try {
      return await api.get('/admin/payment-stats');
    } catch (err) {
      console.log('Payment stats endpoint not available');
      return { data: null };
    }
  },

  // Update monthly payment status (if needed)
  updateMonthlyStatus: async (studentId, monthlyData) => {
    return await api.put('/admin/monthly-payment-status', {
      student_id: studentId,
      ...monthlyData
    });
  }
};