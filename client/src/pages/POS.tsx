import React, { useState, useEffect, useRef, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import productService from '../services/productService';
import orderService from '../services/orderService';
import ProductCard from '../components/ProductCard';
import type { Product, Variant, CartItem } from '../types/product.types';

export const POS: React.FC = () => {
  const { user } = useAuth();
  const {
    items,
    subtotal,
    tax,
    total,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    clearCart,
  } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'digital_wallet'>('cash');
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search products on term change
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      setLoadingProducts(true);
      try {
        const data = await productService.getAll({ search: searchTerm });
        console.log('Fetched products data:', data.products); // Debugging line to check products data
        // Filter out inactive products
        setProducts(data.products.filter((p: Product) => p.isActive));
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoadingProducts(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Helper to trigger alert that vanishes after 5s
  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  }, []);

  // Add product to cart handler
  const handleProductAdd = useCallback((product: Product, variant: Variant) => {
    const cartItem: CartItem = {
      productId: product._id,
      sku: variant.sku,
      name: `${product.name} (${variant.size} / ${variant.color})`,
      unitPrice: variant.price,
      quantity: 1,
      discount: 0, // default no discount
    };
    addItem(cartItem);
  }, [addItem]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search input on "/" key
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Clear search input on "Escape" key
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }

      // Add first search result to cart on "Enter" inside search input
      if (
        e.key === 'Enter' &&
        document.activeElement === searchInputRef.current &&
        products.length > 0
      ) {
        e.preventDefault();
        const firstProduct = products[0];
        const activeVariants = firstProduct.variants.filter((v) => v.stock > 0);
        const selectedVariant = activeVariants.length > 0 ? activeVariants[0] : firstProduct.variants[0];

        if (selectedVariant && selectedVariant.stock > 0) {
          handleProductAdd(firstProduct, selectedVariant);
          setSearchTerm('');
          searchInputRef.current?.blur();
          showAlert('success', `Added ${firstProduct.name} (${selectedVariant.size}/${selectedVariant.color}) to cart`);
        } else {
          showAlert('error', `${firstProduct.name} is currently out of stock`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, handleProductAdd, showAlert]);


  // Submit checkout order to backend
  const handleCheckout = async () => {
    if (items.length === 0) {
      showAlert('error', 'Cart is empty. Add products before checking out.');
      return;
    }

    if (!user || !user.store) {
      showAlert('error', 'User session store mapping is missing. Cannot route order.');
      return;
    }

    setCheckoutPending(true);
    setAlert(null);

    const orderData = {
      items: items.map((i) => ({
        productId: i.productId,
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount,
      })),
      paymentMethod,
      store: user.store,
      taxRate: 0.18, // 18% tax rate
    };

    try {
      await orderService.create(orderData);
      clearCart();
      showAlert('success', 'Checkout successful! Order created and inventory updated.');
    } catch (err: unknown) {
      console.error('Checkout failed', err);
      // Optimistic UI: we do NOT clear the cart so the cashier can re-try or change payment.
      const axiosError = err as { response?: { data?: { message?: string } } };
      showAlert(
        'error',
        axiosError.response?.data?.message || 'Checkout failed. Terminal remains in current state.'
      );
    } finally {
      setCheckoutPending(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[calc(100vh-120px)] animate-fadeIn">
      {/* Alert Banner Container */}
      {alert && (
        <div
          className={`fixed top-18 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border transition-all duration-300 transform translate-y-0 ${alert.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-950/95 border-rose-500/30 text-rose-400'
            }`}
        >
          {alert.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-xs font-bold">{alert.message}</span>
        </div>
      )}

      {/* LEFT PANEL: PRODUCT SEARCH AND GRID */}
      <div className="flex-1 glass-panel border border-slate-800 rounded-2xl p-5 flex flex-col min-h-[500px]">
        {/* Search header with shortcut hints */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-extrabold text-white tracking-wide">Product Catalog</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono text-[9px]">
                /
              </kbd>
              <span>to focus</span>
              <span className="mx-1">&bull;</span>
              <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono text-[9px]">
                Enter
              </kbd>
              <span>to quick-add</span>
            </div>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, category, or scan barcode..."
              className="w-full bg-slate-900 border border-slate-800/90 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all duration-200"
            />
          </div>
        </div>

        {/* Product Cards Grid with scrollbar */}
        <div className="flex-1 overflow-y-auto pr-1 max-h-[600px]">
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-slate-500">Scanning active inventory...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
              <svg className="w-10 h-10 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-sm font-bold text-slate-400">No active products found</h3>
              <p className="text-[11px] text-slate-600 mt-1">Try modifying your search or contact your inventory manager.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAdd={(variant) => {
                    handleProductAdd(product, variant);
                    showAlert('success', `Added ${product.name} to cart`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CART & CHECKOUT ACTION */}
      <div className="w-full lg:w-96 glass-panel border border-slate-800 rounded-2xl p-5 flex flex-col min-h-[500px] justify-between">
        <div>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/80">
            <h2 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Active Cart
            </h2>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Item List Container */}
          <div className="overflow-y-auto max-h-[320px] pr-1 space-y-3 mb-4">
            {items.length === 0 ? (
              <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                <svg className="w-8 h-8 mx-auto text-slate-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-xs font-bold text-slate-500">Cart is empty</h3>
                <p className="text-[10px] text-slate-600 mt-0.5">Select a product variant on the left to add items.</p>
              </div>
            ) : (
              items.map((item) => {
                const lineTotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
                return (
                  <div
                    key={item.sku}
                    className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between gap-2.5 hover:border-slate-800/80 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{item.name}</h4>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {item.sku}</div>
                      </div>
                      <button
                        onClick={() => removeItem(item.sku)}
                        className="text-slate-500 hover:text-rose-500 cursor-pointer"
                        title="Remove Item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2.5 mt-1 border-t border-slate-800/60 pt-2 text-[11px]">
                      {/* Quantity Controller */}
                      <div className="flex items-center bg-slate-800 border border-slate-700/50 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="px-2 py-1 text-slate-400 hover:text-slate-200 font-black cursor-pointer active:scale-90"
                        >
                          -
                        </button>
                        <span className="px-2 text-slate-200 font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="px-2 py-1 text-slate-400 hover:text-slate-200 font-black cursor-pointer active:scale-90"
                        >
                          +
                        </button>
                      </div>

                      {/* Discount Input */}
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Disc%</span>
                        <input
                          type="number"
                          value={item.discount || 0}
                          onChange={(e) => updateDiscount(item.sku, parseInt(e.target.value) || 0)}
                          className="w-10 bg-slate-800 border border-slate-700/50 rounded text-center text-[10px] font-bold text-slate-300 py-0.5 focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="0"
                          max="100"
                        />
                      </div>

                      {/* Pricing Info */}
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] font-mono mr-1.5">
                          {item.quantity} x ${item.unitPrice.toFixed(2)}
                        </span>
                        <span className="text-white font-extrabold font-mono">${lineTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pricing Subtotal / Tax / Payment Method & Checkout */}
        <div className="border-t border-slate-800/80 pt-4 space-y-4">
          {/* Totals Summary */}
          <div className="space-y-2 text-xs font-semibold text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-200 font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax (18%)</span>
              <span className="text-slate-200 font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800/60">
              <span>Order Total</span>
              <span className="text-indigo-400 text-lg font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'credit', 'digital_wallet'] as const).map((method) => {
                const active = paymentMethod === method;
                return (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all duration-200 border cursor-pointer ${active
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                      }`}
                  >
                    {method.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || checkoutPending}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${items.length === 0
                ? 'bg-slate-800 text-slate-500 border border-slate-700/30 cursor-not-allowed'
                : checkoutPending
                  ? 'bg-indigo-600/70 text-white cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/10 text-white active:scale-[0.98]'
              }`}
          >
            {checkoutPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Complete Checkout (${total.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
