import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sparkles, Scale, Clock, Menu, X, ArrowUpRight } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#0B0906]/80 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Wordmark & Sparkle Lamp Symbol */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] flex items-center justify-center shadow-[0_0_15px_rgba(255,176,32,0.35)] group-hover:shadow-[0_0_22px_rgba(255,176,32,0.55)] transition-all">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-[#F5EFE6] flex items-center gap-1">
              ShopGenie <span className="text-[#FFB020] font-serif italic text-base">AI</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#A39A8C] font-mono">
              Autonomous Discovery
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
              isActive('/')
                ? 'bg-white/[0.08] text-[#F5EFE6] border border-white/10'
                : 'text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.04]'
            }`}
          >
            Shop
          </Link>

          {onOpenAssistant ? (
            <button
              onClick={onOpenAssistant}
              className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-[#A39A8C] hover:text-[#FFB020] hover:bg-white/[0.04] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
              <span>Assistant</span>
            </button>
          ) : (
            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-[#A39A8C] hover:text-[#FFB020] hover:bg-white/[0.04] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
              <span>Assistant</span>
            </Link>
          )}

          <button
            onClick={onOpenCompare}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('/compare') || compareCount > 0
                ? 'text-[#FFB020] bg-[#FFB020]/10 border border-[#FFB020]/20'
                : 'text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.04]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Compare</span>
            {compareCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[11px] font-mono font-bold rounded-full bg-[#FFB020] text-[#0B0906]">
                {compareCount}
              </span>
            )}
          </button>

          <Link
            to="/orders"
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('/orders')
                ? 'bg-white/[0.08] text-[#F5EFE6] border border-white/10'
                : 'text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.04]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Orders</span>
          </Link>
        </nav>

        {/* Right side controls: Start shopping pill, Sandbox Pill & Cart */}
        <div className="flex items-center gap-3">
          {/* Start shopping pill */}
          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/[0.04] text-[#F5EFE6] hover:border-[#FFB020]/50 hover:text-[#FFB020] transition-all"
          >
            <span>Start shopping</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Discreet Sandbox Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-[#A39A8C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            <span>PayPal Sandbox</span>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="View Shopping Cart"
            className="relative p-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#FFB020]/40 text-[#F5EFE6] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FFB020]/40"
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
            className="md:hidden p-2 rounded-xl border border-white/10 bg-white/[0.04] text-[#F5EFE6]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#F5EFE6]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0906]/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#F5EFE6] hover:bg-white/[0.06]"
          >
            Shop
          </Link>
          {onOpenAssistant && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAssistant();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#FFB020] hover:bg-white/[0.06] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#FFB020]" />
              <span>Assistant</span>
            </button>
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCompare();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#F5EFE6] hover:bg-white/[0.06] flex items-center justify-between"
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
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#F5EFE6] hover:bg-white/[0.06]"
          >
            Order History
          </Link>
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-[#A39A8C] px-3 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
            <span>PayPal Sandbox Demo</span>
          </div>
        </div>
      )}
    </header>
  );
};
