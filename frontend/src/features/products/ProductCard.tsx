import React, { useState } from 'react';
import { Star, Plus, Check, Scale, Eye, Zap, AlertCircle } from 'lucide-react';
import { Product, ScoredProduct } from '../../lib/api';
import { formatInr } from '../../lib/formatters';

interface ProductCardProps {
  product: Product;
  scoredInfo?: ScoredProduct;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  badge?: 'Best fit' | 'Best value' | 'Top candidate';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  scoredInfo,
  isCompared,
  onToggleCompare,
  onAddToCart,
  onViewDetails,
  badge,
}) => {
  const [addedRecently, setAddedRecently] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1600);
  };

  // Extract 2 to 3 prominent specifications
  const getHighlightSpecs = () => {
    const specs = product.specs || {};
    const highlights: { label: string; value: string }[] = [];

    if (specs.battery_hours) highlights.push({ label: 'Battery', value: `${specs.battery_hours}h` });
    if (specs.battery_mah) highlights.push({ label: 'Battery', value: `${specs.battery_mah}mAh` });
    if (specs.ram_gb) highlights.push({ label: 'RAM', value: `${specs.ram_gb}GB` });
    if (specs.storage_gb) highlights.push({ label: 'Storage', value: `${specs.storage_gb}GB` });
    if (specs.resolution) highlights.push({ label: 'Screen', value: String(specs.resolution).split(' ')[0] });
    if (specs.anc !== undefined) highlights.push({ label: 'ANC', value: specs.anc ? 'Active ANC' : 'Passive' });
    if (specs.switch_type) highlights.push({ label: 'Switch', value: String(specs.switch_type).split(' ')[0] });

    return highlights.slice(0, 3);
  };

  const highlightSpecs = getHighlightSpecs();

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group bg-surface rounded-2xl border border-border p-4 sm:p-5 flex flex-col justify-between hover:shadow-card hover:border-accent/40 transition-all duration-200 cursor-pointer relative"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-secondary text-text-secondary">
              {product.brand}
            </span>

            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-accent-tint text-accent flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {badge}
              </span>
            )}

            {scoredInfo && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-status-success border border-emerald-100">
                {scoredInfo.overallScore}/100 Match
              </span>
            )}
          </div>

          {/* Compare Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            title={isCompared ? 'Remove from comparison' : 'Compare product'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isCompared
                ? 'bg-accent text-white border-accent'
                : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Product SVG Graphic Canvas */}
        <div className="w-full h-44 rounded-xl overflow-hidden bg-surface-secondary/40 border border-border/60 mb-4 flex items-center justify-center relative group-hover:scale-[1.01] transition-transform">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              // Graceful fallback SVG if needed
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-text-primary text-base line-clamp-1 mb-1 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        {/* Rating Disclosed as Sample Catalogue */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="ml-1 font-semibold text-text-primary">{product.rating}</span>
          </div>
          <span className="text-border">•</span>
          <span className="text-[11px] text-text-secondary">Sample catalogue</span>
        </div>

        {/* Highlight Specifications */}
        <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-surface-secondary/60 mb-3 text-xs">
          {highlightSpecs.map((spec, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[10px] text-text-secondary uppercase">{spec.label}</span>
              <span className="font-medium text-text-primary truncate">{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Grounded Recommendation Match & Tradeoff */}
        {scoredInfo && (
          <div className="space-y-1.5 mb-3 text-xs">
            {scoredInfo.matchedRequirements?.[0] && (
              <div className="flex items-start gap-1.5 text-status-success bg-emerald-50/70 p-2 rounded-lg">
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="line-clamp-2 leading-relaxed">{scoredInfo.matchedRequirements[0]}</span>
              </div>
            )}
            {scoredInfo.tradeoffs?.[0] && (
              <div className="flex items-start gap-1.5 text-text-secondary bg-surface-secondary/80 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                <span className="line-clamp-2 leading-relaxed">Trade-off: {scoredInfo.tradeoffs[0]}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Price & Primary Action */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-3 mt-1">
        <div>
          <span className="text-[10px] uppercase text-text-secondary tracking-wider block">Price</span>
          <span className="text-lg font-bold text-text-primary tabular-nums">
            {formatInr(product.price_inr)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            title="Inspect full specifications"
            className="p-2 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-subtle ${
              addedRecently
                ? 'bg-status-success text-white'
                : 'bg-accent text-white hover:bg-accent-hover active:scale-95'
            }`}
          >
            {addedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

