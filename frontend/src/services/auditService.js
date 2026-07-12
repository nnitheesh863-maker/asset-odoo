import api from './api';

export const auditService = {
  async getCycles(params) {
    const response = await api.get('/audits', { params });
    return response.data;
  },

  async getCycleById(id) {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },

  async createCycle(data) {
    const response = await api.post('/audits', data);
    return response.data;
  },

  async createItem(data) {
    const response = await api.post('/audits/items', data);
    return response.data;
  },

  async updateItem(id, data) {
    const response = await api.put(`/audits/items/${id}`, data);
    return response.data;
  },

  async completeCycle(id) {
    const response = await api.post(`/audits/${id}/complete`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/audits/stats');
    return response.data;
  },

  async getDiscrepancies(cycleId) {
    const response = await api.get(`/audits/${cycleId}/discrepancies`);
    return response.data;
  },
};

export default auditService;
