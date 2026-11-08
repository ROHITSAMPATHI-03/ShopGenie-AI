import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShoppingBag, ArrowRight, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api, Order } from '../../lib/api';
import { formatInr, formatUsd, formatDate } from '../../lib/formatters';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.getOrderHistory()
      .then((res) => {
        setOrders(res.orders);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Your Order History</h1>
          <p className="text-xs text-text-secondary mt-1">
            Session-scoped purchase history and payment verification records
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-xs text-text-secondary">Loading order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 rounded-3xl border border-border bg-surface text-center space-y-4 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-surface-secondary flex items-center justify-center mx-auto text-text-secondary">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-base">No orders placed yet</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              Any completed or pending checkout attempts during this session will be preserved here across refreshes.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.status === 'paid';
            const isCancelled = order.status === 'cancelled';
            const isPending = order.status === 'pending';

            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 rounded-3xl border border-border bg-surface shadow-card hover:border-accent/40 transition-all space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs sm:text-sm text-text-primary">
                      {order.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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

                  <span className="text-xs text-text-secondary">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Items Snapshot List */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-text-secondary">
                      <span className="text-text-primary font-medium truncate max-w-md">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="tabular-nums font-semibold text-text-primary">
                        {formatInr(item.itemTotalInr)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Totals & Detail Link */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-text-secondary flex items-center gap-2">
                    <span>Charged:</span>
                    <span className="font-bold text-text-primary tabular-nums">
                      {formatInr(order.totalInr)}
                    </span>
                    <span>({formatUsd(order.chargeAmountUsd)} {order.chargeCurrency})</span>
                    {order.payment?.paypalCaptureId && (
                      <span className="text-[10px] font-mono text-text-secondary hidden sm:inline">
                        • Capture: {order.payment.paypalCaptureId}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                  >
                    <span>View Receipt & Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

