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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-surface w-full max-w-2xl rounded-3xl border border-border shadow-modal overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-text-secondary bg-surface-secondary px-2.5 py-1 rounded-lg">
              {product.brand}
            </span>
            <span className="text-xs text-text-secondary font-medium">
              ID: {product.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Canvas */}
            <div className="w-full h-56 rounded-2xl bg-surface-secondary/40 border border-border flex items-center justify-center p-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title & Core Meta */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-semibold text-text-primary">{product.rating}</span>
                </div>
                <span>•</span>
                <span>Sample verified catalogue</span>
              </div>

              <div className="pt-2">
                <span className="text-xs uppercase text-text-secondary tracking-wider block">Price</span>
                <span className="text-2xl font-bold text-text-primary tabular-nums">
                  {formatInr(product.price_inr)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-status-success font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>In Stock ({product.stock} units available)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Overview
            </h4>
            <p className="text-sm text-text-primary leading-relaxed bg-surface-secondary/40 p-3.5 rounded-xl border border-border/70">
              {product.description}
            </p>
          </div>

          {/* Full Technical Specifications */}
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Technical Specifications
            </h4>
            <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {Object.entries(product.specs || {}).map(([key, val]) => (
                <div key={key} className="grid grid-cols-2 p-3 text-xs">
                  <span className="text-text-secondary font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-text-primary font-semibold text-right">
                    {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-border bg-surface-secondary/30 flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleCompare(product)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-2 transition-colors ${
              isCompared
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isCompared ? 'In Comparison' : 'Add to Compare'}</span>
          </button>

          <button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover shadow-subtle flex items-center gap-2 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart ({formatInr(product.price_inr)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

