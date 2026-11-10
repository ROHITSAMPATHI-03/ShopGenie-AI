import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  ShoppingCart,
  Scale,
  RefreshCw,
  GitFork,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api, Product, ScoredProduct, CartSummary, ComparisonResult } from '../lib/api';
import { AssistantPanel, ChatMessage } from '../features/assistant/AssistantPanel';
import { CartDrawer } from '../features/cart/CartDrawer';
import { ComparisonModal } from '../features/comparison/ComparisonModal';
import { ProductDetailsModal } from '../features/products/ProductDetailsModal';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();

  // Assistant / Chat state
  const getInitialConversationId = () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('shopgenie_conv_id') : null;
    if (stored) return stored;
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== 'undefined') localStorage.setItem('shopgenie_conv_id', newId);
    return newId;
  };

  const [conversationId, setConversationId] = useState<string>(getInitialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [cartHint, setCartHint] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cart & Comparison states
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Load initial cart and previous session chat history
    api.getCart()
      .then((res) => setCart(res.cart))
      .catch((err) => console.warn('Failed to load cart:', err));

    api.getChatHistory(conversationId)
      .then((res) => {
        if (res.messages && res.messages.length > 0) {
          const loaded: ChatMessage[] = res.messages.map((m: any) => ({
            id: m.id,
            sender: m.role,
            text: m.content,
            timestamp: m.created_at,
          }));
          setMessages(loaded);
        }
      })
      .catch((err) => console.warn('Failed to load history:', err));
  }, [conversationId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || chatLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);
    setActiveActivity('Consulting verified catalogue...');

    try {
      const response = await api.chat(text, conversationId);

      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: response.message,
        activities: response.activities,
        productCards: response.productCards,
        scoredProducts: response.scoredProducts,
        comparison: response.comparison,
        actions: response.actions,
        mode: response.mode,
        unconfiguredReason: response.unconfiguredReason,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If backend updated cart during the agent conversation
      if (response.cart) {
        setCart(response.cart);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text:
          err.message ||
          'Unable to reach assistant. You can continue exploring verified electronics in the catalogue.',
        mode: 'deterministic_fallback',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
      setActiveActivity(null);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleNewChat = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setChatLoading(false);
    setActiveActivity(null);

    try {
      await api.resetConversation(conversationId);
    } catch (err) {
      console.warn('Reset conversation error:', err);
    }

    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== 'undefined') localStorage.setItem('shopgenie_conv_id', newId);
    setConversationId(newId);
    setMessages([]);
    setCartHint('Your cart is kept.');
    setTimeout(() => setCartHint(null), 4000);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await api.addToCart(product.id, 1);
      setCart(res.cart);
      setIsCartOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await api.updateCartQuantity(itemId, quantity);
      setCart(res.cart);
    } catch (err: any) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      const res = await api.removeFromCart(itemId);
      setCart(res.cart);
    } catch (err: any) {
      console.error('Failed to remove item:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0906] text-[#F5EFE6] selection:bg-[#FFB020]/30 selection:text-[#FFB020] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0906]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-[#FFB020] text-xs font-mono font-semibold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFB020] to-[#FF7A1A] text-[#0B0906] flex items-center justify-center shadow-[0_0_12px_rgba(255,176,32,0.3)]">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-[#F5EFE6]">
                  ShopGenie AI <span className="text-[#FFB020] font-serif italic text-xs font-normal">Concierge</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Nav & Cart Trigger */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/products"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#A39A8C] hover:text-[#F5EFE6] transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Browse Catalogue</span>
            </Link>

            <Link
              to="/system-map"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#A39A8C] hover:text-[#FFB020] transition-all flex items-center gap-1.5"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">System Map</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative min-w-[40px] min-h-[40px] p-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#FFB020]/40 text-[#F5EFE6] transition-all flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4 text-[#F5EFE6]" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-[#FFB020] to-[#FF7A1A] text-[#0B0906] text-[11px] font-bold font-mono flex items-center justify-center shadow-md">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main AI Chat Content */}
      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
        {/* Assistant Panel Component (Full width dedicated layout) */}
        <div className="flex-1 flex flex-col">
          <AssistantPanel
            messages={messages}
            loading={chatLoading}
            activeActivity={activeActivity}
            onSendMessage={handleSendMessage}
            onAddToCart={handleAddToCart}
            onViewProduct={(prod) => setDetailProduct(prod)}
            onQuickAction={handleSendMessage}
            onNewChat={handleNewChat}
            cartHint={cartHint}
            onOpenFullComparison={(comp) => {
              setComparedProducts(comp.products);
              setIsCompareModalOpen(true);
            }}
          />
        </div>
      </main>

      {/* Bottom Context Info Strip */}
      <footer className="border-t border-white/10 bg-[#0B0906]/80 py-3 px-4 text-center text-xs font-mono text-[#A39A8C]">
        <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Autonomous discovery • Human-approved checkout</span>
          <span className="text-[#FFB020]">Zero-Trust Boundary: AI cannot touch funds or alter prices</span>
        </div>
      </footer>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={async () => {
          await api.clearCart();
          setCart(null);
        }}
      />

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <ComparisonModal
          products={comparedProducts}
          onClose={() => setIsCompareModalOpen(false)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Product Details Modal */}
      {detailProduct && (
        <ProductDetailsModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={handleAddToCart}
          isCompared={comparedProducts.some((p) => p.id === detailProduct.id)}
          onToggleCompare={(prod) => {
            setComparedProducts((prev) =>
              prev.some((p) => p.id === prod.id) ? prev.filter((p) => p.id !== prod.id) : [...prev, prod]
            );
          }}
        />
      )}
    </div>
  );
};
