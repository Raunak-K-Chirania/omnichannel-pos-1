import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  addItem as addItemAction,
  removeItem as removeItemAction,
  updateQuantity as updateQuantityAction,
  updateDiscount as updateDiscountAction,
  clearCart as clearCartAction,
} from '../store/cartSlice';
import type { CartItem } from '../types/product.types';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isOnline } = useSelector((state: RootState) => state.cart);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity * (1 - item.discount / 100),
    0
  );
  const tax = subtotal * 0.18; // 18% tax rate
  const total = subtotal + tax;

  const addItem = (item: CartItem) => {
    dispatch(addItemAction(item));
  };

  const removeItem = (sku: string) => {
    dispatch(removeItemAction({ sku }));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    dispatch(updateQuantityAction({ sku, quantity }));
  };

  const updateDiscount = (sku: string, discount: number) => {
    dispatch(updateDiscountAction({ sku, discount }));
  };

  const clearCart = () => {
    dispatch(clearCartAction());
  };

  return {
    items,
    isOnline,
    subtotal,
    tax,
    total,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    clearCart,
  };
};

export default useCart;
