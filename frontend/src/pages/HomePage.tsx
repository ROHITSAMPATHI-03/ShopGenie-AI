import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Search,
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
  Scale,
  Battery,
  Cpu,
  Star,
} from 'lucide-react';
import { api, Product, ScoredProduct, CartSummary, ComparisonResult } from '../lib/api';
import { ProductCard } from '../features/products/ProductCard';
import { ProductDetailsModal } from '../features/products/ProductDetailsModal';
import { AssistantPanel, ChatMessage } from '../features/assistant/AssistantPanel';
import { ComparisonTray } from '../features/comparison/ComparisonTray';
import { ComparisonModal } from '../features/comparison/ComparisonModal';
import { CartDrawer } from '../features/cart/CartDrawer';
import { Navbar } from '../components/Navbar';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Filters state with URL query string persistence
  const [selectedCategory, setSelectedCategory] = useState<string>(() => searchParams.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>(() => searchParams.get('brand') || 'all');
  const [selectedRam, setSelectedRam] = useState<string>(() => searchParams.get('ram') || 'all');
  const [selectedCpu, setSelectedCpu] = useState<string>(() => searchParams.get('cpu') || 'all');
  const [selectedScreen, setSelectedScreen] = useState<string>(() => searchParams.get('screen') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('q') || '');
  const [sortOption, setSortOption] = useState<string>(() => searchParams.get('sort') || 'rating_desc');
  const [priceRange, setPriceRange] = useState<number | undefined>(() => {
    const b = searchParams.get('budget');
    return b ? parseInt(b, 10) : undefined;
  });

  // Active UI modal & drawer states
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartSummary | null>(null);

  // Assistant / Chat state
  const getInitialConversationId = () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('shopgenie_conv_id') : null;
    if (stored) return stored;
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== 'undefined') localStorage.setItem('shopgenie_conv_id', newId);
    return newId;
  };

  const [conversationId, setConversationId] = useState<string>(getInitialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [cartHint, setCartHint] = useState<string | null>(null);
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(false);
  const [scoredPicksMap, setScoredPicksMap] = useState<Map<string, ScoredProduct>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hero input state
  const [heroInput, setHeroInput] = useState('');

  // Sync state to URL Query Parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (priceRange) params.set('budget', priceRange.toString());
    if (selectedBrand && selectedBrand !== 'all') params.set('brand', selectedBrand);
    if (selectedRam && selectedRam !== 'all') params.set('ram', selectedRam);
    if (selectedCpu && selectedCpu !== 'all') params.set('cpu', selectedCpu);
    if (selectedScreen && selectedScreen !== 'all') params.set('screen', selectedScreen);
    if (searchQuery) params.set('q', searchQuery);
    if (sortOption && sortOption !== 'rating_desc') params.set('sort', sortOption);

    setSearchParams(params, { replace: true });
  }, [selectedCategory, priceRange, selectedBrand, selectedRam, selectedCpu, selectedScreen, searchQuery, sortOption]);

  // 1. Initial Data Fetch
  const loadCatalogue = () => {
    setLoadingProducts(true);
    api.getProducts({
      category: selectedCategory,
      brand: selectedBrand !== 'all' ? selectedBrand : undefined,
      q: searchQuery,
      sort: sortOption,
      maxPrice: priceRange,
    })
      .then((res) => {
        setProducts(res.products);
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
  }, [selectedCategory, selectedBrand, searchQuery, sortOption, priceRange]);

  useEffect(() => {
    loadCart();
  }, []);

  // Load chat history for the active conversation
  useEffect(() => {
    api.getChatHistory(conversationId)
      .then((res) => {
        if (res.messages && res.messages.length > 0) {
          setMessages(res.messages.map((m: any) => ({
            id: m.id,
            sender: m.role === 'assistant' ? 'assistant' : 'user',
            text: m.content,
            timestamp: m.created_at,
          })));
        }
      })
      .catch((err) => console.warn('Failed to load chat history:', err));
  }, [conversationId]);

  // 2. Chat & AI Handling
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
    setActiveActivity('Searching catalogue & ranking by specifications...');
    setIsAssistantExpanded(true);

    try {
      const response = await api.sendChatMessage(text, conversationId, controller.signal);

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
        comparison: response.comparison,
        actions: response.actions,
        mode: response.mode,
        unconfiguredReason: response.unconfiguredReason,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
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

    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== 'undefined') localStorage.setItem('shopgenie_conv_id', newId);
    setConversationId(newId);
    setMessages([]);
    setCartHint('Your cart is kept.');
    setTimeout(() => setCartHint(null), 4000);
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

  // Filter products by client-side spec selections (RAM, CPU, Screen size)
  const displayedProducts = products.filter((p) => {
    // RAM filter (8, 16, 32 GB)
    if (selectedRam !== 'all') {
      const ramNum = parseInt(selectedRam, 10);
      if (p.specs?.ram_gb !== ramNum) return false;
    }
    // CPU filter (i5, i7, Ryzen 5, M2)
    if (selectedCpu !== 'all') {
      const cpuStr = (p.specs?.cpu || '').toLowerCase();
      if (!cpuStr.includes(selectedCpu.toLowerCase())) return false;
    }
    // Screen filter (13-14", 15-16")
    if (selectedScreen !== 'all') {
      const size = parseFloat(p.specs?.screen_size_inch || '0');
      if (selectedScreen === '13-14' && (size < 13 || size > 14.5)) return false;
      if (selectedScreen === '15-16' && (size < 15 || size > 16.5)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0906] text-[#F5EFE6] relative overflow-x-hidden">
      {/* Top ambient warm amber glow - restrained around the hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[480px] bg-[radial-gradient(ellipse_at_top,_rgba(255,150,30,0.22)_0%,_rgba(11,9,6,0)_70%)] pointer-events-none animate-glow-drift z-0" />

      {/* Top Navigation */}
      <Navbar
        cartCount={cart?.itemCount || 0}
        onOpenCart={() => setIsCartOpen(true)}
        compareCount={comparedProducts.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenAssistant={() => {
          setIsAssistantExpanded(true);
          const el = document.getElementById('hero-genie-input');
          el?.focus();
        }}
      />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12 relative z-10">
        {/* Above the fold: Workspace Hero & Search Input */}
        <section className="relative overflow-hidden pt-4 pb-2">
          <div className="max-w-3xl space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono font-medium text-[#FFB020] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Your Personal Shopping Agent</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif text-[#F5EFE6] tracking-tight leading-[1.12]">
              Shop <span className="font-serif italic text-[#FFB020] drop-shadow-[0_0_25px_rgba(255,176,32,0.4)]">smarter</span> than your search bar.
            </h1>

            <p className="text-base sm:text-lg text-[#A39A8C] leading-relaxed max-w-2xl">
              Tell ShopGenie what you need. It finds, compares and explains. You just approve.
            </p>

            {/* Action Buttons: Filled Amber & Outlined */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIsAssistantExpanded(true);
                  const el = document.getElementById('hero-genie-input');
                  el?.focus();
                }}
                className="px-6 py-3 rounded-2xl btn-amber font-semibold text-sm flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,176,32,0.35)]"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Try the assistant</span>
              </button>

              <a
                href="#catalogue-section"
                className="px-6 py-3 rounded-2xl btn-outline-amber text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <span>See how it works</span>
              </a>
            </div>

            {/* Stat Strip (True facts verified against application) */}
            <div className="flex items-center gap-6 sm:gap-9 pt-4 text-xs font-mono text-[#A39A8C] flex-wrap border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFB020] shadow-[0_0_8px_rgba(255,176,32,0.6)]" />
                <span><strong className="text-[#F5EFE6]">28</strong> curated products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFB020] shadow-[0_0_8px_rgba(255,176,32,0.6)]" />
                <span><strong className="text-[#F5EFE6]">7</strong> AI tools</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                <span>Secure PayPal checkout</span>
              </div>
            </div>

            {/* Unified Natural Language Shopping Input */}
            <form onSubmit={handleHeroSubmit} className="pt-3 max-w-2xl">
              <div className="flex items-center gap-2 p-2 pl-4 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl focus-within:border-[#FFB020] focus-within:bg-white/[0.07] focus-within:ring-2 focus-within:ring-[#FFB020]/30 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <Search className="w-5 h-5 text-[#A39A8C] shrink-0" />
                <input
                  id="hero-genie-input"
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="I am a college student. Find me a laptop under ₹50,000 for programming with good battery life..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#F5EFE6] placeholder:text-[#A39A8C] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!heroInput.trim() || chatLoading}
                  className="px-5 py-2.5 rounded-xl btn-amber disabled:opacity-40 transition-all shrink-0 flex items-center gap-1.5 active:scale-95 text-xs sm:text-sm shadow-sm"
                >
                  <span>Ask Genie</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Example Request Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-[#A39A8C] font-mono">Try asking:</span>
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
                  className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#FFB020]/40 text-xs text-[#F5EFE6] hover:text-[#FFB020] font-medium transition-all"
                >
                  "{chip}"
                </button>
              ))}
            </div>
          </div>

          {/* Three Floating Glass Preview Cards under the hero */}
          <div className="mt-12 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-mono tracking-widest text-[#A39A8C]">
                Experience Preview • Live Agent Capabilities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {/* Card 1: Chat Preview */}
              <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between md:rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-[#A39A8C]">
                  <span className="flex items-center gap-1.5 text-[#FFB020]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Agent Discovery</span>
                  </span>
                  <span className="text-[10px] bg-white/[0.06] px-2 py-0.5 rounded-md">Step 1</span>
                </div>

                <div className="space-y-3 py-3">
                  <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-xs text-[#F5EFE6]">
                    <span className="text-[10px] font-mono text-[#FFB020] block mb-0.5">Customer</span>
                    "Laptop under ₹50,000 for coding, good battery."
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/20 text-xs text-[#F5EFE6]">
                    <span className="text-[10px] font-mono text-[#FFB020] block mb-0.5">ShopGenie AI</span>
                    Found 3 laptops matching 8GB+ RAM, AMD Ryzen/Core i5, and 11h battery within budget.
                    <div className="flex items-center gap-1.5 mt-2 text-[#FFB020] text-[11px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-typing-1" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-typing-2" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-typing-3" />
                      <span className="ml-1 text-[10px] text-[#A39A8C]">Grounded ranking complete</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#A39A8C] pt-2 border-t border-white/5">
                  Natural language discovery
                </div>
              </div>

              {/* Card 2: Top Picks Preview */}
              <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between md:translate-y-[-6px] hover:translate-y-[-10px] transition-transform duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-[#A39A8C]">
                  <span className="flex items-center gap-1.5 text-[#FFB020]">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Top Ranked Picks</span>
                  </span>
                  <span className="text-[10px] bg-white/[0.06] px-2 py-0.5 rounded-md">Step 2</span>
                </div>

                <div className="space-y-2 py-3">
                  {[
                    { name: 'Lenovo IdeaPad Slim 3', score: '94%', why: '11h campus battery & 16GB RAM for containers' },
                    { name: 'ASUS Vivobook 15', score: '89%', why: '₹11,010 budget headroom, smooth multitasking' },
                    { name: 'Acer Swift Go 14', score: '85%', why: 'OLED display & lightweight 1.25kg chassis' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[#F5EFE6] truncate">{item.name}</div>
                        <div className="text-[10px] text-[#A39A8C] truncate">{item.why}</div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 shrink-0">
                        {item.score}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-[#A39A8C] pt-2 border-t border-white/5">
                  Objective deterministic scoring
                </div>
              </div>

              {/* Card 3: Compare Preview */}
              <div className="glass-card p-5 relative overflow-hidden flex flex-col justify-between md:rotate-[1.5deg] hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-[#A39A8C]">
                  <span className="flex items-center gap-1.5 text-[#FFB020]">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Spec Matrix Comparison</span>
                  </span>
                  <span className="text-[10px] bg-[#FFB020]/20 text-[#FFB020] px-2 py-0.5 rounded-md font-bold">Best Value</span>
                </div>

                <div className="space-y-2.5 py-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-[#A39A8C]">
                      <span>RAM Allocation</span>
                      <span className="text-[#F5EFE6]">16GB vs 8GB</span>
                    </div>
                    <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-[#FFB020] h-full w-[65%]" />
                      <div className="bg-white/20 h-full w-[35%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-[#A39A8C]">
                      <span>Battery Life</span>
                      <span className="text-[#F5EFE6]">11.0h vs 6.5h</span>
                    </div>
                    <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-[#FFB020] h-full w-[70%]" />
                      <div className="bg-white/20 h-full w-[30%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-[#A39A8C]">
                      <span>Price Efficiency</span>
                      <span className="text-[#4ADE80]">₹44,990 Best Value</span>
                    </div>
                    <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-[#4ADE80] h-full w-[80%]" />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#A39A8C] pt-2 border-t border-white/5">
                  Human-approved checkout
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills & Filter Bar */}
        <section id="catalogue-section" className="space-y-4 pt-4">
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
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-[#FFB020] text-[#0B0906] border-[#FFB020] shadow-[0_0_15px_rgba(255,176,32,0.35)]'
                        : 'bg-white/[0.04] text-[#A39A8C] border-white/10 hover:text-[#F5EFE6] hover:bg-white/[0.08]'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-[#0B0906]/30 text-[#0B0906] font-bold' : 'bg-white/[0.06] text-[#A39A8C]'
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
                  className="pl-3 pr-8 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-mono font-medium text-[#F5EFE6] focus:outline-none focus:ring-2 focus:ring-[#FFB020]/30 appearance-none cursor-pointer"
                >
                  <option value="rating_desc" className="bg-[#0B0906] text-[#F5EFE6]">Top Rated</option>
                  <option value="price_asc" className="bg-[#0B0906] text-[#F5EFE6]">Price: Low to High</option>
                  <option value="price_desc" className="bg-[#0B0906] text-[#F5EFE6]">Price: High to Low</option>
                  <option value="name_asc" className="bg-[#0B0906] text-[#F5EFE6]">Name A-Z</option>
                </select>
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#A39A8C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Mobile Assistant Toggle */}
              <button
                onClick={() => setIsAssistantExpanded(!isAssistantExpanded)}
                className={`lg:hidden px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isAssistantExpanded
                    ? 'btn-amber'
                    : 'bg-white/[0.04] text-[#F5EFE6] border-white/10'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Concierge</span>
              </button>
            </div>
          </div>

          {/* Brand Pills & Technical Specification Filter Controls */}
          <div className="p-4 rounded-2xl glass-card space-y-3 text-xs">
            {/* Brand Pills Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-[#A39A8C] uppercase font-semibold mr-1">Brand:</span>
              {['all', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'Dell', 'Sony', 'Samsung', 'Logitech', 'Keychron', 'LG'].map((b) => {
                const isBrandActive = selectedBrand.toLowerCase() === b.toLowerCase();
                return (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b === 'all' ? 'all' : b)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium font-mono transition-all border ${
                      isBrandActive
                        ? 'bg-[#FFB020] text-[#0B0906] border-[#FFB020] font-bold shadow-sm'
                        : 'bg-white/[0.03] text-[#A39A8C] border-white/10 hover:text-[#F5EFE6] hover:bg-white/[0.06]'
                    }`}
                  >
                    {b === 'all' ? 'All Brands' : b}
                  </button>
                );
              })}
            </div>

            {/* Spec Selectors: RAM, CPU, Screen, and Budget */}
            <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-white/5">
              {/* RAM Filter */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[#A39A8C]">RAM:</span>
                <select
                  value={selectedRam}
                  onChange={(e) => setSelectedRam(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#FFB020]"
                >
                  <option value="all" className="bg-[#0B0906]">All RAM</option>
                  <option value="8" className="bg-[#0B0906]">8 GB</option>
                  <option value="16" className="bg-[#0B0906]">16 GB</option>
                  <option value="32" className="bg-[#0B0906]">32 GB</option>
                </select>
              </div>

              {/* CPU Filter */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[#A39A8C]">CPU:</span>
                <select
                  value={selectedCpu}
                  onChange={(e) => setSelectedCpu(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#FFB020]"
                >
                  <option value="all" className="bg-[#0B0906]">All Processors</option>
                  <option value="i5" className="bg-[#0B0906]">Intel Core i5</option>
                  <option value="i7" className="bg-[#0B0906]">Intel Core i7</option>
                  <option value="Ryzen 5" className="bg-[#0B0906]">AMD Ryzen 5</option>
                  <option value="M2" className="bg-[#0B0906]">Apple M2</option>
                </select>
              </div>

              {/* Screen Size Filter */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[#A39A8C]">Screen:</span>
                <select
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F5EFE6] focus:outline-none focus:ring-1 focus:ring-[#FFB020]"
                >
                  <option value="all" className="bg-[#0B0906]">All Sizes</option>
                  <option value="13-14" className="bg-[#0B0906]">13" - 14" Portable</option>
                  <option value="15-16" className="bg-[#0B0906]">15" - 16" Standard</option>
                </select>
              </div>

              {/* Clear All Filters Button */}
              {(selectedBrand !== 'all' || selectedRam !== 'all' || selectedCpu !== 'all' || selectedScreen !== 'all' || selectedCategory !== 'all' || priceRange !== undefined) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                    setSelectedRam('all');
                    setSelectedCpu('all');
                    setSelectedScreen('all');
                    setPriceRange(undefined);
                    setSearchQuery('');
                  }}
                  className="ml-auto text-[11px] font-mono text-[#FFB020] hover:underline transition-colors"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Main Workspace Layout: 2/3 Catalogue Grid + 1/3 Assistant Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Results Area (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between text-xs font-mono text-[#A39A8C] px-1">
              <span>
                Showing <strong className="text-[#F5EFE6]">{displayedProducts.length}</strong> verified sample products
              </span>
              <span>All prices listed in Indian Rupees (₹)</span>
            </div>

            {loadingProducts ? (
              /* Animated Skeleton Grid Loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[1, 2, 3, 4, 5, 6].map((sk) => (
                  <div key={sk} className="p-5 rounded-3xl glass-card border border-white/10 bg-white/[0.03] space-y-4 animate-pulse">
                    <div className="w-full h-44 rounded-2xl bg-white/[0.06]" />
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded-md w-3/4" />
                      <div className="h-3 bg-white/5 rounded-md w-1/2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="h-7 bg-white/[0.04] rounded-xl" />
                      <div className="h-7 bg-white/[0.04] rounded-xl" />
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <div className="h-5 bg-white/10 rounded-md w-20" />
                      <div className="h-7 bg-[#FFB020]/20 rounded-xl w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="p-12 rounded-3xl glass-card text-center space-y-3">
                <h3 className="font-semibold text-[#F5EFE6] text-base">No matching products found</h3>
                <p className="text-xs text-[#A39A8C] max-w-sm mx-auto">
                  Try clearing your search query or adjusting your filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                    setSelectedRam('all');
                    setSelectedCpu('all');
                    setSelectedScreen('all');
                    setPriceRange(undefined);
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 rounded-xl btn-amber text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {displayedProducts.map((product) => {
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

          {/* Assistant Panel (4 cols on desktop, sticky on desktop) */}
          <div className={`lg:col-span-4 ${isAssistantExpanded ? 'block' : 'hidden lg:block'} sticky top-24`}>
            <AssistantPanel
              messages={messages}
              loading={chatLoading}
              activeActivity={activeActivity}
              onSendMessage={handleSendMessage}
              onAddToCart={handleAddToCart}
              onViewProduct={(p) => setDetailProduct(p)}
              onNewChat={handleNewChat}
              cartHint={cartHint}
              onOpenFullComparison={(comparison) => {
                setComparedProducts(comparison.products);
                setIsCompareModalOpen(true);
              }}
              onQuickAction={(actionText) => {
                if (actionText.toLowerCase().includes('proceed to checkout')) {
                  setIsCartOpen(true);
                } else if (actionText.toLowerCase().includes('view full comparison')) {
                  setIsCompareModalOpen(true);
                } else {
                  handleSendMessage(actionText);
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Floating Bottom-Right Assistant Launcher for Mobile or when collapsed */}
      {!isAssistantExpanded && (
        <button
          onClick={() => {
            setIsAssistantExpanded(true);
            window.scrollTo({ top: 500, behavior: 'smooth' });
          }}
          aria-label="Open ShopGenie AI shopping assistant"
          className="fixed bottom-6 right-6 z-30 min-h-[44px] min-w-[44px] px-4 py-3 rounded-2xl btn-amber shadow-[0_10px_30px_rgba(255,176,32,0.4)] flex items-center justify-center gap-2 font-semibold text-xs active:scale-95 transition-all lg:hidden"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Ask ShopGenie</span>
        </button>
      )}

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
