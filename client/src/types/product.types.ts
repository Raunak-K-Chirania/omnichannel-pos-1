export interface Variant {
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  variants: Variant[];
  isActive: boolean;
  store?: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number; // percentage (e.g. 10 for 10% discount)
  image?: string;
}

export interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    category: string;
  };
  store: {
    _id: string;
    name: string;
  };
  sku: string;
  quantity: number;
  reorderPoint: number;
  lastUpdated: string;
}

export interface Store {
  _id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

