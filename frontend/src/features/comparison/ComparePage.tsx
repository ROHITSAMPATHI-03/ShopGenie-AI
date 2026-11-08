import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft, Plus, Check, ShoppingBag, Zap, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        cartCount={cart?.itemCount || 0}
        onOpenCart={() => setIsCartOpen(true)}
        compareCount={selectedIds.length}
        onOpenCompare={() => {}}
      />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Workspace</span>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Side-by-Side Product Comparison
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Compare 2 to 4 products objectively with deterministic spec analysis
            </p>
          </div>
        </div>

        {/* Selected Selector Chips */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
            Select products to compare ({selectedIds.length}/4):
          </span>
          <div className="flex flex-wrap gap-2">
            {allProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => handleToggleSelect(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-accent text-white border-accent shadow-subtle'
                      : 'bg-surface-secondary text-text-secondary border-border hover:text-text-primary'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-xs text-text-secondary">Comparing models...</p>
          </div>
        ) : comparison ? (
          <div className="space-y-6">
            {/* Best Value Banner */}
            <div className="p-5 rounded-3xl bg-accent-tint/60 border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-accent text-white shrink-0 mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-accent block">
                    Best Value Analysis
                  </span>
                  <h3 className="font-bold text-text-primary text-base">
                    {comparison.bestValuePick.productName}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 max-w-xl leading-relaxed">
                    {comparison.bestValuePick.reason}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-12 sm:pl-0">
                <span className="text-xs text-text-secondary block">Price Range</span>
                <span className="text-base font-bold text-text-primary tabular-nums">
                  ₹{comparison.priceDifference.minPriceInr.toLocaleString('en-IN')} - ₹{comparison.priceDifference.maxPriceInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Spec Matrix Table */}
            <div className="bg-surface rounded-3xl border border-border shadow-card overflow-x-auto">
              <table className="w-full border-collapse text-xs text-left min-w-[600px]">
                <thead>
                  <tr className="bg-surface-secondary/60 border-b border-border">
                    <th className="p-4 font-semibold text-text-secondary w-1/4">Specification</th>
                    {comparison.products.map((p) => (
                      <th key={p.id} className="p-4 font-semibold text-text-primary text-center">
                        <div className="w-16 h-16 mx-auto mb-2 p-1 rounded-xl bg-surface border border-border/80 flex items-center justify-center">
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="font-bold text-sm text-text-primary">{p.name}</div>
                        <div className="text-accent font-bold tabular-nums text-sm mt-1">
                          {formatInr(p.price_inr)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-surface-secondary/20">
                    <td className="p-4 font-medium text-text-secondary">Rating</td>
                    {comparison.products.map((p) => (
                      <td key={p.id} className="p-4 text-center font-bold text-text-primary">
                        {p.rating} ★
                      </td>
                    ))}
                  </tr>

                  {Object.entries(comparison.specMatrix).map(([specName, values]) => (
                    <tr key={specName} className="hover:bg-surface-secondary/20">
                      <td className="p-4 font-medium text-text-secondary capitalize">
                        {specName.replace(/_/g, ' ')}
                      </td>
                      {values.map((v, idx) => (
                        <td key={idx} className="p-4 text-center text-text-primary font-medium">
                          {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v || '—')}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="bg-surface-secondary/30">
                    <td className="p-4 font-medium text-text-secondary">Action</td>
                    {comparison.products.map((p) => (
                      <td key={p.id} className="p-4 text-center">
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover shadow-subtle inline-flex items-center gap-1.5 transition-all"
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

            {/* Objective Summary */}
            <div className="p-5 rounded-3xl bg-surface border border-border shadow-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Deterministic Comparison Summary</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
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

