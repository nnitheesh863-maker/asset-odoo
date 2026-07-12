import api from './api';

export const assetService = {
  async getAll(params) {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/assets', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/assets/stats');
    return response.data;
  },

  async getTimeline(id) {
    const response = await api.get(`/assets/${id}/timeline`);
    return response.data;
  },

  async getQRCode(id) {
    const response = await api.get(`/assets/${id}/qr-code`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default assetService;
