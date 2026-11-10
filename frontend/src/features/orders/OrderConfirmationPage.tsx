import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, Printer } from 'lucide-react';
import { api, Order } from '../../lib/api';
import { formatInr, formatUsd, formatDate } from '../../lib/formatters';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api.getOrderById(id)
      .then((res) => {
        setOrder(res.order);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Order not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0906] flex flex-col items-center justify-center space-y-3 text-[#F5EFE6]">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin" />
        <p className="text-sm font-mono text-[#A39A8C]">Retrieving verified order snapshot...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0B0906] flex flex-col items-center justify-center text-center px-4 space-y-4 text-[#F5EFE6]">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-[#F87171] border border-red-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-serif text-[#F5EFE6]">Order Not Found</h2>
        <p className="text-sm text-[#A39A8C]">{error || 'This order does not exist or does not belong to your session.'}</p>
        <Link
          to="/"
          className="inline-flex px-6 py-2.5 rounded-xl btn-amber text-xs font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const isPaid = order.status === 'paid';
  const isCancelled = order.status === 'cancelled';
  const isPending = order.status === 'pending';
  const isFailed = order.status === 'failed';

  return (
    <div className="min-h-screen bg-[#0B0906] text-[#F5EFE6] py-12 px-4 sm:px-6">
      <div className="max-w-[800px] mx-auto">
        <div className="glass-card p-6 sm:p-9 space-y-8">
          {/* Status Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            {isPaid && (
              <div className="w-16 h-16 rounded-3xl bg-[#4ADE80]/15 text-[#4ADE80] flex items-center justify-center shadow-[0_0_25px_rgba(74,222,128,0.25)] border border-[#4ADE80]/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            )}
            {isCancelled && (
              <div className="w-16 h-16 rounded-3xl bg-white/10 text-[#A39A8C] flex items-center justify-center border border-white/15">
                <Clock className="w-9 h-9" />
              </div>
            )}
            {isPending && (
              <div className="w-16 h-16 rounded-3xl bg-[#FFB020]/15 text-[#FFB020] flex items-center justify-center shadow-[0_0_25px_rgba(255,176,32,0.25)] border border-[#FFB020]/30">
                <Clock className="w-9 h-9" />
              </div>
            )}
            {isFailed && (
              <div className="w-16 h-16 rounded-3xl bg-red-500/15 text-[#F87171] flex items-center justify-center border border-red-500/30">
                <XCircle className="w-9 h-9" />
              </div>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5EFE6] tracking-tight">
                {isPaid && 'Payment Verified & Approved!'}
                {isCancelled && 'Order Checkout Cancelled'}
                {isPending && 'Payment Approval Pending'}
                {isFailed && 'Payment Capture Failed'}
              </h1>
              <p className="text-xs sm:text-sm text-[#A39A8C] mt-1 max-w-md mx-auto leading-relaxed">
                {isPaid && 'Thank you for your purchase. Your order has been securely verified and recorded.'}
                {isCancelled && 'This transaction was cancelled before capture. Your cart was preserved.'}
                {isPending && 'This order has been prepared and is waiting for payment approval.'}
                {isFailed && 'The payment could not be captured by the payment gateway.'}
              </p>
            </div>
          </div>

          {/* Transaction Summary Card */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#A39A8C] uppercase tracking-wider block text-[10px]">Internal Order ID</span>
              <span className="font-bold text-[#F5EFE6] text-xs mt-0.5 block truncate">
                {order.id}
              </span>
            </div>

            <div>
              <span className="text-[#A39A8C] uppercase tracking-wider block text-[10px]">Date & Time</span>
              <span className="font-medium text-[#F5EFE6] text-xs mt-0.5 block">
                {formatDate(order.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-[#A39A8C] uppercase tracking-wider block text-[10px]">Status</span>
              <span
                className={`inline-block px-2 py-0.5 mt-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${isPaid
                    ? 'bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30'
                    : isCancelled
                      ? 'bg-white/10 text-[#A39A8C] border border-white/15'
                      : isPending
                        ? 'bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30'
                        : 'bg-red-500/15 text-[#F87171] border border-red-500/30'
                  }`}
              >
                {order.status}
              </span>
            </div>

            <div>
              <span className="text-[#A39A8C] uppercase tracking-wider block text-[10px]">PayPal Capture ID</span>
              <span className="font-semibold text-[#FFB020] text-xs mt-0.5 block truncate">
                {order.payment?.paypalCaptureId || 'None (Uncaptured)'}
              </span>
            </div>
          </div>

          {/* Item Snapshots */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A39A8C]">
              Purchased Item Snapshot ({order.items.length})
            </h3>

            <div className="divide-y divide-white/10 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-[#F5EFE6] text-sm">{item.name}</h4>
                    <span className="text-[#A39A8C] font-mono">
                      Quantity: {item.quantity} × {formatInr(item.unitPriceInr)}
                    </span>
                  </div>
                  <span className="font-bold font-mono text-[#F5EFE6] tabular-nums text-sm">
                    {formatInr(item.itemTotalInr)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exact Financials */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#A39A8C]">
              <span>Catalogue Total</span>
              <span className="font-bold text-[#F5EFE6] tabular-nums text-sm">
                {formatInr(order.totalInr)}
              </span>
            </div>
            <div className="flex justify-between text-[#A39A8C] pt-1 border-t border-white/10">
              <span>Amount Charged in Sandbox</span>
              <span className="font-bold text-[#FFB020] tabular-nums text-sm">
                {formatUsd(order.chargeAmountUsd)} {order.chargeCurrency}
              </span>
            </div>
            <div className="text-[10px] text-[#A39A8C] pt-1">
              Conversion Rate applied: ₹1 = ${order.inrToUsdRate} USD
            </div>
          </div>

          {/* Action Controls */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                to="/orders"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-xs font-mono font-semibold text-[#F5EFE6] hover:bg-white/[0.06] transition-colors text-center"
              >
                View Order History
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Print or save as PDF receipt"
                className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-[#FFB020]/40 bg-[#FFB020]/10 hover:bg-[#FFB020]/20 text-[#FFB020] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="Print or save as PDF receipt"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/"
                className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono font-semibold flex items-center justify-center transition-all"
              >
                <span>Home</span>
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] rounded-xl btn-amber text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,176,32,0.3)]"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Clean Single-Page A4 Printable Receipt (Visible only during window.print()) */}
        <div className="print-only text-black bg-white p-2 font-sans">
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-5 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">ShopGenie AI</h1>
              <p className="text-xs text-gray-600 mt-0.5">Autonomous discovery. Human-approved purchase.</p>
              <p className="text-xs text-gray-500">https://shopgenie.local</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase tracking-wider text-black">Order Receipt</h2>
              <p className="text-xs font-mono font-semibold text-gray-800 mt-1">Order #{order.id}</p>
              <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-5 p-3.5 border border-gray-300 rounded-lg bg-gray-50 text-xs">
            <div className="space-y-1">
              <p><span className="font-semibold text-gray-700">Order ID:</span> {order.id}</p>
              <p><span className="font-semibold text-gray-700">Date & Time:</span> {formatDate(order.createdAt)}</p>
              <p>
                <span className="font-semibold text-gray-700">Payment Status:</span>{' '}
                <span className="font-bold uppercase tracking-wide">{order.status}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p><span className="font-semibold text-gray-700">Payment Gateway:</span> PayPal Sandbox (Orders v2)</p>
              <p><span className="font-semibold text-gray-700">PayPal Capture ID:</span> {order.payment?.paypalCaptureId || 'N/A'}</p>
              <p><span className="font-semibold text-gray-700">Exchange Rate:</span> ₹1 = ${order.inrToUsdRate} USD</p>
            </div>
          </div>

          {/* Purchased Items Table */}
          <table className="w-full text-left text-xs mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100">
                <th className="py-2.5 px-3 font-bold text-gray-900">Item Description</th>
                <th className="py-2.5 px-3 text-center font-bold text-gray-900">Qty</th>
                <th className="py-2.5 px-3 text-right font-bold text-gray-900">Unit Price</th>
                <th className="py-2.5 px-3 text-right font-bold text-gray-900">Item Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{item.name}</td>
                  <td className="py-2.5 px-3 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-gray-700">{formatInr(item.unitPriceInr)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-gray-900">{formatInr(item.itemTotalInr)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals Calculation */}
          <div className="flex justify-end mb-8">
            <div className="w-72 text-xs space-y-1.5 border-t border-gray-300 pt-2.5">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal (INR):</span>
                <span className="tabular-nums font-medium">{formatInr(order.subtotalInr)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping:</span>
                <span className="font-medium text-green-700">{order.shippingInr > 0 ? formatInr(order.shippingInr) : 'FREE (Standard Ground)'}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Estimated Taxes (GST):</span>
                <span className="tabular-nums font-medium">{order.taxInr > 0 ? formatInr(order.taxInr) : 'Included in Price'}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t-2 border-black pt-2 text-black">
                <span>Grand Total (INR):</span>
                <span className="tabular-nums">{formatInr(order.totalInr)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-800 font-semibold pt-1 border-t border-gray-200">
                <span>Total Charged (USD):</span>
                <span className="tabular-nums">{formatUsd(order.chargeAmountUsd)} {order.chargeCurrency}</span>
              </div>
            </div>
          </div>

          {/* Footer & Sandbox Disclosure */}
          <div className="border-t border-gray-300 pt-4 text-center space-y-1 text-xs text-gray-500">
            <p className="font-bold text-gray-800 uppercase tracking-wide">
              Notice: This is a PayPal Sandbox test transaction. No real money was charged.
            </p>
            <p className="text-[11px] text-gray-500">
              Generated by ShopGenie AI Hackathon Verification Engine • Session: {order.sessionId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
