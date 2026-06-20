import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import productService from '../services/productService';
import api, { getImageUrl } from '../services/api';
import type { Product, Variant } from '../types/product.types';

export const Products: React.FC = () => {
  const { user } = useAuth();
  const currencySymbol = user?.currency === 'INR' ? '₹' : '$';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create / Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [imagePath, setImagePath] = useState<string>('');
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [variants, setVariants] = useState<Array<Omit<Variant, 'sku'> & { sku?: string }>>([
    { size: 'M', color: 'Black', price: 29.99, stock: 50 }
  ]);
  const [submitPending, setSubmitPending] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async (search?: string, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await productService.getAll({ search, store: user?.store });
      setProducts(data || []);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to retrieve products catalog.');
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [user?.store]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(searchTerm, false);
    }, 300);

    // Setup real-time polling every 5 seconds
    const interval = setInterval(() => {
      fetchProducts(searchTerm, true);
    }, 5000);

    return () => {
      clearTimeout(delayDebounce);
      clearInterval(interval);
    };
  }, [searchTerm, fetchProducts]);

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setNewProductName('');
    setNewProductCategory('');
    setNewProductDesc('');
    setImagePath('');
    setVariants([{ size: 'M', color: 'Black', price: 29.99, stock: 50 }]);
    setModalError(null);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductCategory(product.category);
    setNewProductDesc(product.description || '');
    setVariants(product.variants);
    setImagePath(product.image || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      return;
    }
    setError(null);
    try {
      await productService.delete(id);
      fetchProducts(searchTerm);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setModalError('Only image files of type JPG, JPEG, PNG, or WEBP are allowed.');
      return;
    }

    // Validate size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setModalError('Maximum image size is 5MB.');
      return;
    }

    setModalError(null);
    setImageUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/products/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.url) {
        setImagePath(response.data.url);
      }
    } catch (err: unknown) {
      console.error('Image upload failed', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setModalError(axiosError.response?.data?.message || 'Failed to upload product image.');
    } finally {
      setImageUploading(false);
    }
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
      store: user?.store,
      image: imagePath,
    };

    try {
      if (editingProduct) {
        await productService.update(editingProduct._id, productPayload);
      } else {
        await productService.create(productPayload);
      }
      handleCloseModal();
      fetchProducts(searchTerm);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setModalError(
        axiosError.response?.data?.message ||
          `Failed to ${editingProduct ? 'update' : 'create'} product. Check your fields.`
      );
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
            onClick={() => {
              handleCloseModal();
              setIsModalOpen(true);
            }}
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
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
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
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-800 bg-slate-950 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-center text-slate-600 flex-shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-slate-200">{product.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 max-w-[200px]">
                              {product.description || 'No description provided.'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
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
                          ? `${currencySymbol}${minPrice.toFixed(2)}`
                          : `${currencySymbol}${minPrice.toFixed(2)} - ${currencySymbol}${maxPrice.toFixed(2)}`}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              product.isActive
                                ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-950/80 border border-slate-700/20 text-slate-500'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Archived'}
                          </span>
                          {isAuthorized && (
                            <button
                              onClick={() => handleEditClick(product)}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 border border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-lg cursor-pointer transition-all"
                            >
                              Edit
                            </button>
                          )}
                          {isAuthorized && (
                            <button
                              onClick={() => handleDeleteProduct(product._id, product.name)}
                              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 border border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-lg cursor-pointer transition-all animate-fadeIn"
                            >
                              Delete
                            </button>
                          )}
                        </div>
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
          <div className="glass-panel border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {editingProduct ? 'Catalog Item Editor' : 'Catalog Creator Terminal'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-600"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-600"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              {/* Product Image Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                    Product Image (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-indigo-600 file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 file:cursor-pointer"
                    />
                    {imageUploading && (
                      <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[9px] text-slate-500 font-bold">Uploading...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">Supports JPG, JPEG, PNG, WEBP (Max 5MB)</p>
                </div>

                <div className="flex flex-col items-center justify-center bg-slate-950/40 border border-slate-800 rounded-xl p-3 h-24">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 block">Image Preview</span>
                  {imagePath ? (
                    <div className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-800">
                      <img
                        src={getImageUrl(imagePath)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePath('')}
                        className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-rose-400 transition-opacity duration-200 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[9px] font-medium">No Image Uploaded</span>
                    </div>
                  )}
                </div>
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
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex gap-2.5 items-end bg-slate-900/20 p-2.5 rounded-xl border border-slate-800/60">
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
                          className="text-slate-500 hover:text-rose-500 py-1 px-1 cursor-pointer"
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
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
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
                      <span>{editingProduct ? 'Saving...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Save Changes' : 'Create Catalog Item'}</span>
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
