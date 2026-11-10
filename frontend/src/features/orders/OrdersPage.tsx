import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShoppingBag, ArrowRight, CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowLeft, Printer } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0B0906] text-[#F5EFE6] py-10 px-4 sm:px-6">
      <div className="max-w-[1100px] mx-auto space-y-8">
        {/* Navigation & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#A39A8C] hover:text-[#FFB020] transition-colors min-h-[44px] py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <span className="text-white/20">•</span>
              <Link
                to="/products"
                className="text-xs font-mono text-[#A39A8C] hover:text-[#FFB020] transition-colors"
              >
                Catalogue
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5EFE6] tracking-tight">Your Order History</h1>
            <p className="text-xs font-mono text-[#A39A8C] mt-1">
              Session-scoped purchase history and payment verification records
            </p>
          </div>

          <button
            onClick={fetchOrders}
            aria-label="Refresh orders"
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.08] transition-colors flex items-center justify-center self-start sm:self-auto"
            title="Refresh orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#FFB020] border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-[#A39A8C]">Loading order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 rounded-3xl glass-card text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#A39A8C]">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-semibold font-serif text-lg text-[#F5EFE6]">No orders placed yet</h3>
              <p className="text-xs text-[#A39A8C] mt-1 max-w-sm mx-auto leading-relaxed">
                Any completed or pending checkout attempts during this session will be preserved here across refreshes.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex px-6 py-2.5 rounded-xl btn-amber text-xs font-semibold"
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
                  className="p-5 sm:p-6 rounded-3xl glass-card space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs sm:text-sm text-[#F5EFE6]">
                        {order.id}
                      </span>
                      {/* Status Badges with color + icon + text */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30'
                            : isCancelled
                            ? 'bg-white/10 text-[#A39A8C] border border-white/15'
                            : isPending
                            ? 'bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30'
                            : 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30'
                        }`}
                      >
                        {isPaid && <CheckCircle2 className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        {isCancelled && <XCircle className="w-3 h-3" />}
                        <span>{order.status}</span>
                      </span>
                    </div>

                    <span className="text-xs font-mono text-[#A39A8C]">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Items Snapshot List */}
                  <div className="space-y-2 font-mono">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-[#A39A8C]">
                        <span className="text-[#F5EFE6] font-medium truncate max-w-md font-sans">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="tabular-nums font-semibold text-[#F5EFE6]">
                          {formatInr(item.itemTotalInr)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Totals & Detail Link */}
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                    <div className="text-xs text-[#A39A8C] flex items-center gap-2 flex-wrap">
                      <span>Charged:</span>
                      <span className="font-bold text-[#F5EFE6] tabular-nums">
                        {formatInr(order.totalInr)}
                      </span>
                      <span className="text-[#FFB020]">({formatUsd(order.chargeAmountUsd)} {order.chargeCurrency})</span>
                      {order.payment?.paypalCaptureId && (
                        <span className="text-[10px] text-[#A39A8C] hidden sm:inline">
                          • Capture ID: {order.payment.paypalCaptureId}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFB020] hover:underline transition-colors min-h-[44px] py-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Receipt & Verification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
