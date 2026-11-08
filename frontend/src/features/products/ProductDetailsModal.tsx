import React from 'react';
import { X, Check, ShoppingBag, Scale, Star, ShieldCheck } from 'lucide-react';
import { Product } from '../../lib/api';
import { formatInr } from '../../lib/formatters';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isCompared,
  onToggleCompare,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-medium tracking-wider text-[#A39A8C] bg-white/[0.06] border border-white/5 px-2.5 py-1 rounded-lg">
              {product.brand}
            </span>
            <span className="text-xs text-[#A39A8C] font-mono">
              ID: {product.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Canvas */}
            <div className="w-full h-56 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center p-4 relative group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FFB020]/10 via-transparent to-transparent pointer-events-none" />
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,176,32,0.25)]"
              />
            </div>

            {/* Title & Core Meta */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-[#F5EFE6] tracking-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 text-sm text-[#A39A8C]">
                <div className="flex items-center text-[#FFB020]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-mono font-semibold text-[#F5EFE6]">{product.rating}</span>
                </div>
                <span className="text-white/20">•</span>
                <span className="text-xs font-mono">Sample verified catalogue</span>
              </div>

              <div className="pt-2">
                <span className="text-[10px] uppercase font-mono text-[#A39A8C] tracking-wider block">Price</span>
                <span className="text-2xl font-bold text-[#F5EFE6] font-mono tabular-nums">
                  {formatInr(product.price_inr)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#4ADE80] font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>In Stock ({product.stock} units available)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-mono font-semibold text-[#A39A8C] uppercase tracking-wider mb-2">
              Overview
            </h4>
            <p className="text-sm text-[#F5EFE6] leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              {product.description}
            </p>
          </div>

          {/* Full Technical Specifications */}
          <div>
            <h4 className="text-xs font-mono font-semibold text-[#A39A8C] uppercase tracking-wider mb-3">
              Technical Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col space-y-1"
                >
                  <span className="text-[10px] text-[#A39A8C] uppercase font-mono tracking-wider">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#F5EFE6] truncate">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleCompare(product)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isCompared
                ? 'bg-[#FFB020] text-[#0B0906]'
                : 'border border-white/10 text-[#F5EFE6] hover:bg-white/[0.06] hover:border-white/20'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isCompared ? 'Remove from Compare' : 'Add to Compare'}</span>
          </button>

          <button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold btn-amber flex items-center gap-2 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
