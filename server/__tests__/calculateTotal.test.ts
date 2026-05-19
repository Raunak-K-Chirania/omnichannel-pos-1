import { describe, it, expect } from 'vitest';
import { calculateTotal } from '../src/utils/calculateTotal';

describe('calculateTotal utility', () => {
  it('should calculate total with no discount correctly', () => {
    const items = [{ unitPrice: 100, quantity: 2, discount: 0 }];
    const result = calculateTotal(items, 0.18);
    expect(result.subtotal).toBe(200);
    expect(result.tax).toBe(36);
    expect(result.total).toBe(236);
  });

  it('should calculate total with 10% discount correctly', () => {
    const items = [{ unitPrice: 100, quantity: 2, discount: 10 }];
    const result = calculateTotal(items, 0.18);
    expect(result.subtotal).toBe(180);
    expect(result.tax).toBe(32.4);
    expect(result.total).toBe(212.4);
  });

  it('should calculate total for multiple items with different discounts', () => {
    const items = [
      { unitPrice: 100, quantity: 1, discount: 10 },
      { unitPrice: 200, quantity: 2, discount: 20 },
    ];
    // item 1: 100 * 1 * 0.9 = 90
    // item 2: 200 * 2 * 0.8 = 320
    // subtotal = 410
    // tax = 410 * 0.18 = 73.8
    // total = 483.8
    const result = calculateTotal(items, 0.18);
    expect(result.subtotal).toBe(410);
    expect(result.tax).toBe(73.8);
    expect(result.total).toBe(483.8);
  });

  it('should handle zero tax rate', () => {
    const items = [{ unitPrice: 100, quantity: 2, discount: 0 }];
    const result = calculateTotal(items, 0);
    expect(result.subtotal).toBe(200);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(200);
  });
});
