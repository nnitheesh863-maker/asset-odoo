import api from './api';

export const maintenanceService = {
  async getAll(params) {
    const response = await api.get('/maintenance', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.put(`/maintenance/${id}/status`, { status });
    return response.data;
  },

  async assign(id, technicianId) {
    const response = await api.put(`/maintenance/${id}/assign`, { technicianId });
    return response.data;
  },

  async getStats() {
    const response = await api.get('/maintenance/stats');
    return response.data;
  },

  async getOverdue() {
    const response = await api.get('/maintenance/overdue');
    return response.data;
  },
};

export default maintenanceService;
