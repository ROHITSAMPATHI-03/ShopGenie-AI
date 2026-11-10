import React, { useState, useEffect } from 'react';
import { X, Scale, Sparkles, Check, ShoppingBag, Zap } from 'lucide-react';
import { Product, ComparisonResult, api } from '../../lib/api';
import { formatInr } from '../../lib/formatters';

interface ComparisonModalProps {
  products: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  products,
  onClose,
  onAddToCart,
}) => {
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (products.length < 2) return;
    setLoading(true);
    setError(null);

    api.compareProducts(products.map((p) => p.id))
      .then((data) => {
        setComparisonData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to compare products');
        setLoading(false);
      });
  }, [products]);

  if (products.length < 2) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-dialog-title"
    >
      <div
        className="glass-panel w-full max-w-5xl rounded-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] flex items-center justify-center shadow-[0_0_12px_rgba(255,176,32,0.3)]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 id="comparison-dialog-title" className="text-base sm:text-lg font-bold text-[#F5EFE6] tracking-tight">
                Product Specification Comparison
              </h2>
              <span className="text-xs font-mono text-[#A39A8C]">
                Comparing {products.length} models side-by-side
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close comparison dialog"
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.06] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-[#A39A8C]">Aligning specifications and evaluating trade-offs...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#F87171] text-sm">
              {error}
            </div>
          ) : comparisonData ? (
            <>
              {/* Best Value Highlight Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(255,176,32,0.1)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] shrink-0 mt-0.5 shadow-sm">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#FFB020]">
                        Best Value Pick
                      </span>
                      <span className="font-semibold text-[#F5EFE6] text-sm">
                        {comparisonData.bestValuePick.productName}
                      </span>
                    </div>
                    <p className="text-xs text-[#A39A8C] mt-1 leading-relaxed">
                      {comparisonData.bestValuePick.reason}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-11 sm:pl-0">
                  <span className="text-[10px] font-mono uppercase text-[#A39A8C] tracking-wider block">Price Difference</span>
                  <span className="text-sm font-bold font-mono text-[#F5EFE6] tabular-nums">
                    ₹{comparisonData.priceDifference.differenceInr.toLocaleString('en-IN')} spread
                  </span>
                </div>
              </div>

              {/* Responsive Spec Comparison Table */}
              <div className="border border-white/10 rounded-2xl overflow-x-auto bg-white/[0.02]">
                <table className="w-full border-collapse text-xs text-left min-w-[550px]">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/10">
                      <th className="p-3.5 font-mono font-semibold text-[#A39A8C] w-1/4 uppercase tracking-wider text-[11px]">Feature / Metric</th>
                      {comparisonData.products.map((p) => {
                        const isBestValue = p.name === comparisonData.bestValuePick.productName;
                        return (
                          <th key={p.id} className={`p-3.5 font-semibold text-center ${isBestValue ? 'bg-[#FFB020]/5' : ''}`}>
                            <div className="font-bold text-sm text-[#F5EFE6] mb-1">{p.name}</div>
                            <div className="text-[#FFB020] font-bold font-mono tabular-nums text-sm">
                              {formatInr(p.price_inr)}
                            </div>
                            {isBestValue && (
                              <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30">
                                Best Value
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-mono">
                    {/* Rating row */}
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-[#A39A8C]">Rating</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3.5 text-center font-semibold text-[#F5EFE6]">
                          <span className="text-[#FFB020]">★</span> {p.rating}
                        </td>
                      ))}
                    </tr>

                    {/* Dynamic Specs Matrix */}
                    {Object.entries(comparisonData.specMatrix).map(([specName, values]) => (
                      <tr key={specName} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 font-medium text-[#A39A8C] capitalize">
                          {specName.replace(/_/g, ' ')}
                        </td>
                        {values.map((v, idx) => (
                          <td key={idx} className="p-3.5 text-center text-[#F5EFE6] font-medium">
                            {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v || '—')}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Action Row */}
                    <tr className="bg-white/[0.03]">
                      <td className="p-3.5 font-medium text-[#A39A8C]">Quick Purchase</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              onAddToCart(p);
                              onClose();
                            }}
                            aria-label={`Add ${p.name} to cart`}
                            className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold btn-amber inline-flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Grounded Summary */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#FFB020] uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
                  <span>Objective Shopping Summary</span>
                </div>
                <p className="text-xs text-[#F5EFE6] leading-relaxed">
                  {comparisonData.summary}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
