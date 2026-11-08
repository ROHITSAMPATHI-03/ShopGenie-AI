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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-text-primary/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-surface w-full max-w-5xl rounded-3xl border border-border shadow-modal overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-tint text-accent flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Product Specification Comparison
              </h2>
              <span className="text-xs text-text-secondary">
                Comparing {products.length} models side-by-side
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <p className="text-xs text-text-secondary">Aligning specifications and evaluating trade-offs...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-status-error text-sm">
              {error}
            </div>
          ) : comparisonData ? (
            <>
              {/* Best Value Highlight Banner */}
              <div className="p-4 rounded-2xl bg-accent-tint/60 border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-accent text-white shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold tracking-wider text-accent">
                        Best Value Pick
                      </span>
                      <span className="font-semibold text-text-primary text-sm">
                        {comparisonData.bestValuePick.productName}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {comparisonData.bestValuePick.reason}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-10 sm:pl-0">
                  <span className="text-xs text-text-secondary block">Price Difference</span>
                  <span className="text-sm font-bold text-text-primary tabular-nums">
                    ₹{comparisonData.priceDifference.differenceInr.toLocaleString('en-IN')} spread
                  </span>
                </div>
              </div>

              {/* Responsive Spec Comparison Table */}
              <div className="border border-border rounded-2xl overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left min-w-[550px]">
                  <thead>
                    <tr className="bg-surface-secondary/60 border-b border-border">
                      <th className="p-3.5 font-semibold text-text-secondary w-1/4">Feature / Metric</th>
                      {comparisonData.products.map((p) => (
                        <th key={p.id} className="p-3.5 font-semibold text-text-primary text-center">
                          <div className="font-bold text-sm mb-1">{p.name}</div>
                          <div className="text-accent font-bold tabular-nums text-sm">
                            {formatInr(p.price_inr)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {/* Rating row */}
                    <tr className="hover:bg-surface-secondary/20">
                      <td className="p-3.5 font-medium text-text-secondary">Rating</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3.5 text-center font-semibold text-text-primary">
                          {p.rating} ★
                        </td>
                      ))}
                    </tr>

                    {/* Dynamic Specs Matrix */}
                    {Object.entries(comparisonData.specMatrix).map(([specName, values]) => (
                      <tr key={specName} className="hover:bg-surface-secondary/20">
                        <td className="p-3.5 font-medium text-text-secondary capitalize">
                          {specName.replace(/_/g, ' ')}
                        </td>
                        {values.map((v, idx) => (
                          <td key={idx} className="p-3.5 text-center text-text-primary font-medium">
                            {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v || '—')}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Action Row */}
                    <tr className="bg-surface-secondary/30">
                      <td className="p-3.5 font-medium text-text-secondary">Quick Purchase</td>
                      {comparisonData.products.map((p) => (
                        <td key={p.id} className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              onAddToCart(p);
                              onClose();
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover shadow-subtle inline-flex items-center gap-1.5 transition-all"
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
              <div className="p-4 rounded-2xl bg-surface-secondary/50 border border-border">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Objective Shopping Summary</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
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

