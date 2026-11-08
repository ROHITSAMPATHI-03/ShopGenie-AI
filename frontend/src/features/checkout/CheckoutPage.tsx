import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Info,
  CheckCircle2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { api, CartSummary, Order } from '../../lib/api';
import { formatInr, formatUsd } from '../../lib/formatters';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderInProgress, setOrderInProgress] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelNotice, setCancelNotice] = useState(false);
  const [paypalConfig, setPaypalConfig] = useState<{
    clientId: string;
    isConfigured: boolean;
    currency: string;
    env: string;
    inrToUsdRate: number;
  } | null>(null);

  useEffect(() => {
    // Load cart & PayPal configuration
    Promise.all([api.getCart(), api.getPayPalConfig()])
      .then(([cartRes, configRes]) => {
        setCart(cartRes.cart);
        setPaypalConfig(configRes);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Failed to initialize checkout');
        setLoading(false);
      });
  }, []);

  const handleCreateOrder = async (): Promise<string> => {
    setErrorMsg(null);
    setCancelNotice(false);

    try {
      // 1. Snapshot cart into internal pending order
      const { order } = await api.createOrder();
      setOrderInProgress(order);

      // 2. Obtain PayPal order ID from backend
      const { paypalOrderId } = await api.createPayPalOrder(order.id);
      return paypalOrderId;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create payment order');
      throw err;
    }
  };

  const handleApprove = async (data: any) => {
    if (!orderInProgress) return;
    try {
      // Server-side capture & strict verification
      const { order } = await api.capturePayPalOrder(data.orderID, orderInProgress.id);
      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment capture failed');
    }
  };

  const handleCancel = async () => {
    if (orderInProgress) {
      try {
        await api.cancelPayPalOrder(orderInProgress.id);
      } catch (err) {
        console.warn('Cancel order tracking error:', err);
      }
    }
    setCancelNotice(true);
  };

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-sm text-text-secondary">Preparing secure checkout session...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-secondary flex items-center justify-center text-text-secondary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Your cart is empty</h2>
        <p className="text-sm text-text-secondary max-w-sm">
          Please add items to your shopping cart before initiating checkout.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isPayPalConfigured = Boolean(paypalConfig?.isConfigured && paypalConfig?.clientId);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Order Review & Items */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">Review Order</h1>
                <p className="text-xs text-text-secondary mt-0.5">
                  Confirm your items before proceeding to PayPal approval
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-surface-secondary border border-border text-xs font-semibold text-text-secondary">
                {cart.itemCount} item(s)
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-3.5">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface-secondary/40 border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-surface p-1 border border-border/80 shrink-0 flex items-center justify-center">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-semibold text-text-secondary">
                        {item.product.brand}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                        {item.product.name}
                      </h4>
                      <span className="text-xs text-text-secondary">
                        Qty: {item.quantity} × {formatInr(item.product.price_inr)}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-text-primary tabular-nums shrink-0">
                    {formatInr(item.itemTotalInr)}
                  </span>
                </div>
              ))}
            </div>

            {/* Trust Disclosures */}
            <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-border space-y-2 text-xs text-text-secondary">
              <div className="flex items-center gap-2 font-semibold text-text-primary">
                <ShieldCheck className="w-4 h-4 text-status-success" />
                <span>Autonomous Discovery • Human-Approved Purchase</span>
              </div>
              <p className="leading-relaxed">
                ShopGenie AI calculates exact totals server-side. No funds are charged without your explicit biometric or password approval inside the PayPal Sandbox popup.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Payment Summary & PayPal Buttons */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface rounded-3xl border border-border p-6 shadow-card space-y-6 sticky top-24">
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Payment Summary</h2>
              <span className="text-xs text-text-secondary">
                Exact currency amounts frozen for this transaction
              </span>
            </div>

            {/* Amounts Table */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Catalogue Subtotal</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {formatInr(cart.subtotalInr)}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Standard Delivery</span>
                <span className="font-semibold text-status-success">Complimentary Free</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Estimated Taxes</span>
                <span className="font-semibold text-text-primary tabular-nums">₹0</span>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-text-primary block">INR Total</span>
                  <span className="text-[11px] text-text-secondary">Catalogue Currency</span>
                </div>
                <span className="text-xl font-bold text-text-primary tabular-nums">
                  {formatInr(cart.totalInr)}
                </span>
              </div>

              {/* Disclosed USD Sandbox Charge */}
              <div className="p-3 rounded-2xl bg-accent-tint/60 border border-accent/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-accent block">USD Sandbox Charge</span>
                  <span className="text-[10px] text-text-secondary">
                    Fixed Demo Rate: 1 INR = {cart.inrToUsdRate} USD
                  </span>
                </div>
                <span className="text-lg font-bold text-accent tabular-nums">
                  {formatUsd(cart.chargeAmountUsd)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-status-error text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Cancel Notice */}
            {cancelNotice && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div>
                  <span className="font-semibold block">Payment was cancelled</span>
                  <p className="mt-0.5">Your cart is still saved and intact. You can retry when ready.</p>
                </div>
              </div>
            )}

            {/* PayPal Button Container */}
            <div className="pt-2">
              {isPayPalConfigured ? (
                <PayPalScriptProvider
                  options={{
                    clientId: paypalConfig!.clientId,
                    currency: cart.chargeCurrency,
                    intent: 'capture',
                  }}
                >
                  <PayPalButtons
                    style={{
                      layout: 'vertical',
                      shape: 'rect',
                      borderRadius: 12,
                      height: 48,
                      label: 'pay',
                    }}
                    createOrder={handleCreateOrder}
                    onApprove={handleApprove}
                    onCancel={handleCancel}
                    onError={(err) => {
                      console.error('PayPal Buttons Error:', err);
                      setErrorMsg('An error occurred during PayPal communication. Please try again.');
                    }}
                  />
                </PayPalScriptProvider>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-border bg-surface-secondary/50 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-tint text-accent flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      PayPal Sandbox Setup Required
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1 max-w-xs mx-auto leading-relaxed">
                      To complete live Sandbox approval, add <code className="text-accent font-mono font-semibold">PAYPAL_CLIENT_ID</code> and <code className="text-accent font-mono font-semibold">PAYPAL_CLIENT_SECRET</code> to your <code className="font-mono">.env</code> file.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-text-secondary text-center flex items-center justify-center gap-1.5 pt-1">
              <Lock className="w-3.5 h-3.5 text-status-success" />
              <span>TLS 256-bit Encrypted • Sandbox Environment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

