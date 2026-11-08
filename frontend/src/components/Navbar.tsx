import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sparkles, Scale, Clock, Menu, X } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  compareCount: number;
  onOpenCompare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  compareCount,
  onOpenCompare,
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Wordmark & Symbol */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-subtle group-hover:bg-accent-hover transition-colors">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-text-primary flex items-center gap-1.5">
              ShopGenie <span className="text-accent font-bold">AI</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-text-secondary font-medium">
              Autonomous Discovery
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-surface-secondary text-text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/60'
            }`}
          >
            Shop & Catalogue
          </Link>
          <button
            onClick={onOpenCompare}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/compare') || compareCount > 0
                ? 'text-accent hover:bg-accent-tint/60'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Compare</span>
            {compareCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-xs font-semibold rounded-full bg-accent text-white">
                {compareCount}
              </span>
            )}
          </button>
          <Link
            to="/orders"
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/orders')
                ? 'bg-surface-secondary text-text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Orders</span>
          </Link>
        </nav>

        {/* Right side controls & Sandbox Demo Pill */}
        <div className="flex items-center gap-3">
          {/* Discreet Sandbox Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-surface-secondary/70 text-[11px] font-medium text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span>PayPal Sandbox Mode</span>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="View Shopping Cart"
            className="relative p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-text-primary transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <ShoppingBag className="w-5 h-5 text-text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-white text-[11px] font-semibold flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-border bg-surface text-text-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            Shop & Catalogue
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCompare();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-secondary flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-accent" /> Compare
            </span>
            {compareCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent text-white">
                {compareCount}
              </span>
            )}
          </button>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            Order History
          </Link>
          <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-text-secondary px-3">
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span>PayPal Sandbox Demo</span>
          </div>
        </div>
      )}
    </header>
  );
};

