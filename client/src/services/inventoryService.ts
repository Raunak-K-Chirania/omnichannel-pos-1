import api from './api';

export const inventoryService = {
  async getAll(params?: { store?: string }) {
    const response = await api.get('/inventory', { params });
    return response.data.data || [];
  },

  async getLowStock() {
    const response = await api.get('/inventory/low-stock');
    return response.data.data || [];
  },

  async updateStock(id: string, data: { quantity: number; reorderPoint?: number }) {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },
};

export default inventoryService;
