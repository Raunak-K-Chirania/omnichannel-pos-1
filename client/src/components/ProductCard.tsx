import React, { useState } from 'react';
import type { Product, Variant } from '../types/product.types';

interface ProductCardProps {
  product: Product;
  onAdd: (variant: Variant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const activeVariants = product.variants.filter((v) => v.stock > 0);
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    activeVariants.length > 0 ? activeVariants[0] : product.variants[0]
  );

  const handleAdd = () => {
    if (selectedVariant && selectedVariant.stock > 0) {
      onAdd(selectedVariant);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-4 flex flex-col justify-between gap-3 h-full transition-all duration-200">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xs font-black text-slate-200 line-clamp-1 uppercase">{product.name}</h3>
          <span className="bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider">
            {product.category}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 min-h-[28px]">
          {product.description || 'No description provided.'}
        </p>

        {/* Variant Picker */}
        <div className="mt-3">
          <span className="text-[8px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
            Select Variant
          </span>
          <div className="flex flex-wrap gap-1">
            {product.variants.map((v) => {
              const isSelected = selectedVariant.sku === v.sku;
              const isOutOfStock = v.stock <= 0;
              return (
                <button
                  key={v.sku}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-2 py-1 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-600/10'
                      : isOutOfStock
                      ? 'bg-slate-950/20 border-slate-900 text-slate-700 cursor-not-allowed'
                      : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {v.size} / {v.color}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between gap-2 mt-1">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase font-bold text-slate-500">Price</span>
          <span className="text-sm font-extrabold font-mono text-indigo-400">
            ${selectedVariant?.price.toFixed(2) || '0.00'}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[8px] uppercase font-bold text-slate-500">Stock</span>
          <span
            className={`text-[10px] font-bold font-mono ${
              !selectedVariant || selectedVariant.stock <= 0
                ? 'text-rose-500 font-black'
                : selectedVariant.stock <= 10
                ? 'text-amber-500'
                : 'text-emerald-500'
            }`}
          >
            {!selectedVariant || selectedVariant.stock <= 0
              ? 'Out of stock'
              : `${selectedVariant.stock} units`}
          </span>
        </div>

        <button
          type="button"
          disabled={!selectedVariant || selectedVariant.stock <= 0}
          onClick={handleAdd}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer ${
            !selectedVariant || selectedVariant.stock <= 0
              ? 'bg-slate-900 text-slate-500 border border-slate-850/30 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
          }`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
