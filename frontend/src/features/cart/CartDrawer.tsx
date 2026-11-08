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
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-border shadow-modal flex flex-col justify-between animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent-tint text-accent flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">Your Shopping Cart</h2>
                <span className="text-xs text-text-secondary">
                  {cart?.itemCount || 0} items • Server verified totals
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isEmpty ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-surface-secondary flex items-center justify-center text-text-secondary">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-text-primary text-base">Your cart is empty</h3>
                <p className="text-xs text-text-secondary max-w-xs">
                  Discover recommended laptops, headphones, phones, or monitors from our verified catalogue.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover shadow-subtle transition-all"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              items.map((item: CartItem) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-border bg-surface hover:border-accent/30 transition-all flex gap-3.5"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-surface-secondary/60 border border-border/70 shrink-0 p-1.5 flex items-center justify-center">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-text-secondary">
                          {item.product.brand}
                        </span>
                        <h4 className="text-xs font-semibold text-text-primary line-clamp-1">
                          {item.product.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-text-secondary hover:text-status-error p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-text-primary tabular-nums">
                        {formatInr(item.itemTotalInr)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-border rounded-lg bg-surface-secondary/40">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              onUpdateQuantity(item.id, item.quantity - 1);
                            } else {
                              onRemoveItem(item.id);
                            }
                          }}
                          className="p-1 hover:text-accent transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (item.quantity < Math.min(10, item.product.stock)) {
                              onUpdateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 hover:text-accent disabled:opacity-30 transition-colors"
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
            <div className="p-5 border-t border-border bg-surface-secondary/30 space-y-3.5">
              {/* Cost Calculations */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-medium text-text-primary tabular-nums">
                    {formatInr(cart.subtotalInr)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Estimated Shipping</span>
                  <span className="text-status-success font-medium">Free</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span className="font-medium text-text-primary tabular-nums">₹0</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-baseline">
                  <span className="text-sm font-bold text-text-primary">Payable Total</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-text-primary tabular-nums block">
                      {formatInr(cart.totalInr)}
                    </span>
                    <span className="text-[11px] font-medium text-text-secondary tabular-nums">
                      ≈ {formatUsd(cart.chargeAmountUsd)} USD Sandbox
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Rate Notice */}
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-surface-secondary text-[10px] text-text-secondary border border-border">
                <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>
                  Converted at fixed demo rate (1 INR = {cart.inrToUsdRate} USD) for PayPal Sandbox checkout.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover shadow-subtle flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span>Review & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-between text-xs text-text-secondary px-1">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                    <span>PayPal Protected</span>
                  </div>
                  <button
                    onClick={onClearCart}
                    className="hover:text-status-error transition-colors"
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

