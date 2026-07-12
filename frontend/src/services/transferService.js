import api from './api';

export const transferService = {
  async getAll(params) {
    const response = await api.get('/transfers', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/transfers', data);
    return response.data;
  },

  async approve(id) {
    const response = await api.post(`/transfers/${id}/approve`);
    return response.data;
  },

  async reject(id) {
    const response = await api.post(`/transfers/${id}/reject`);
    return response.data;
  },
};

export default transferService;
