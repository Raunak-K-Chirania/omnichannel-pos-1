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

export const inventoryService = {
  async getAll(params?: { store?: string }) {
    if (isDemoMode()) {
      return [
        {
          _id: "mock-inv-1",
          product: { _id: "mock-prod-1", name: "Classic Denim Jacket (Demo)", category: "Apparel" },
          store: { _id: "mock-store-101", name: "Flagship Store (Demo)" },
          sku: "MOCK-APP-DEN-JAC-M-BLU",
          quantity: 25,
          reorderPoint: 10,
          lastUpdated: new Date().toISOString(),
        },
        {
          _id: "mock-inv-2",
          product: { _id: "mock-prod-1", name: "Classic Denim Jacket (Demo)", category: "Apparel" },
          store: { _id: "mock-store-101", name: "Flagship Store (Demo)" },
          sku: "MOCK-APP-DEN-JAC-L-BLU",
          quantity: 5,
          reorderPoint: 10,
          lastUpdated: new Date().toISOString(),
        },
        {
          _id: "mock-inv-3",
          product: { _id: "mock-prod-2", name: "Wireless ANC Headphones (Demo)", category: "Electronics" },
          store: { _id: "mock-store-101", name: "Flagship Store (Demo)" },
          sku: "MOCK-ELE-WIR-HP-OS-BLK",
          quantity: 30,
          reorderPoint: 10,
          lastUpdated: new Date().toISOString(),
        },
      ];
    }
    const response = await api.get('/inventory', { params });
    return response.data.data || [];
  },

  async getLowStock(params?: { store?: string }) {
    if (isDemoMode()) {
      const demoInv = [
        {
          _id: "mock-inv-2",
          product: { _id: "mock-prod-1", name: "Classic Denim Jacket (Demo)", category: "Apparel" },
          store: { _id: "mock-store-101", name: "Flagship Store (Demo)" },
          sku: "MOCK-APP-DEN-JAC-L-BLU",
          quantity: 5,
          reorderPoint: 10,
          lastUpdated: new Date().toISOString(),
        },
      ];
      if (params?.store) {
        return demoInv.filter((item: any) => item.store._id === params.store);
      }
      return demoInv;
    }
    const response = await api.get('/inventory/low-stock', { params });
    return response.data.data || [];
  },

  async updateStock(id: string, data: { quantity: number; reorderPoint?: number }) {
    if (isDemoMode()) {
      return { success: true, message: "Stock updated successfully in demo mode." };
    }
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },
};

export default inventoryService;
