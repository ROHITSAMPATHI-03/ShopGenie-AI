import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
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
      <div className="max-w-[1360px] mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <p className="text-sm text-text-secondary">Retrieving verified order snapshot...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-status-error flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Order Not Found</h2>
        <p className="text-sm text-text-secondary">{error || 'This order does not exist or does not belong to your session.'}</p>
        <Link
          to="/"
          className="inline-flex px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
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
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10">
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card space-y-8">
        {/* Status Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {isPaid && (
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-status-success flex items-center justify-center shadow-subtle border border-emerald-100">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          )}
          {isCancelled && (
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-subtle border border-amber-100">
              <Clock className="w-9 h-9" />
            </div>
          )}
          {isPending && (
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-accent flex items-center justify-center shadow-subtle border border-blue-100">
              <Clock className="w-9 h-9" />
            </div>
          )}
          {isFailed && (
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-status-error flex items-center justify-center shadow-subtle border border-red-100">
              <XCircle className="w-9 h-9" />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {isPaid && 'Payment Verified & Approved!'}
              {isCancelled && 'Order Checkout Cancelled'}
              {isPending && 'Payment Approval Pending'}
              {isFailed && 'Payment Capture Failed'}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {isPaid && 'Thank you for your purchase. Your order has been securely recorded.'}
              {isCancelled && 'This transaction was cancelled before capture. Your cart was preserved.'}
              {isPending && 'This order has been prepared and is waiting for payment approval.'}
              {isFailed && 'The payment could not be captured by the payment gateway.'}
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-5 rounded-2xl bg-surface-secondary/50 border border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-text-secondary uppercase tracking-wider block text-[10px]">Internal Order ID</span>
            <span className="font-mono font-bold text-text-primary text-xs mt-0.5 block truncate">
              {order.id}
            </span>
          </div>

          <div>
            <span className="text-text-secondary uppercase tracking-wider block text-[10px]">Date & Time</span>
            <span className="font-medium text-text-primary text-xs mt-0.5 block">
              {formatDate(order.createdAt)}
            </span>
          </div>

          <div>
            <span className="text-text-secondary uppercase tracking-wider block text-[10px]">Status</span>
            <span
              className={`inline-block px-2 py-0.5 mt-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                isPaid
                  ? 'bg-emerald-100 text-status-success'
                  : isCancelled
                  ? 'bg-amber-100 text-amber-800'
                  : isPending
                  ? 'bg-blue-100 text-accent'
                  : 'bg-red-100 text-status-error'
              }`}
            >
              {order.status}
            </span>
          </div>

          <div>
            <span className="text-text-secondary uppercase tracking-wider block text-[10px]">PayPal Capture ID</span>
            <span className="font-mono font-semibold text-text-primary text-xs mt-0.5 block truncate">
              {order.payment?.paypalCaptureId || 'None (Uncaptured)'}
            </span>
          </div>
        </div>

        {/* Item Snapshots */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Purchased Item Snapshot ({order.items.length})
          </h3>

          <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-surface">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-semibold text-text-primary text-sm">{item.name}</h4>
                  <span className="text-text-secondary">
                    Quantity: {item.quantity} × {formatInr(item.unitPriceInr)}
                  </span>
                </div>
                <span className="font-bold text-text-primary tabular-nums text-sm">
                  {formatInr(item.itemTotalInr)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Exact Financials */}
        <div className="p-4 rounded-2xl bg-surface-secondary/40 border border-border space-y-2 text-xs">
          <div className="flex justify-between text-text-secondary">
            <span>Catalogue Total</span>
            <span className="font-bold text-text-primary tabular-nums text-sm">
              {formatInr(order.totalInr)}
            </span>
          </div>
          <div className="flex justify-between text-text-secondary pt-1 border-t border-border">
            <span>Amount Charged in Sandbox</span>
            <span className="font-bold text-accent tabular-nums text-sm">
              {formatUsd(order.chargeAmountUsd)} {order.chargeCurrency}
            </span>
          </div>
          <div className="text-[10px] text-text-secondary pt-1">
            Conversion Rate applied: 1 INR = {order.inrToUsdRate} USD
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-surface-secondary transition-colors text-center"
          >
            View Order History
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover shadow-subtle transition-all flex items-center justify-center gap-2"
          >
            <span>Back to Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

