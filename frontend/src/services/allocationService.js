import api from './api';

export const allocationService = {
  async getAll(params) {
    const response = await api.get('/allocations', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/allocations/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/allocations', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/allocations/${id}`, data);
    return response.data;
  },

  async returnAsset(id) {
    const response = await api.post(`/allocations/${id}/return`);
    return response.data;
  },

  async getOverdue() {
    const response = await api.get('/allocations/overdue');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/allocations/stats');
    return response.data;
  },
};

export default allocationService;
