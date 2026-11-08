import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft, Check, ShoppingBag, Zap, Sparkles } from 'lucide-react';
import { api, Product, ComparisonResult } from '../../lib/api';
import { formatInr } from '../../lib/formatters';
import { Navbar } from '../../components/Navbar';
import { CartDrawer } from '../cart/CartDrawer';

export const ComparePage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['LAP-001', 'LAP-002']);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    api.getProducts().then((res) => setAllProducts(res.products));
    api.getCart().then((res) => setCart(res.cart)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    api.compareProducts(selectedIds)
      .then((data) => {
        setComparison(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Comparison error:', err);
        setLoading(false);
      });
  }, [selectedIds]);

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert('You must compare at least 2 products.');
        return;
      }
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare at most 4 products.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await api.addToCart(product.id, 1);
      setCart(res.cart);
      setIsCartOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0906] text-[#F5EFE6]">
      <Navbar
        cartCount={cart?.itemCount || 0}
        onOpenCart={() => setIsCartOpen(true)}
        compareCount={selectedIds.length}
        onOpenCompare={() => {}}
      />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A39A8C] hover:text-[#FFB020] mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Workspace</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#F5EFE6]">
              Side-by-Side Product Comparison
            </h1>
            <p className="text-xs text-[#A39A8C] mt-1 font-mono">
              Compare 2 to 4 products objectively with deterministic spec analysis
            </p>
          </div>
        </div>

        {/* Selected Selector Chips */}
        <div className="p-5 rounded-3xl glass-card space-y-3">
          <span className="text-xs font-mono font-semibold text-[#A39A8C] uppercase tracking-wider block">
            Select products to compare ({selectedIds.length}/4):
          </span>
          <div className="flex flex-wrap gap-2">
            {allProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => handleToggleSelect(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#FFB020] text-[#0B0906] border-[#FFB020] shadow-[0_0_12px_rgba(255,176,32,0.35)] font-semibold'
                      : 'bg-white/[0.04] text-[#A39A8C] border-white/10 hover:text-[#F5EFE6] hover:bg-white/[0.08]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-[#A39A8C]">Comparing models...</p>
          </div>
        ) : comparison ? (
          <div className="space-y-6">
            {/* Best Value Banner */}
            <div className="p-5 rounded-3xl bg-[#FFB020]/10 border border-[#FFB020]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(255,176,32,0.1)]">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] shrink-0 mt-0.5 shadow-sm">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#FFB020] block">
                    Best Value Analysis
                  </span>
                  <h3 className="font-bold text-[#F5EFE6] text-base mt-0.5">
                    {comparison.bestValuePick.productName}
                  </h3>
                  <p className="text-xs text-[#A39A8C] mt-1 max-w-xl leading-relaxed">
                    {comparison.bestValuePick.reason}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-12 sm:pl-0">
                <span className="text-[10px] font-mono uppercase text-[#A39A8C] tracking-wider block">Price Range</span>
                <span className="text-base font-bold font-mono text-[#F5EFE6] tabular-nums">
                  ₹{comparison.priceDifference.minPriceInr.toLocaleString('en-IN')} - ₹{comparison.priceDifference.maxPriceInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Spec Matrix Table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-white/[0.04] border-b border-white/10 font-mono">
                      <th className="p-4 font-semibold text-[#A39A8C] w-1/4 uppercase tracking-wider text-[11px]">Specification</th>
                      {comparison.products.map((p) => {
                        const isBestValue = p.name === comparison.bestValuePick.productName;
                        return (
                          <th key={p.id} className={`p-4 font-semibold text-center ${isBestValue ? 'bg-[#FFB020]/5' : ''}`}>
                            <div className="w-16 h-16 mx-auto mb-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,176,32,0.2)]" />
                            </div>
                            <div className="font-bold text-sm text-[#F5EFE6]">{p.name}</div>
                            <div className="text-[#FFB020] font-bold font-mono tabular-nums text-sm mt-1">
                              {formatInr(p.price_inr)}
                            </div>
                            {isBestValue && (
                              <span className="inline-block mt-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30">
                                Best Value
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-mono">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-4 font-medium text-[#A39A8C]">Rating</td>
                      {comparison.products.map((p) => (
                        <td key={p.id} className="p-4 text-center font-bold text-[#F5EFE6]">
                          <span className="text-[#FFB020]">★</span> {p.rating}
                        </td>
                      ))}
                    </tr>

                    {Object.entries(comparison.specMatrix).map(([specName, values]) => (
                      <tr key={specName} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-medium text-[#A39A8C] capitalize">
                          {specName.replace(/_/g, ' ')}
                        </td>
                        {values.map((v, idx) => (
                          <td key={idx} className="p-4 text-center text-[#F5EFE6] font-medium">
                            {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v || '—')}
                          </td>
                        ))}
                      </tr>
                    ))}

                    <tr className="bg-white/[0.03]">
                      <td className="p-4 font-medium text-[#A39A8C]">Action</td>
                      {comparison.products.map((p) => (
                        <td key={p.id} className="p-4 text-center">
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold btn-amber inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
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
            </div>

            {/* Objective Summary */}
            <div className="p-5 rounded-3xl glass-card space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FFB020] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#FFB020]" />
                <span>Deterministic Comparison Summary</span>
              </div>
              <p className="text-xs text-[#F5EFE6] leading-relaxed">
                {comparison.summary}
              </p>
            </div>
          </div>
        ) : null}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={async (id, qty) => {
          const res = await api.updateCartQuantity(id, qty);
          setCart(res.cart);
        }}
        onRemoveItem={async (id) => {
          const res = await api.removeFromCart(id);
          setCart(res.cart);
        }}
        onClearCart={async () => {
          const res = await api.clearCart();
          setCart(res.cart);
        }}
      />
    </div>
  );
};
