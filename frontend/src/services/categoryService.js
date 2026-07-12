import api from './api';

export const categoryService = {
  async getAll(params) {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
