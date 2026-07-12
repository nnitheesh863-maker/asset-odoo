import api from './api';

export const reportService = {
  async getAssetReport(params) {
    const response = await api.get('/reports/assets', { params });
    return response.data;
  },

  async getMaintenanceReport(params) {
    const response = await api.get('/reports/maintenance', { params });
    return response.data;
  },

  async getAllocationReport(params) {
    const response = await api.get('/reports/allocations', { params });
    return response.data;
  },

  async getDepartmentReport(id) {
    const response = await api.get(`/reports/departments/${id}`);
    return response.data;
  },

  async getCostReport(params) {
    const response = await api.get('/reports/costs', { params });
    return response.data;
  },

  async getUtilizationReport() {
    const response = await api.get('/reports/utilization');
    return response.data;
  },

  async exportExcel(type, params) {
    const response = await api.get(`/reports/export/${type}/excel`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  async exportPDF(type, params) {
    const response = await api.get(`/reports/export/${type}/pdf`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportService;
