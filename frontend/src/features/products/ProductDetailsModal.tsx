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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details-title"
    >
      <div
        className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
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
            aria-label="Close product details"
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.08] transition-colors flex items-center justify-center"
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
              <h2 id="product-details-title" className="text-xl font-bold text-[#F5EFE6] tracking-tight">
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

          {/* Description & Verified Catalogue Badge */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/25 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFB020] shrink-0" />
                <span className="font-semibold text-[#F5EFE6]">Verified Catalogue Product</span>
              </div>
              <span className="text-[10px] font-mono text-[#A39A8C]">
                Deterministic Specs & Price Guaranteed
              </span>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold text-[#A39A8C] uppercase tracking-wider mb-2">
                Overview
              </h4>
              <p className="text-sm text-[#F5EFE6] leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                {product.description}
              </p>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h4 className="text-xs font-mono font-semibold text-[#A39A8C] uppercase tracking-wider flex items-center justify-between">
              <span>Rating Breakdown</span>
              <span className="text-[#FFB020] font-bold">{product.rating} / 5.0</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#A39A8C]">
                  <span>Performance</span>
                  <span className="text-[#F5EFE6]">{(Math.min(5, product.rating + 0.1)).toFixed(1)}★</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#FFB020] h-full" style={{ width: `${Math.min(100, product.rating * 20)}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#A39A8C]">
                  <span>Build Quality</span>
                  <span className="text-[#F5EFE6]">{(Math.max(4.0, product.rating - 0.1)).toFixed(1)}★</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#4ADE80] h-full" style={{ width: `${Math.max(75, (product.rating - 0.2) * 20)}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#A39A8C]">
                  <span>Value for Money</span>
                  <span className="text-[#F5EFE6]">{product.rating.toFixed(1)}★</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#FFB020] h-full" style={{ width: `${product.rating * 20}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#A39A8C]">
                  <span>Efficiency / Battery</span>
                  <span className="text-[#F5EFE6]">{(Math.min(5, product.rating)).toFixed(1)}★</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#4ADE80] h-full" style={{ width: `${product.rating * 20}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Technical Specifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-semibold text-[#A39A8C] uppercase tracking-wider">
              Grouped Technical Specifications
            </h4>

            {/* Performance Group */}
            {Boolean(product.specs?.cpu || product.specs?.ram_gb || product.specs?.storage_gb || product.specs?.gpu_tier || product.specs?.switch_type || product.specs?.polling_rate_hz || product.specs?.driver_mm) && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-[#FFB020] uppercase tracking-wide">
                  • Performance & Core Processing
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.specs?.cpu && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">CPU</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.cpu}</span>
                    </div>
                  )}
                  {product.specs?.cpu_cores && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Cores / Threads</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.cpu_cores} Cores</span>
                    </div>
                  )}
                  {product.specs?.ram_gb && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">RAM Capacity</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.ram_gb} GB</span>
                    </div>
                  )}
                  {product.specs?.storage_gb && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Storage</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.storage_gb} GB SSD</span>
                    </div>
                  )}
                  {product.specs?.gpu_tier && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Graphics (GPU)</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6] capitalize">{product.specs.gpu_tier}</span>
                    </div>
                  )}
                  {product.specs?.switch_type && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Switch Type</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.switch_type}</span>
                    </div>
                  )}
                  {product.specs?.polling_rate_hz && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Polling Rate</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.polling_rate_hz} Hz</span>
                    </div>
                  )}
                  {product.specs?.driver_mm && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Audio Driver</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.driver_mm} mm Dynamic</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Display & Visuals Group */}
            {Boolean(product.specs?.screen_size_inch || product.specs?.resolution || product.specs?.refresh_rate_hz || product.specs?.color_gamut || product.specs?.color_accuracy) && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono font-semibold text-[#FFB020] uppercase tracking-wide">
                  • Display & Visual Experience
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.specs?.screen_size_inch && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Screen Size</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.screen_size_inch}" Diagonal</span>
                    </div>
                  )}
                  {product.specs?.resolution && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Resolution</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.resolution}</span>
                    </div>
                  )}
                  {product.specs?.refresh_rate_hz && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Refresh Rate</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.refresh_rate_hz} Hz</span>
                    </div>
                  )}
                  {(product.specs?.color_gamut || product.specs?.color_accuracy) && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Color Accuracy</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.color_gamut || product.specs.color_accuracy}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Battery, Connectivity & Ports Group */}
            {Boolean(product.specs?.battery_hours || product.specs?.battery_life_hours || product.specs?.battery_life || product.specs?.charging_watt || product.specs?.ports || product.specs?.wireless !== undefined || product.specs?.anc !== undefined) && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono font-semibold text-[#FFB020] uppercase tracking-wide">
                  • Battery & Connectivity
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(product.specs?.battery_hours || product.specs?.battery_life_hours || product.specs?.battery_life) && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Battery Life</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">
                        {product.specs?.battery_hours ? `${product.specs.battery_hours} Hours` : product.specs?.battery_life_hours ? `${product.specs.battery_life_hours} Hours` : String(product.specs.battery_life)}
                      </span>
                    </div>
                  )}
                  {product.specs?.charging_watt && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Fast Charging</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.charging_watt}W</span>
                    </div>
                  )}
                  {product.specs?.wireless !== undefined && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Wireless</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.wireless ? 'Yes (Bluetooth / 2.4GHz)' : 'Wired'}</span>
                    </div>
                  )}
                  {product.specs?.anc !== undefined && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Noise Cancellation</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.anc ? 'Active Noise Cancellation (ANC)' : 'Passive Isolation'}</span>
                    </div>
                  )}
                  {product.specs?.ports && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 col-span-2">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Ports & IO</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.ports}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Build & Ergonomics Group */}
            {Boolean(product.specs?.weight_kg || product.specs?.weight_grams || product.specs?.os || product.specs?.layout || product.specs?.rgb_backlight !== undefined) && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono font-semibold text-[#FFB020] uppercase tracking-wide">
                  • Build & Form Factor
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(product.specs?.weight_kg || product.specs?.weight_grams) && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Weight</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">
                        {product.specs.weight_kg ? `${product.specs.weight_kg} kg` : `${product.specs.weight_grams} g`}
                      </span>
                    </div>
                  )}
                  {product.specs?.os && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">OS</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.os}</span>
                    </div>
                  )}
                  {product.specs?.layout && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Keyboard Layout</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.layout}</span>
                    </div>
                  )}
                  {product.specs?.rgb_backlight !== undefined && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[10px] text-[#A39A8C] uppercase font-mono block">Backlighting</span>
                      <span className="text-xs font-mono font-semibold text-[#F5EFE6]">{product.specs.rgb_backlight ? 'RGB Backlit' : 'None / White'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-5 sm:px-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleCompare(product)}
            aria-label={isCompared ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
            className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
            aria-label={`Add ${product.name} to cart`}
            className="px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold btn-amber flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
