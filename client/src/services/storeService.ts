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

const getDemoStores = (): Array<{ _id: string; name: string; location: string; isActive: boolean; currency?: string }> => {
  const stored = localStorage.getItem('demo_stores');
  if (stored) return JSON.parse(stored);

  const initial = [
    {
      _id: "mock-store-101",
      name: "Flagship Store (Demo)",
      location: "New York, NY",
      isActive: true,
      currency: "USD",
    },
    {
      _id: "mock-store-102",
      name: "Secondary Store (Demo)",
      location: "Los Angeles, CA",
      isActive: true,
      currency: "USD",
    },
  ];
  localStorage.setItem('demo_stores', JSON.stringify(initial));
  return initial;
};

export const storeService = {
  async getAll() {
    if (isDemoMode()) {
      return getDemoStores();
    }
    const response = await api.get('/stores');
    return response.data.data || [];
  },

  async create(data: { name: string; location: string; isActive?: boolean }) {
    if (isDemoMode()) {
      const stores = getDemoStores();
      const newStore = {
        _id: `mock-store-${Date.now()}`,
        name: data.name,
        location: data.location,
        isActive: data.isActive !== undefined ? data.isActive : true,
      };
      stores.push(newStore);
      localStorage.setItem('demo_stores', JSON.stringify(stores));
      return { success: true, data: newStore };
    }
    const response = await api.post('/stores', data);
    return response.data;
  },

  async update(id: string, data: { name?: string; location?: string; isActive?: boolean }) {
    if (isDemoMode()) {
      let stores = getDemoStores();
      stores = stores.map(s => (s._id === id ? { ...s, ...data } : s));
      localStorage.setItem('demo_stores', JSON.stringify(stores));
      return { success: true };
    }
    const response = await api.put(`/stores/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    if (isDemoMode()) {
      let stores = getDemoStores();
      stores = stores.filter(s => s._id !== id);
      localStorage.setItem('demo_stores', JSON.stringify(stores));
      return { success: true };
    }
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  },
};

export default storeService;
