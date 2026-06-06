import React, { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService';
import { getImageUrl } from '../services/api';
import type { Product } from '../types/product.types';

export const CustomerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Selected Product for Details Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products catalog
  const fetchProducts = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll({ search }) as Product[];
      const activeProducts = (data || []).filter((p: Product) => p.isActive !== false);
      setProducts(activeProducts);

      // Extract unique categories dynamically
      const uniqueCats: string[] = ['All', ...Array.from(new Set(activeProducts.map((p: Product) => p.category)))];
      setCategories(uniqueCats);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to retrieve product catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchProducts]);

  // Filter products by selected category
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">Browse available items, categories, and real-time inventory counts.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800/60">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${
                  active
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="bg-rose-950/80 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Retrieving catalog items...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          No products found matching your description.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const prices = product.variants.map((v) => v.price);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
            const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

            return (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="glass-card rounded-2xl border border-slate-800 p-4 flex flex-col justify-between gap-3 cursor-pointer hover:border-slate-700/80 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 group"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 mb-3 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center gap-1">
                        <svg className="w-8 h-8 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xs font-black text-slate-200 line-clamp-1 uppercase group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <span className="bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 min-h-[28px]">
                    {product.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-bold text-slate-500">Price</span>
                    <span className="text-xs font-extrabold font-mono text-indigo-400">
                      {minPrice === maxPrice
                        ? `$${minPrice.toFixed(2)}`
                        : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[8px] uppercase font-bold text-slate-500">Stock</span>
                    <span
                      className={`text-[9px] font-bold font-mono ${
                        totalStock <= 0
                          ? 'text-rose-500 font-black'
                          : totalStock <= 10
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {totalStock <= 0 ? 'Out of stock' : `${totalStock} units`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRODUCT DETAILS OVERLAY MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
                  {selectedProduct.category} Catalog Listing
                </span>
                <h2 className="text-base font-extrabold text-white tracking-wide mt-0.5">
                  {selectedProduct.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Panel: Image */}
                <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 flex items-center justify-center flex-shrink-0">
                  {selectedProduct.image ? (
                    <img
                      src={getImageUrl(selectedProduct.image)}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center gap-1.5">
                      <svg className="w-12 h-12 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">No Image Attached</span>
                    </div>
                  )}
                </div>

                {/* Right Panel: Info and Description */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Description</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {selectedProduct.description || 'No description provided for this catalog listing.'}
                    </p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800/60 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Variants</span>
                      <span className="text-slate-300 font-bold">{selectedProduct.variants.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Stock Level</span>
                      <span className="text-slate-300 font-bold font-mono">
                        {selectedProduct.variants.reduce((sum, v) => sum + (v.stock || 0), 0)} units
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variants Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
                  Product Variations & Options
                </h3>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/30 font-bold text-slate-500">
                        <th className="p-3">SKU</th>
                        <th className="p-3">Size / Color</th>
                        <th className="p-3 text-right">Stock</th>
                        <th className="p-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-medium text-slate-300">
                      {selectedProduct.variants.map((variant) => (
                        <tr key={variant.sku} className="hover:bg-slate-800/10">
                          <td className="p-3 font-mono text-slate-400">{variant.sku}</td>
                          <td className="p-3">
                            {variant.size} / {variant.color}
                          </td>
                          <td className="p-3 text-right">
                            <span className={variant.stock <= 0 ? 'text-rose-400 font-bold' : ''}>
                              {variant.stock <= 0 ? 'Out of stock' : `${variant.stock} units`}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-white">
                            ${variant.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 flex justify-end bg-slate-900/20">
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow cursor-pointer active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;
