import React from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';
import { Product } from '../../lib/api';

interface ComparisonTrayProps {
  comparedProducts: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onOpenCompare: () => void;
}

export const ComparisonTray: React.FC<ComparisonTrayProps> = ({
  comparedProducts,
  onRemove,
  onClear,
  onOpenCompare,
}) => {
  if (comparedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-2xl bg-[#0B0906]/92 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,176,32,0.15)] p-3 sm:p-4 flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center gap-3 overflow-x-auto py-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FFB020] uppercase font-mono tracking-wider pl-1">
          <Scale className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Compare</span>
          <span>({comparedProducts.length}/4)</span>
        </div>

        <div className="flex items-center gap-2">
          {comparedProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.05] text-xs font-medium text-[#F5EFE6] border border-white/10 shrink-0"
            >
              <span className="truncate max-w-[110px]">{p.name}</span>
              <button
                onClick={() => onRemove(p.id)}
                className="text-[#A39A8C] hover:text-[#FFB020] p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center transition-colors"
                title="Remove"
                aria-label={`Remove ${p.name} from comparison`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onClear}
          className="text-xs font-mono text-[#A39A8C] hover:text-[#F5EFE6] px-3 py-2 min-h-[44px] flex items-center justify-center transition-colors"
          aria-label="Clear all compared products"
        >
          Clear
        </button>

        <button
          onClick={onOpenCompare}
          disabled={comparedProducts.length < 2}
          aria-label="Compare selected products now"
          className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            comparedProducts.length >= 2
              ? 'btn-amber shadow-[0_0_15px_rgba(255,176,32,0.3)]'
              : 'bg-white/[0.04] text-[#A39A8C] border border-white/5 cursor-not-allowed opacity-50'
          }`}
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
