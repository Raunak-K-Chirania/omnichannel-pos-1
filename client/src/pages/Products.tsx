import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import productService from '../services/productService';
import type { Product, Variant } from '../types/product.types';

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [variants, setVariants] = useState<Array<Omit<Variant, 'sku'> & { sku?: string }>>([
    { size: 'M', color: 'Black', price: 29.99, stock: 50 }
  ]);
  const [submitPending, setSubmitPending] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll({ search });
      setProducts(data);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to retrieve products catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleAddVariantRow = () => {
    setVariants([...variants, { size: 'L', color: 'White', price: 29.99, stock: 25 }]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const updated = variants.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: value };
      }
      return v;
    });
    setVariants(updated);
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductCategory) return;
    
    setSubmitPending(true);
    setModalError(null);

    // Format variants to auto-generate SKUs if not provided
    const formattedVariants = variants.map((v) => {
      const sizeSlug = v.size.replace(/\s+/g, '').toUpperCase();
      const colorSlug = v.color.replace(/\s+/g, '').toUpperCase();
      const nameSlug = newProductName.substring(0, 3).replace(/\s+/g, '').toUpperCase();
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const generatedSku = `${nameSlug}-${sizeSlug}-${colorSlug}-${randomId}`;

      return {
        size: v.size,
        color: v.color,
        sku: v.sku || generatedSku,
        price: Number(v.price),
        stock: Number(v.stock),
      };
    });

    const productPayload = {
      name: newProductName,
      category: newProductCategory,
      description: newProductDesc,
      variants: formattedVariants,
      isActive: true,
      storeId: user?.store,
    };

    try {
      await productService.create(productPayload);
      setIsModalOpen(false);
      // Reset form
      setNewProductName('');
      setNewProductCategory('');
      setNewProductDesc('');
      setVariants([{ size: 'M', color: 'Black', price: 29.99, stock: 50 }]);
      fetchProducts(searchTerm);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setModalError(axiosError.response?.data?.message || 'Failed to create new product. Check your fields.');
    } finally {
      setSubmitPending(false);
    }
  };

  const isAuthorized = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Add Action */}
      <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">Browse store listings, categories, and manage item variants.</p>
        </div>

        {isAuthorized && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow shadow-indigo-600/10 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter catalog by name, SKU, color or category..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
        />
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Retrieving catalog items...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-850 rounded-xl bg-slate-900/10">
          No products matched your parameters or exist in this store.
        </div>
      ) : (
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Active Variants</th>
                  <th className="p-4">Stock Levels</th>
                  <th className="p-4">Price Range</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-medium text-slate-300">
                {products.map((product) => {
                  const prices = product.variants.map((v) => v.price);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                  const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

                  return (
                    <tr key={product._id} className="hover:bg-slate-800/15 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-200">{product.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 max-w-[280px]">
                          {product.description || 'No description provided.'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((v) => (
                            <span
                              key={v.sku}
                              className="bg-indigo-950/40 border border-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-semibold"
                              title={`SKU: ${v.sku}`}
                            >
                              {v.size} / {v.color}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-mono font-bold ${totalStock <= 10 ? 'text-rose-400 font-extrabold' : 'text-slate-200'}`}>
                          {totalStock} units
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-white">
                        {minPrice === maxPrice
                          ? `$${minPrice.toFixed(2)}`
                          : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            product.isActive
                              ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400'
                              : 'bg-slate-950/80 border border-slate-700/20 text-slate-550'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-850 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-base font-extrabold text-white tracking-wide">Catalog Creator Terminal</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-350 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProductSubmit} className="p-6 space-y-5">
              {modalError && (
                <div className="bg-rose-950/80 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{modalError}</span>
                </div>
              )}

              {/* Core Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Vintage Leather Jacket"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-650"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    placeholder="e.g. Apparel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-655"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Description
                </label>
                <textarea
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="e.g. High-quality premium leather jackets with standard fits..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-650 resize-none"
                />
              </div>

              {/* Dynamic Variants section */}
              <div>
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-800/80">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                    Product Variants
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-[10px] font-bold text-indigo-455 hover:text-indigo-400 cursor-pointer flex items-center gap-1"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex gap-2.5 items-end bg-slate-900/20 p-2.5 rounded-xl border border-slate-850/60">
                      <div className="w-16">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Size</label>
                        <input
                          type="text"
                          required
                          value={variant.size}
                          onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                          placeholder="M"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Color</label>
                        <input
                          type="text"
                          required
                          value={variant.color}
                          onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                          placeholder="Black"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="w-20">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Price</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-center font-mono focus:outline-none"
                        />
                      </div>

                      <div className="w-20">
                        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Stock</label>
                        <input
                          type="number"
                          required
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-center font-mono focus:outline-none"
                        />
                      </div>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(index)}
                          className="text-slate-550 hover:text-rose-500 py-1 px-1 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-850 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Catalog Item</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
