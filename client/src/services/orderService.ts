import api from './api';

export const orderService = {
  async create(data: {
    items: Array<{
      productId: string;
      sku: string;
      name: string;
      quantity: number;
      unitPrice: number;
      discount: number;
    }>;
    paymentMethod: 'cash' | 'credit' | 'digital_wallet';
    store: string;
    taxRate?: number;
  }) {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async getAll(storeId?: string) {
    const response = await api.get('/orders', {
      params: storeId ? { store: storeId } : {},
    });
    return response.data.data || [];
  },
};

export default orderService;
