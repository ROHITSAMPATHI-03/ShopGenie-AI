import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  SlidersHorizontal,
  Bot,
  Laptop,
  Smartphone,
  Headphones,
  Keyboard,
  Monitor,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api, Product, ScoredProduct, CartSummary } from '../lib/api';
import { ProductCard } from '../features/products/ProductCard';
import { ProductDetailsModal } from '../features/products/ProductDetailsModal';
import { AssistantPanel, ChatMessage } from '../features/assistant/AssistantPanel';
import { ComparisonTray } from '../features/comparison/ComparisonTray';
import { ComparisonModal } from '../features/comparison/ComparisonModal';
import { CartDrawer } from '../features/cart/CartDrawer';
import { Navbar } from '../components/Navbar';

export const HomePage: React.FC = () => {
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('rating_desc');
  const [priceRange, setPriceRange] = useState<number | undefined>(undefined);

  // Active UI modal & drawer states
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartSummary | null>(null);

  // Assistant / Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(false);
  const [scoredPicksMap, setScoredPicksMap] = useState<Map<string, ScoredProduct>>(new Map());

  // Hero input state
  const [heroInput, setHeroInput] = useState('');

  // 1. Initial Data Fetch
  const loadCatalogue = () => {
    setLoadingProducts(true);
    api.getProducts({
      category: selectedCategory,
      q: searchQuery,
      sort: sortOption,
      maxPrice: priceRange,
    })
      .then((res) => {
        setProducts(res.products);
        setTotalProducts(res.total);
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoadingProducts(false);
      });
  };

  const loadCart = () => {
    api.getCart()
      .then((res) => setCart(res.cart))
      .catch((err) => console.warn('Failed to load cart:', err));
  };

  useEffect(() => {
    loadCatalogue();
  }, [selectedCategory, searchQuery, sortOption, priceRange]);

  useEffect(() => {
    loadCart();
  }, []);

  // 2. Chat & AI Handling
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);
    setActiveActivity('Searching catalogue & ranking by specifications...');
    setIsAssistantExpanded(true);

    try {
      const response = await api.sendChatMessage(text);

      // Hydrate scored products map for visual badge alignment
      if (response.scoredProducts && response.scoredProducts.length > 0) {
        setScoredPicksMap((prev) => {
          const next = new Map(prev);
          response.scoredProducts!.forEach((sp) => next.set(sp.product.id, sp));
          return next;
        });
      }

      // If cart was mutated by assistant
      if (response.cart) {
        setCart(response.cart);
      }

      // If comparison was triggered
      if (response.comparison) {
        setComparedProducts(response.comparison.products);
        setIsCompareModalOpen(true);
      }

      const assistantMessage: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: response.message,
        activities: response.activities,
        productCards: response.productCards,
        scoredProducts: response.scoredProducts,
        actions: response.actions,
        mode: response.mode,
        unconfiguredReason: response.unconfiguredReason,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: err.message || 'Unable to consult the assistant at this time. You can continue browsing the verified catalogue below.',
        mode: 'deterministic_fallback',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
      setActiveActivity(null);
    }
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroInput.trim()) return;
    handleSendMessage(heroInput.trim());
    setHeroInput('');
  };

  // 3. Cart Actions
  const handleAddToCart = async (product: Product) => {
    try {
      const res = await api.addToCart(product.id, 1);
      setCart(res.cart);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleUpdateCartQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await api.updateCartQuantity(cartItemId, quantity);
      setCart(res.cart);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      const res = await api.removeFromCart(cartItemId);
      setCart(res.cart);
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await api.clearCart();
      setCart(res.cart);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  // 4. Comparison Actions
  const handleToggleCompare = (product: Product) => {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 products simultaneously.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const categories = [
    { id: 'all', label: 'All Catalogue', icon: null, count: 28 },
    { id: 'laptops', label: 'Laptops', icon: Laptop, count: 8 },
    { id: 'phones', label: 'Phones', icon: Smartphone, count: 6 },
    { id: 'headphones', label: 'Headphones', icon: Headphones, count: 6 },
    { id: 'keyboards', label: 'Keyboards', icon: Keyboard, count: 4 },
    { id: 'monitors', label: 'Monitors', icon: Monitor, count: 4 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <Navbar
        cartCount={cart?.itemCount || 0}
        onOpenCart={() => setIsCartOpen(true)}
        compareCount={comparedProducts.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
      />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Above the fold: Workspace Hero & Search Input */}
        <section className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-card relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-tint text-accent text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Your Personal Shopping Agent</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
              Less searching. <span className="text-accent">Better choices.</span>
            </h1>

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Describe your need in natural language. We search a verified catalogue, rank products with deterministic criteria, explain honest trade-offs, and you approve the purchase.
            </p>

            {/* Unified Hero Shopping Input */}
            <form onSubmit={handleHeroSubmit} className="pt-2">
              <div className="flex items-center gap-2 p-2 pl-4 rounded-2xl border border-border bg-surface-secondary/50 focus-within:border-accent focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent/20 transition-all shadow-subtle">
                <Search className="w-5 h-5 text-text-secondary shrink-0" />
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="I am a college student. Find me a laptop under ₹50,000 for programming with good battery life..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!heroInput.trim() || chatLoading}
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs sm:text-sm hover:bg-accent-hover disabled:opacity-40 transition-all shrink-0 flex items-center gap-1.5 shadow-subtle"
                >
                  <span>Ask Genie</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Example Request Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-text-secondary font-medium">Try asking:</span>
              {[
                'Laptop under ₹50,000',
                'Headphones with great battery',
                'Phone for everyday photography',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setHeroInput(chip);
                    handleSendMessage(chip);
                  }}
                  className="px-3 py-1 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs text-text-primary hover:text-accent font-medium transition-colors"
                >
                  "{chip}"
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Category Pills & Filter Bar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-text-primary text-white border-text-primary shadow-subtle'
                        : 'bg-surface text-text-secondary border-border hover:text-text-primary hover:bg-surface-secondary'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-surface-secondary text-text-secondary'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort & Quick Search */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="pl-3 pr-8 py-2 rounded-xl border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none cursor-pointer"
                >
                  <option value="rating_desc">Top Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name A-Z</option>
                </select>
                <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Mobile Assistant Toggle */}
              <button
                onClick={() => setIsAssistantExpanded(!isAssistantExpanded)}
                className={`lg:hidden px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isAssistantExpanded
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface text-text-primary border-border'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Concierge</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Workspace Layout: 2/3 Catalogue Grid + 1/3 Assistant Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Results Area (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between text-xs text-text-secondary px-1">
              <span>
                Showing <strong className="text-text-primary">{products.length}</strong> verified sample products
              </span>
              <span>All prices listed in Indian Rupees (₹)</span>
            </div>

            {loadingProducts ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <p className="text-xs text-text-secondary">Loading catalogue products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 rounded-3xl border border-border bg-surface text-center space-y-3">
                <h3 className="font-semibold text-text-primary text-base">No matching products found</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Try clearing your search query or adjusting your filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {products.map((product) => {
                  const scoredInfo = scoredPicksMap.get(product.id);
                  const isCompared = comparedProducts.some((p) => p.id === product.id);

                  let badge: 'Best fit' | 'Best value' | undefined = undefined;
                  if (scoredInfo && scoredInfo.overallScore >= 85) {
                    badge = 'Best fit';
                  }

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      scoredInfo={scoredInfo}
                      isCompared={isCompared}
                      onToggleCompare={handleToggleCompare}
                      onAddToCart={handleAddToCart}
                      onViewDetails={(p) => setDetailProduct(p)}
                      badge={badge}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Assistant Panel (4 cols on desktop, toggled or sticky on mobile) */}
          <div className={`lg:col-span-4 ${isAssistantExpanded ? 'block' : 'hidden lg:block'} sticky top-24`}>
            <AssistantPanel
              messages={messages}
              loading={chatLoading}
              activeActivity={activeActivity}
              onSendMessage={handleSendMessage}
              onAddToCart={handleAddToCart}
              onViewProduct={(p) => setDetailProduct(p)}
              onQuickAction={(actionText) => {
                if (actionText.toLowerCase().includes('proceed to checkout')) {
                  setIsCartOpen(true);
                } else {
                  handleSendMessage(actionText);
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Sticky Comparison Tray */}
      <ComparisonTray
        comparedProducts={comparedProducts}
        onRemove={(id) => setComparedProducts((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setComparedProducts([])}
        onOpenCompare={() => setIsCompareModalOpen(true)}
      />

      {/* Full Comparison Modal */}
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
          onToggleCompare={handleToggleCompare}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </div>
  );
};

