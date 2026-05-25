import api from './api';

export const productService = {
  async getAll(params?: { search?: string; category?: string; store?: string }) {
    const response = await api.get('/products', { params });
    return response.data.products || [];
  },

  async getById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: Record<string, unknown>) {
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
