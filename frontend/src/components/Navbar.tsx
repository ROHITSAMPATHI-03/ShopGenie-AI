import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sparkles, Scale, Clock, Menu, X, ArrowUpRight, GitFork, Search } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  compareCount,
  onOpenCompare,
  onOpenAssistant,
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0906]/85 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Wordmark & Sparkle Lamp Symbol */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] flex items-center justify-center shadow-[0_0_15px_rgba(255,176,32,0.35)] group-hover:shadow-[0_0_22px_rgba(255,176,32,0.55)] transition-all">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-[#F5EFE6] flex items-center gap-1 font-sans">
              ShopGenie <span className="text-[#FFB020] font-serif italic text-base">AI</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#A39A8C] font-mono">
              Autonomous Discovery
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              isActive('/')
                ? 'bg-white/[0.08] text-[#F5EFE6] border border-white/10'
                : 'text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.04]'
            }`}
          >
            Home
          </Link>

          <Link
            to="/recommendations"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              isActive('/recommendations')
                ? 'bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30 font-bold'
                : 'text-[#A39A8C] hover:text-[#FFB020] hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
            <span>AI Shopping</span>
          </Link>

          <Link
            to="/products"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              isActive('/products')
                ? 'bg-white/[0.08] text-[#F5EFE6] border border-white/10'
                : 'text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.04]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Products</span>
          </Link>

          <Link
            to="/system-map"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              isActive('/system-map')
                ? 'bg-white/[0.08] text-[#F5EFE6] border border-white/10'
                : 'text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.04]'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>System Map</span>
          </Link>

          <button
            onClick={onOpenCompare}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              isActive('/compare') || compareCount > 0
                ? 'text-[#FFB020] bg-[#FFB020]/10 border border-[#FFB020]/20'
                : 'text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.04]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare</span>
            {compareCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-[#FFB020] text-[#0B0906]">
                {compareCount}
              </span>
            )}
          </button>

          <Link
            to="/orders"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              isActive('/orders')
                ? 'bg-white/[0.08] text-[#F5EFE6] border border-white/10'
                : 'text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.04]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Orders</span>
          </Link>
        </nav>

        {/* Right side controls: Start shopping pill, Sandbox Pill & Cart */}
        <div className="flex items-center gap-3">
          {/* Start shopping pill */}
          <Link
            to="/recommendations"
            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#FFB020]/40 bg-[#FFB020]/10 text-[#FFB020] hover:bg-[#FFB020] hover:text-[#0B0906] transition-all"
          >
            <span>Start Shopping</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Discreet Sandbox Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>PayPal Sandbox</span>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label={`View Shopping Cart, ${cartCount} items`}
            className="relative min-w-[44px] min-h-[44px] p-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#FFB020]/40 text-[#F5EFE6] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FFB020]/40"
          >
            <ShoppingBag className="w-5 h-5 text-[#F5EFE6]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-[#FFB020] to-[#FF7A1A] text-[#0B0906] text-[11px] font-bold font-mono flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-[#F5EFE6] flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#F5EFE6]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0906]/95 backdrop-blur-xl px-4 py-3 space-y-1 font-mono">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium text-[#F5EFE6] hover:bg-white/[0.06]"
          >
            Home
          </Link>
          <Link
            to="/recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium text-[#FFB020] hover:bg-white/[0.06] gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FFB020]" />
            <span>AI Shopping</span>
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium text-[#F5EFE6] hover:bg-white/[0.06] gap-2"
          >
            <Search className="w-4 h-4 text-[#A39A8C]" />
            <span>Products</span>
          </Link>
          <Link
            to="/system-map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium text-[#F5EFE6] hover:bg-white/[0.06] gap-2"
          >
            <GitFork className="w-4 h-4 text-[#A39A8C]" />
            <span>System Map</span>
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCompare();
            }}
            className="w-full min-h-[44px] text-left px-3.5 py-2 rounded-xl text-sm font-medium text-[#F5EFE6] hover:bg-white/[0.06] flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#FFB020]" /> Compare
            </span>
            {compareCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-[#FFB020] text-[#0B0906]">
                {compareCount}
              </span>
            )}
          </button>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-medium text-[#F5EFE6] hover:bg-white/[0.06] gap-2"
          >
            <Clock className="w-4 h-4 text-[#A39A8C]" />
            <span>Order History</span>
          </Link>
        </div>
      )}
    </header>
  );
};
