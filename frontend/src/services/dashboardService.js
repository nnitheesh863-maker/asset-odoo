import api from './api';

export const dashboardService = {
  async getAdminDashboard() {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  async getManagerDashboard() {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },

  async getEmployeeDashboard() {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },
};

export default dashboardService;
