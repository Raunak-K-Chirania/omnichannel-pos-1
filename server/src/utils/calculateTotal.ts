interface Item {
  unitPrice: number;
  quantity: number;
  discount: number;
}

export const calculateTotal = (items: Item[], taxRate: number = 0.18) => {
  const subtotal = items.reduce((acc, item) => {
    const itemTotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
    return acc + itemTotal;
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};