import api from './api';

export const departmentService = {
  async getAll(params) {
    const response = await api.get('/departments', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/departments', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  async getStats(id) {
    const response = await api.get(`/departments/${id}/stats`);
    return response.data;
  },
};

export default departmentService;
