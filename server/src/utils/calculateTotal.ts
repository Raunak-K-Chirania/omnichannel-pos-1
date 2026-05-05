interface CartItem {
  unitPrice: number;
  quantity: number;
  discount?: number;
}

interface TotalResult {
  subtotal: number;
  tax: number;
  total: number;
}

const calculateTotal = (items: CartItem[], taxRate: number = 0.18): TotalResult => {
  const subtotal = items.reduce((sum, item) => {
    const discounted = item.unitPrice * (1 - (item.discount || 0) / 100);
    return sum + discounted * item.quantity;
  }, 0);

  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  return { subtotal: parseFloat(subtotal.toFixed(2)), tax, total };
};

export default calculateTotal;
