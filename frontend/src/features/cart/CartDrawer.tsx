import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { CartSummary, CartItem } from '../../lib/api';
import { formatInr, formatUsd } from '../../lib/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartSummary | null;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0B0906] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between animate-slide-left text-[#F5EFE6]">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] flex items-center justify-center shadow-[0_0_12px_rgba(255,176,32,0.3)]">
                <ShoppingBag className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F5EFE6] tracking-tight">Your Shopping Cart</h2>
                <span className="text-xs font-mono text-[#A39A8C]">
                  {cart?.itemCount || 0} items • Server verified totals
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {isEmpty ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A39A8C]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-[#F5EFE6] text-base">Your cart is empty</h3>
                <p className="text-xs text-[#A39A8C] max-w-xs leading-relaxed">
                  Discover recommended laptops, headphones, phones, or monitors from our verified catalogue.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 rounded-xl text-xs font-semibold btn-amber active:scale-95 transition-all shadow-sm"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              items.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-[#FFB020]/30 transition-all flex gap-3.5"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/5 shrink-0 p-1.5 flex items-center justify-center">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,176,32,0.15)]"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-semibold text-[#A39A8C]">
                          {item.product.brand}
                        </span>
                        <h4 className="text-xs font-semibold text-[#F5EFE6] line-clamp-1">
                          {item.product.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[#A39A8C] hover:text-[#F87171] p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold font-mono text-[#F5EFE6] tabular-nums">
                        {formatInr(item.itemTotalInr)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-white/10 rounded-lg bg-white/[0.04] font-mono">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              onUpdateQuantity(item.id, item.quantity - 1);
                            } else {
                              onRemoveItem(item.id);
                            }
                          }}
                          className="p-1 hover:text-[#FFB020] transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums text-[#F5EFE6]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (item.quantity < Math.min(10, item.product.stock)) {
                              onUpdateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 hover:text-[#FFB020] disabled:opacity-30 transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {!isEmpty && cart && (
            <div className="p-5 border-t border-white/10 bg-white/[0.02] space-y-3.5">
              {/* Cost Calculations */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#A39A8C]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#F5EFE6] tabular-nums">
                    {formatInr(cart.subtotalInr)}
                  </span>
                </div>
                <div className="flex justify-between text-[#A39A8C]">
                  <span>Estimated Shipping</span>
                  <span className="text-[#4ADE80] font-medium">Free</span>
                </div>
                <div className="flex justify-between text-[#A39A8C]">
                  <span>Tax</span>
                  <span className="font-medium text-[#F5EFE6] tabular-nums">₹0</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#F5EFE6] font-sans">Payable Total</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#F5EFE6] tabular-nums block">
                      {formatInr(cart.totalInr)}
                    </span>
                    <span className="text-[11px] font-medium text-[#FFB020] tabular-nums">
                      ≈ {formatUsd(cart.chargeAmountUsd)} USD Sandbox
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Rate Notice */}
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.03] text-[11px] text-[#A39A8C] border border-white/5 font-mono">
                <Info className="w-3.5 h-3.5 text-[#FFB020] shrink-0" />
                <span>
                  Converted at fixed demo rate (₹1 = ${cart.inrToUsdRate} USD) for PayPal Sandbox checkout.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl btn-amber font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,176,32,0.35)]"
                >
                  <span>Review & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-between text-xs text-[#A39A8C] px-1 font-mono">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>PayPal Protected</span>
                  </div>
                  <button
                    onClick={onClearCart}
                    className="hover:text-[#F87171] transition-colors"
                  >
                    Clear cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
