import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { getImageUrl } from '../services/api';
import type { Product } from '../types/product.types';

export const CustomerProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getById(id);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found in this store catalog.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 animate-fadeIn">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-500">Loading product catalog details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-16 text-center animate-fadeIn">
        <div className="bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl inline-flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error || 'Catalog detail fetch error.'}</span>
        </div>
        <div>
          <button
            onClick={() => navigate('/products')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const prices = product.variants.map((v) => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button and page title */}
      <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Back to Products"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">
              {product.category}
            </span>
            <h1 className="text-xl font-extrabold text-white mt-0.5">{product.name}</h1>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Side: Product Image Card */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 flex items-center justify-center bg-slate-950/40 min-h-[300px]">
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="max-h-[350px] object-contain rounded-2xl border border-slate-800/80 bg-slate-950"
            />
          ) : (
            <div className="text-slate-600 flex flex-col items-center gap-2">
              <svg className="w-16 h-16 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">No Image Uploaded</span>
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Category Tag</span>
              <div className="mt-1">
                <span className="bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                  {product.category}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Product Description</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {product.description || 'No description has been assigned to this catalog product entry.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl font-semibold">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Price Range</span>
                <span className="text-sm font-extrabold font-mono text-indigo-400">
                  {minPrice === maxPrice
                    ? `$${minPrice.toFixed(2)}`
                    : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Total Quantity</span>
                <span className={`text-sm font-extrabold font-mono ${totalStock <= 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {totalStock <= 0 ? 'Out of Stock' : `${totalStock} units`}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-4 flex justify-between items-center text-[10px] text-slate-500">
            <span>Product Catalog Item: {product._id}</span>
            <span>Real-time Sync Active</span>
          </div>
        </div>
      </div>

      {/* Product Variations Table */}
      <div className="glass-panel border border-slate-800 rounded-3xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3.5">
          Available Product Variations
        </h3>
        
        <div className="border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30 font-bold text-slate-500">
                <th className="p-4">SKU Code</th>
                <th className="p-4">Size Option</th>
                <th className="p-4">Color Profile</th>
                <th className="p-4 text-center">Stock Count</th>
                <th className="p-4 text-right">Price (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-medium text-slate-300">
              {product.variants.map((v) => (
                <tr key={v.sku} className="hover:bg-slate-800/10">
                  <td className="p-4 font-mono text-slate-400">{v.sku}</td>
                  <td className="p-4">{v.size}</td>
                  <td className="p-4">{v.color}</td>
                  <td className="p-4 text-center">
                    <span className={v.stock <= 0 ? 'text-rose-400 font-bold' : ''}>
                      {v.stock <= 0 ? 'Out of stock' : `${v.stock} units`}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-white">
                    ${v.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductDetails;
