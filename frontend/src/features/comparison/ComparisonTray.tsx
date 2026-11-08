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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-2xl bg-surface/95 backdrop-blur-md rounded-2xl border border-border shadow-float p-3 sm:p-4 flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center gap-3 overflow-x-auto py-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider pl-1">
          <Scale className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Compare</span>
          <span>({comparedProducts.length}/4)</span>
        </div>

        <div className="flex items-center gap-2">
          {comparedProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-secondary text-xs font-medium text-text-primary border border-border shrink-0"
            >
              <span className="truncate max-w-[110px]">{p.name}</span>
              <button
                onClick={() => onRemove(p.id)}
                className="text-text-secondary hover:text-text-primary p-0.5"
                title="Remove"
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
          className="text-xs text-text-secondary hover:text-text-primary px-2 py-1 transition-colors"
        >
          Clear
        </button>

        <button
          onClick={onOpenCompare}
          disabled={comparedProducts.length < 2}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-subtle ${
            comparedProducts.length >= 2
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-surface-secondary text-text-secondary cursor-not-allowed opacity-60'
          }`}
        >
          <span>Compare Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

