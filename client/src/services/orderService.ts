import api from './api';

const isDemoMode = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return user && user.token === 'mock-jwt-token-bypass-mode';
    } catch {
      // ignore json parsing errors
    }
  }
  return false;
};

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
    if (isDemoMode()) {
      const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
      const newOrder = {
        _id: `mock-order-${Date.now()}`,
        createdAt: new Date().toISOString(),
        cashier: { name: "Demo Cashier" },
        items: data.items,
        paymentMethod: data.paymentMethod,
        total: data.items.reduce((sum: number, item) => sum + (item.unitPrice * item.quantity), 0) * 1.18,
        status: "Completed",
      };
      demoOrders.unshift(newOrder);
      localStorage.setItem('demo_orders', JSON.stringify(demoOrders));
      return { success: true, data: newOrder };
    }
    const response = await api.post('/orders', data);
    return response.data;
  },

  async getAll(storeId?: string) {
    if (isDemoMode()) {
      return JSON.parse(localStorage.getItem('demo_orders') || '[]');
    }
    const response = await api.get('/orders', {
      params: storeId ? { store: storeId } : {},
    });
    return response.data.data || [];
  },
};

export default orderService;
