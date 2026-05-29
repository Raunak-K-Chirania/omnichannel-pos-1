import api from './api';
import type { Product } from '../types/product.types';

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

const getDemoProducts = () => {
  const stored = localStorage.getItem('demo_products');
  if (stored) return JSON.parse(stored);

  const initial = [
    {
      _id: "mock-prod-1",
      name: "Classic Denim Jacket (Demo)",
      category: "Apparel",
      description: "Timeless classic denim jacket with premium wash.",
      isActive: true,
      variants: [
        { size: "M", color: "Blue", sku: "MOCK-APP-DEN-JAC-M-BLU", price: 79.99, stock: 25 },
        { size: "L", color: "Blue", sku: "MOCK-APP-DEN-JAC-L-BLU", price: 79.99, stock: 15 },
      ],
    },
    {
      _id: "mock-prod-2",
      name: "Wireless ANC Headphones (Demo)",
      category: "Electronics",
      description: "High-fidelity sound with active noise cancellation.",
      isActive: true,
      variants: [
        { size: "One Size", color: "Black", sku: "MOCK-ELE-WIR-HP-OS-BLK", price: 149.99, stock: 30 },
      ],
    },
  ];
  localStorage.setItem('demo_products', JSON.stringify(initial));
  return initial;
};

const isDemoMode = () => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return user && user.token === 'mock-jwt-token-bypass-mode';
    } catch {}
  }
  return false;
};

const getDemoProducts = () => {
  const stored = localStorage.getItem('demo_products');
  if (stored) return JSON.parse(stored);

  const initial = [
    {
      _id: "mock-prod-1",
      name: "Classic Denim Jacket (Demo)",
      category: "Apparel",
      description: "Timeless classic denim jacket with premium wash.",
      isActive: true,
      variants: [
        { size: "M", color: "Blue", sku: "MOCK-APP-DEN-JAC-M-BLU", price: 79.99, stock: 25 },
        { size: "L", color: "Blue", sku: "MOCK-APP-DEN-JAC-L-BLU", price: 79.99, stock: 15 },
      ],
    },
    {
      _id: "mock-prod-2",
      name: "Wireless ANC Headphones (Demo)",
      category: "Electronics",
      description: "High-fidelity sound with active noise cancellation.",
      isActive: true,
      variants: [
        { size: "One Size", color: "Black", sku: "MOCK-ELE-WIR-HP-OS-BLK", price: 149.99, stock: 30 },
      ],
    },
  ];
  localStorage.setItem('demo_products', JSON.stringify(initial));
  return initial;
};

export const productService = {
  async getAll(params?: { search?: string; category?: string; store?: string }) {
    if (isDemoMode()) {
      let prods = getDemoProducts();
      if (params?.search) {
        prods = prods.filter((p: Product) =>
          p.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          p.category.toLowerCase().includes(params.search!.toLowerCase())
        );
      }
      return prods;
    }
    const response = await api.get('/products', { params });
    return response.data.products || [];
  },

  async getById(id: string) {
    if (isDemoMode()) {
      return getDemoProducts().find((p: Product) => p._id === id);
    }
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: Record<string, unknown>) {
    if (isDemoMode()) {
      const prods = getDemoProducts();
      const newProd = {
        _id: `mock-prod-${Date.now()}`,
        name: data.name,
        category: data.category,
        description: data.description,
        variants: data.variants,
        isActive: true,
        image: data.image || '',
      };
      prods.push(newProd);
      localStorage.setItem('demo_products', JSON.stringify(prods));
      return newProd;
    }
    const response = await api.post('/products', data);
    return response.data;
  },

  async update(id: string, data: Record<string, unknown>) {
    if (isDemoMode()) {
      let prods = getDemoProducts();
      prods = prods.map((p: Product) => (p._id === id ? { ...p, ...data } : p));
      localStorage.setItem('demo_products', JSON.stringify(prods));
      return { success: true };
    }
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    if (isDemoMode()) {
      let prods = getDemoProducts();
      prods = prods.filter((p: Product) => p._id !== id);
      localStorage.setItem('demo_products', JSON.stringify(prods));
      return { success: true };
    }
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
