import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  ShoppingCart,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Bot,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { api, CartSummary } from '../lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [paypalConnected, setPaypalConnected] = useState(false);

  useEffect(() => {
    api.getCart()
      .then((res) => setCart(res.cart))
      .catch(() => {});

    api.getPayPalConfig()
      .then((cfg) => setPaypalConnected(Boolean(cfg.isConfigured && cfg.clientId)))
      .catch(() => {});
  }, []);

  const cartItemCount = cart?.itemCount || 0;

  return (
    <div className="min-h-screen bg-[#0B0906] text-[#F5EFE6] selection:bg-[#FFB020]/30 selection:text-[#FFB020] relative overflow-hidden flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#FFB020]/15 via-[#FF7A1A]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[#FFB020]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-[#FF7A1A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 pt-8 pb-16 relative z-10 flex-1 flex flex-col justify-center">
        {/* Top Brand Bar */}
        <header className="flex items-center justify-between pb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] flex items-center justify-center shadow-[0_0_20px_rgba(255,176,32,0.4)]">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[#F5EFE6] flex items-center gap-1.5 font-sans">
                ShopGenie <span className="text-[#FFB020] font-serif italic text-lg">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill matching reference */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium shadow-[0_0_15px_rgba(74,222,128,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PayPal Sandbox Ready</span>
            </div>

            {/* Cart shortcut */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#FFB020]/40 transition-all text-[#F5EFE6]"
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FFB020] text-[#0B0906] text-[10px] font-mono font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="space-y-4 max-w-2xl pt-2 pb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#F5EFE6] tracking-tight leading-[1.1]">
            Think Smart. <span className="italic text-[#FFB020]">Shop Better.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A39A8C] leading-relaxed font-sans">
            Your intelligent shopping companion. Discover, compare, and purchase smarter with AI-powered recommendations.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-[#A39A8C]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFB020]" />
              <span>Autonomous discovery. Human-approved purchase.</span>
            </span>
          </div>
        </div>

        {/* 4 Large Interactive Navigation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
          {/* Card 1: AI Shopping Assistant */}
          <div
            onClick={() => navigate('/recommendations')}
            tabIndex={0}
            role="link"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/recommendations')}
            className="group relative p-7 rounded-3xl bg-[#14120E] border border-white/10 hover:border-[#FFB020]/60 hover:bg-[#181510] hover:shadow-[0_15px_35px_rgba(255,176,32,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/25 text-[#FFB020] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#FFB020] group-hover:text-[#0B0906] transition-all duration-300">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5EFE6] group-hover:text-[#FFB020] transition-colors font-sans">
                  AI Shopping
                </h2>
                <p className="text-xs sm:text-sm text-[#A39A8C] mt-1 leading-relaxed">
                  Tell us what you need. Let AI discover, score, and rank the right products for you.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center text-xs font-mono font-bold text-[#FFB020] group-hover:translate-x-1 transition-transform">
              <span>Start Shopping</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 2: System Architecture */}
          <div
            onClick={() => navigate('/system-map')}
            tabIndex={0}
            role="link"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/system-map')}
            className="group relative p-7 rounded-3xl bg-[#14120E] border border-white/10 hover:border-[#FFB020]/60 hover:bg-[#181510] hover:shadow-[0_15px_35px_rgba(255,176,32,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/25 text-[#FFB020] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#FFB020] group-hover:text-[#0B0906] transition-all duration-300">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5EFE6] group-hover:text-[#FFB020] transition-colors font-sans">
                  System Map
                </h2>
                <p className="text-xs sm:text-sm text-[#A39A8C] mt-1 leading-relaxed">
                  Explore how ShopGenie AI connects Gemini, products, SQLite, and PayPal Sandbox.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center text-xs font-mono font-bold text-[#FFB020] group-hover:translate-x-1 transition-transform">
              <span>Explore Map</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 3: Product Discovery */}
          <div
            onClick={() => navigate('/products')}
            tabIndex={0}
            role="link"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/products')}
            className="group relative p-7 rounded-3xl bg-[#14120E] border border-white/10 hover:border-[#FFB020]/60 hover:bg-[#181510] hover:shadow-[0_15px_35px_rgba(255,176,32,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/25 text-[#FFB020] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#FFB020] group-hover:text-[#0B0906] transition-all duration-300">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5EFE6] group-hover:text-[#FFB020] transition-colors font-sans">
                  Products
                </h2>
                <p className="text-xs sm:text-sm text-[#A39A8C] mt-1 leading-relaxed">
                  Browse the verified 28-device catalogue, filter specifications, and compare options.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center text-xs font-mono font-bold text-[#FFB020] group-hover:translate-x-1 transition-transform">
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>

          {/* Card 4: Cart & Orders */}
          <div
            onClick={() => navigate('/cart')}
            tabIndex={0}
            role="link"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/cart')}
            className="group relative p-7 rounded-3xl bg-[#14120E] border border-white/10 hover:border-[#FFB020]/60 hover:bg-[#181510] hover:shadow-[0_15px_35px_rgba(255,176,32,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[200px]"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/25 text-[#FFB020] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#FFB020] group-hover:text-[#0B0906] transition-all duration-300">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5EFE6] group-hover:text-[#FFB020] transition-colors font-sans">
                  Cart & Orders
                </h2>
                <p className="text-xs sm:text-sm text-[#A39A8C] mt-1 leading-relaxed">
                  Review your shopping cart, manage items, and view verified transaction receipts.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center text-xs font-mono font-bold text-[#FFB020] group-hover:translate-x-1 transition-transform">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <footer className="border-t border-white/10 bg-[#0B0906]/80 backdrop-blur-md py-4 px-4 sm:px-6 relative z-10 text-xs font-mono text-[#A39A8C]">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
              <span>28 Products Seeded</span>
            </span>
            <span className="text-white/20">•</span>
            <span>7 Validated Tools</span>
            <span className="text-white/20">•</span>
            <span>Zero-Trust Boundary (SEC-7)</span>
          </div>

          <div className="text-[11px] text-[#A39A8C]">
            PayPal AI Hackathon 2026 Submission
          </div>
        </div>
      </footer>
    </div>
  );
};

