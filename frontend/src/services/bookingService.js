import api from './api';

export const bookingService = {
  async getAll(params) {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async approve(id) {
    const response = await api.post(`/bookings/${id}/approve`);
    return response.data;
  },

  async reject(id) {
    const response = await api.post(`/bookings/${id}/reject`);
    return response.data;
  },

  async cancel(id) {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  },

  async getAvailable(params) {
    const response = await api.get('/bookings/available', { params });
    return response.data;
  },

  async getMyBookings(params) {
    const response = await api.get('/bookings/my', { params });
    return response.data;
  },
};

export default bookingService;
