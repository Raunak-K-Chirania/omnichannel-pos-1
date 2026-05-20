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
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number; // percentage (e.g. 10 for 10% discount)
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
