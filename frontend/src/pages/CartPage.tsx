import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api, CartSummary } from '../lib/api';
import { formatInr, formatUsd } from '../lib/formatters';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = () => {
    setLoading(true);
    api.getCart()
      .then((res) => {
        setCart(res.cart);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load cart:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1 || newQty > 10) return;
    try {
      const res = await api.updateCartQuantity(itemId, newQty);
      setCart(res.cart);
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const res = await api.removeFromCart(itemId);
      setCart(res.cart);
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear your shopping cart?')) return;
    try {
      const res = await api.clearCart();
      setCart(res.cart);
    } catch (err: any) {
      alert(err.message || 'Failed to clear cart');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0906] text-[#F5EFE6] selection:bg-[#FFB020]/30 selection:text-[#FFB020] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0906]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-[#FFB020] text-xs font-mono font-semibold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#FFB020]" />
              <h1 className="text-sm sm:text-base font-bold text-[#F5EFE6]">
                Shopping Cart & Purchases
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/orders"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-[#FFB020] text-xs font-mono font-medium text-[#A39A8C] transition-all flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Order History</span>
            </Link>

            <Link
              to="/products"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono font-medium text-[#A39A8C] hover:text-[#F5EFE6] transition-all"
            >
              Catalogue
            </Link>
          </div>
        </div>
      </header>

      {/* Main Cart Content */}
      <main className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-10 flex-1">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-[#A39A8C]">Loading shopping cart...</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#14120E] border border-white/10 text-center space-y-5 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#A39A8C]">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#F5EFE6]">Your cart is empty</h2>
              <p className="text-xs text-[#A39A8C] mt-1.5 leading-relaxed">
                Explore our curated 28-device catalogue or consult the AI assistant to find the ideal laptop, phone, or headphones.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-xl btn-amber text-xs font-semibold"
              >
                Browse Catalogue
              </Link>
              <Link
                to="/recommendations"
                className="px-5 py-2.5 rounded-xl border border-[#FFB020]/30 bg-[#FFB020]/10 hover:bg-[#FFB020] hover:text-[#0B0906] text-xs font-mono font-semibold text-[#FFB020] transition-all"
              >
                Ask Assistant
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono text-[#A39A8C]">
                  {cart.itemCount} item(s) in active session
                </span>

                <button
                  onClick={handleClear}
                  className="text-xs font-mono text-[#A39A8C] hover:text-[#F87171] transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-3xl bg-[#14120E] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] p-2 border border-white/10 shrink-0 flex items-center justify-center">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase font-semibold text-[#FFB020]">
                          {item.product.brand}
                        </span>
                        <h3 className="text-sm font-semibold text-[#F5EFE6] truncate">
                          {item.product.name}
                        </h3>
                        <span className="text-xs font-mono text-[#A39A8C] block mt-0.5">
                          {formatInr(item.product.price_inr)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#A39A8C] hover:text-[#F5EFE6] disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-[#F5EFE6]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 10 || item.quantity >= item.product.stock}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#A39A8C] hover:text-[#F5EFE6] disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <span className="text-sm font-bold font-mono text-[#F5EFE6] tabular-nums min-w-[70px] text-right">
                        {formatInr(item.itemTotalInr)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 rounded-xl text-[#A39A8C] hover:text-[#F87171] hover:bg-red-500/10 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zero-Trust Notice */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-[#A39A8C] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#4ADE80] shrink-0" />
                <span>
                  Totals calculated strictly server-side in integer paise. No payment is charged without your approval.
                </span>
              </div>
            </div>

            {/* Right Col: Summary & Checkout Button */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-6 sm:p-7 rounded-3xl bg-[#14120E] border border-white/10 space-y-6 sticky top-24 shadow-md">
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#F5EFE6]">Order Summary</h2>
                  <span className="text-xs font-mono text-[#A39A8C]">
                    Ready for secure PayPal Sandbox approval
                  </span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-[#A39A8C]">
                    <span>Catalogue Subtotal</span>
                    <span className="font-semibold text-[#F5EFE6] tabular-nums">
                      {formatInr(cart.subtotalInr)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#A39A8C]">
                    <span>Standard Delivery</span>
                    <span className="font-semibold text-[#4ADE80]">Complimentary Free</span>
                  </div>

                  <div className="flex justify-between text-[#A39A8C]">
                    <span>Estimated Taxes</span>
                    <span className="font-semibold text-[#F5EFE6] tabular-nums">₹0</span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#F5EFE6] font-sans">Total (INR)</span>
                    <span className="text-xl font-bold text-[#F5EFE6] tabular-nums">
                      {formatInr(cart.totalInr)}
                    </span>
                  </div>

                  {/* Disclosed USD sandbox charge */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#FFB020] block">USD Sandbox Charge</span>
                      <span className="text-[10px] text-[#A39A8C]">Fixed Rate: ₹1 = ${cart.inrToUsdRate} USD</span>
                    </div>
                    <span className="text-lg font-bold text-[#FFB020] tabular-nums">
                      {formatUsd(cart.chargeAmountUsd)}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 rounded-2xl btn-amber text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,176,32,0.35)] transition-all active:scale-[0.98]"
                >
                  <span>Proceed to PayPal Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-[11px] font-mono text-[#A39A8C] text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>Sandbox Environment • TLS 256-bit Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0B0906]/80 py-3 px-4 text-center text-xs font-mono text-[#A39A8C]">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Link to="/" className="hover:text-[#FFB020] transition-colors">
            ← Return to Home
          </Link>
          <Link to="/orders" className="hover:text-[#FFB020] transition-colors">
            View Past Orders →
          </Link>
        </div>
      </footer>
    </div>
  );
};

