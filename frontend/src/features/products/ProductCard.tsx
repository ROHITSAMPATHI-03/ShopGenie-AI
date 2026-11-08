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
    if (specs.anc !== undefined) highlights.push({ label: 'ANC', value: specs.anc ? 'Active' : 'Passive' });
    if (specs.switch_type) highlights.push({ label: 'Switch', value: String(specs.switch_type).split(' ')[0] });

    return highlights.slice(0, 3);
  };

  const highlightSpecs = getHighlightSpecs();

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group glass-card p-5 sm:p-6 flex flex-col justify-between cursor-pointer relative transition-all duration-200"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] text-[#A39A8C] border border-white/5">
              {product.brand}
            </span>

            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                {badge}
              </span>
            )}

            {scoredInfo && (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30">
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
            className={`p-1.5 rounded-lg border transition-all ${
              isCompared
                ? 'bg-[#FFB020] text-[#0B0906] border-[#FFB020] shadow-[0_0_12px_rgba(255,176,32,0.4)]'
                : 'border-white/10 text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.06] hover:border-white/20'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Product SVG Graphic Canvas with soft amber glow on hover */}
        <div className="w-full h-44 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 mb-4 flex items-center justify-center relative transition-transform duration-300">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(255,176,32,0.30)] transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-[#F5EFE6] text-base line-clamp-1 mb-1.5 group-hover:text-[#FFB020] transition-colors">
          {product.name}
        </h3>

        {/* Rating Disclosed as Sample Catalogue */}
        <div className="flex items-center gap-1.5 text-xs text-[#A39A8C] mb-3">
          <div className="flex items-center text-[#FFB020]">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="ml-1 font-mono font-semibold text-[#F5EFE6]">{product.rating}</span>
          </div>
          <span className="text-white/20">•</span>
          <span className="text-[11px] text-[#A39A8C]">Sample catalogue</span>
        </div>

        {/* Highlight Specifications in JetBrains Mono */}
        <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-white/[0.03] border border-white/5 mb-3 text-xs">
          {highlightSpecs.map((spec, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[9px] text-[#A39A8C] uppercase font-mono tracking-wider">{spec.label}</span>
              <span className="font-mono font-medium text-[#F5EFE6] truncate text-[11px]">{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Grounded Recommendation Match & Tradeoff */}
        {scoredInfo && (
          <div className="space-y-1.5 mb-3 text-xs">
            {scoredInfo.matchedRequirements?.[0] && (
              <div className="flex items-start gap-1.5 text-[#4ADE80] bg-[#4ADE80]/10 border border-[#4ADE80]/20 p-2 rounded-xl">
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="line-clamp-2 leading-relaxed text-[11px]">{scoredInfo.matchedRequirements[0]}</span>
              </div>
            )}
            {scoredInfo.tradeoffs?.[0] && (
              <div className="flex items-start gap-1.5 text-[#A39A8C] bg-white/[0.03] border border-white/5 p-2 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#FFB020]" />
                <span className="line-clamp-2 leading-relaxed text-[11px]">Trade-off: {scoredInfo.tradeoffs[0]}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Price & Primary Action */}
      <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-3 mt-1">
        <div>
          <span className="text-[9px] uppercase font-mono text-[#A39A8C] tracking-wider block">Price</span>
          <span className="text-lg font-bold text-[#F5EFE6] font-mono tabular-nums">
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
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.08] hover:border-white/20 transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              addedRecently
                ? 'bg-[#4ADE80] text-[#0B0906]'
                : 'btn-amber active:scale-95'
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
