import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../types/product.types';

export interface CartState {
  items: CartItem[];
  isOnline: boolean;
}

const initialState: CartState = {
  items: [],
  isOnline: navigator.onLine, // Initial state set using the browser's current status
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.sku === action.payload.sku
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<{ sku: string }>) => {
      state.items = state.items.filter((item) => item.sku !== action.payload.sku);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ sku: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.sku === action.payload.sku);
      if (item) {
        // Clamp minimum quantity to 1
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    updateDiscount: (
      state,
      action: PayloadAction<{ sku: string; discount: number }>
    ) => {
      const item = state.items.find((i) => i.sku === action.payload.sku);
      if (item) {
        // Clamp discount between 0 and 100%
        item.discount = Math.min(100, Math.max(0, action.payload.discount));
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  updateDiscount,
  clearCart,
  setOnlineStatus,
} = cartSlice.actions;

export default cartSlice.reducer;
