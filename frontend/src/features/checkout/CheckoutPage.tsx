import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Info,
  Lock,
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
      <div className="min-h-screen bg-[#0B0906] flex flex-col items-center justify-center space-y-3 text-[#F5EFE6]">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin" />
        <p className="text-sm font-mono text-[#A39A8C]">Preparing secure checkout session...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0906] flex flex-col items-center justify-center text-center px-4 space-y-4 text-[#F5EFE6]">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A39A8C]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-[#F5EFE6]">Your cart is empty</h2>
        <p className="text-sm text-[#A39A8C] max-w-sm">
          Please add items to your shopping cart before initiating checkout.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl btn-amber text-xs font-semibold"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isPayPalConfigured = Boolean(paypalConfig?.isConfigured && paypalConfig?.clientId);

  return (
    <div className="min-h-screen bg-[#0B0906] text-[#F5EFE6] py-10 px-4 sm:px-6">
      <div className="max-w-[1100px] mx-auto space-y-6">
        {/* Back button */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#A39A8C] hover:text-[#FFB020] transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Calm, plain, high-contrast checkout layout (strictly no glow or tilt as requested) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Col: Order Review & Items */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#14120E] rounded-3xl border border-white/10 p-6 sm:p-7 space-y-6 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-xl font-bold font-serif text-[#F5EFE6] tracking-tight">Review Order</h1>
                  <p className="text-xs text-[#A39A8C] mt-0.5 font-mono">
                    Confirm your items before proceeding to PayPal approval
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-semibold text-[#A39A8C]">
                  {cart.itemCount} item(s)
                </div>
              </div>

              {/* Item List */}
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-white/[0.04] p-1.5 border border-white/10 shrink-0 flex items-center justify-center">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase font-semibold text-[#A39A8C]">
                          {item.product.brand}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#F5EFE6] truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-xs font-mono text-[#A39A8C]">
                          Qty: {item.quantity} × {formatInr(item.product.price_inr)}
                        </span>
                      </div>
                    </div>

                    <span className="text-sm font-bold font-mono text-[#F5EFE6] tabular-nums shrink-0">
                      {formatInr(item.itemTotalInr)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trust Disclosures */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-[#A39A8C]">
                <div className="flex items-center gap-2 font-semibold text-[#F5EFE6]">
                  <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
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
            <div className="bg-[#14120E] rounded-3xl border border-white/10 p-6 sm:p-7 space-y-6 shadow-md sticky top-24">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#F5EFE6] tracking-tight">Payment Summary</h2>
                <span className="text-xs font-mono text-[#A39A8C]">
                  Exact currency amounts frozen for this transaction
                </span>
              </div>

              {/* Amounts Table */}
              <div className="space-y-2.5 text-xs font-mono">
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
                  <div>
                    <span className="text-sm font-bold text-[#F5EFE6] font-sans block">INR Total</span>
                    <span className="text-[10px] text-[#A39A8C]">Catalogue Currency</span>
                  </div>
                  <span className="text-xl font-bold text-[#F5EFE6] tabular-nums">
                    {formatInr(cart.totalInr)}
                  </span>
                </div>

                {/* Disclosed USD Sandbox Charge */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#FFB020] block">USD Sandbox Charge</span>
                    <span className="text-[10px] text-[#A39A8C]">
                      Fixed Demo Rate: ₹1 = ${cart.inrToUsdRate} USD
                    </span>
                  </div>
                  <span className="text-lg font-bold text-[#FFB020] tabular-nums">
                    {formatUsd(cart.chargeAmountUsd)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#F87171] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Cancel Notice */}
              {cancelNotice && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#FFB020] text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Payment was cancelled</span>
                    <p className="mt-0.5 text-[#A39A8C]">Your cart is still saved and intact. You can retry when ready.</p>
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
                  <div className="p-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-[#FFB020] flex items-center justify-center mx-auto">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F5EFE6] uppercase tracking-wider font-mono">
                        PayPal Sandbox Setup Required
                      </h4>
                      <p className="text-[11px] text-[#A39A8C] mt-1 max-w-xs mx-auto leading-relaxed">
                        To complete live Sandbox approval, add <code className="text-[#FFB020] font-mono font-semibold">PAYPAL_CLIENT_ID</code> and <code className="text-[#FFB020] font-mono font-semibold">PAYPAL_CLIENT_SECRET</code> to your <code className="font-mono">.env</code> file.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] font-mono text-[#A39A8C] text-center flex items-center justify-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>TLS 256-bit Encrypted • Sandbox Environment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
