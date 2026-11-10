import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowLeft,
  ShoppingCart,
  Scale,
  Laptop,
  Smartphone,
  Headphones,
  Keyboard,
  Monitor,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Filter,
  X,
} from 'lucide-react';
import { api, Product, CartSummary } from '../lib/api';
import { ProductCard } from '../features/products/ProductCard';
import { ProductDetailsModal } from '../features/products/ProductDetailsModal';
import { ComparisonTray } from '../features/comparison/ComparisonTray';
import { ComparisonModal } from '../features/comparison/ComparisonModal';
import { CartDrawer } from '../features/cart/CartDrawer';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Filters state with URL query persistence
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

  // UI state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartSummary | null>(null);

  // Sync state to URL params
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

  useEffect(() => {
    loadCatalogue();
  }, [selectedCategory, selectedBrand, searchQuery, sortOption, priceRange]);

  useEffect(() => {
    api.getCart()
      .then((res) => setCart(res.cart))
      .catch(() => {});
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await api.addToCart(product.id, 1);
      setCart(res.cart);
      setIsCartOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart');
    }
  };

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

  // Client-side spec filtering for RAM, CPU, Screen size
  const filteredProducts = products.filter((p) => {
    const specs = p.specs || {};
    if (selectedRam !== 'all' && specs.ram_gb && specs.ram_gb.toString() !== selectedRam) {
      return false;
    }
    if (selectedCpu !== 'all' && specs.cpu && !specs.cpu.toLowerCase().includes(selectedCpu.toLowerCase())) {
      return false;
    }
    if (selectedScreen !== 'all') {
      const size = specs.screen_size_inch;
      if (selectedScreen === 'compact' && (!size || size > 14)) return false;
      if (selectedScreen === 'standard' && (!size || size < 14.1 || size > 16)) return false;
      if (selectedScreen === 'large' && (!size || size < 16.1)) return false;
    }
    return true;
  });

  const categories = [
    { id: 'all', label: 'All Products', icon: SlidersHorizontal },
    { id: 'laptops', label: 'Laptops', icon: Laptop },
    { id: 'phones', label: 'Smartphones', icon: Smartphone },
    { id: 'headphones', label: 'Headphones', icon: Headphones },
    { id: 'keyboards', label: 'Keyboards', icon: Keyboard },
    { id: 'monitors', label: 'Monitors', icon: Monitor },
  ];

  const brands = ['all', 'Apple', 'Dell', 'Lenovo', 'HP', 'ASUS', 'Samsung', 'Sony', 'Keychron'];

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

            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#F5EFE6] flex items-center gap-2">
                <span>Catalogue Discovery</span>
                <span className="text-xs font-mono text-[#A39A8C] font-normal hidden sm:inline">
                  ({filteredProducts.length} devices)
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/recommendations"
              className="px-3 py-1.5 rounded-xl border border-[#FFB020]/30 bg-[#FFB020]/10 hover:bg-[#FFB020] hover:text-[#0B0906] text-xs font-mono font-bold text-[#FFB020] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,176,32,0.15)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Concierge</span>
            </Link>

            <Link
              to="/system-map"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#A39A8C] hover:text-[#FFB020] transition-all hidden sm:flex items-center gap-1.5"
            >
              System Map
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

      {/* Main Catalogue Container */}
      <main className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'btn-amber text-[#0B0906] shadow-[0_0_20px_rgba(255,176,32,0.3)]'
                    : 'bg-white/[0.03] text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.06] border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Row */}
        <div className="bg-[#14120E] p-4 sm:p-5 rounded-3xl border border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39A8C]" />
              <input
                type="text"
                placeholder="Search models, specs, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#F5EFE6] placeholder:text-[#A39A8C] focus:outline-none focus:border-[#FFB020] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A39A8C] hover:text-[#F5EFE6]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* RAM Filter */}
            <select
              value={selectedRam}
              onChange={(e) => setSelectedRam(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F5EFE6] focus:outline-none focus:border-[#FFB020] transition-colors"
            >
              <option value="all" className="bg-[#14120E]">All Memory (RAM)</option>
              <option value="8" className="bg-[#14120E]">8 GB RAM</option>
              <option value="16" className="bg-[#14120E]">16 GB RAM</option>
              <option value="32" className="bg-[#14120E]">32 GB RAM</option>
            </select>

            {/* Screen Size Filter */}
            <select
              value={selectedScreen}
              onChange={(e) => setSelectedScreen(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F5EFE6] focus:outline-none focus:border-[#FFB020] transition-colors"
            >
              <option value="all" className="bg-[#14120E]">All Screen Sizes</option>
              <option value="compact" className="bg-[#14120E]">Compact (&le; 14")</option>
              <option value="standard" className="bg-[#14120E]">Standard (14.1"–16")</option>
              <option value="large" className="bg-[#14120E]">Large (16"+)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-[#F5EFE6] focus:outline-none focus:border-[#FFB020] transition-colors"
            >
              <option value="rating_desc" className="bg-[#14120E]">Sort: Top Rated</option>
              <option value="price_asc" className="bg-[#14120E]">Price: Low to High</option>
              <option value="price_desc" className="bg-[#14120E]">Price: High to Low</option>
            </select>
          </div>

          {/* Brand Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <span className="text-[#A39A8C] text-[11px] mr-1">Brand:</span>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all capitalize ${
                  selectedBrand === b
                    ? 'bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/40 font-bold'
                    : 'bg-white/[0.03] text-[#A39A8C] hover:text-[#F5EFE6] border border-white/5'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-[#14120E] rounded-3xl border border-white/5 p-4 space-y-4 animate-pulse"
              >
                <div className="w-full h-44 rounded-2xl bg-white/[0.03]" />
                <div className="space-y-2">
                  <div className="w-1/3 h-3 rounded bg-white/[0.05]" />
                  <div className="w-3/4 h-4 rounded bg-white/[0.05]" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="w-1/2 h-5 rounded bg-white/[0.05]" />
                  <div className="w-1/4 h-8 rounded-xl bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#14120E] border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#A39A8C]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-[#F5EFE6]">No matching products found</h3>
            <p className="text-xs text-[#A39A8C] max-w-sm mx-auto">
              Try relaxing your filters, clearing the search query, or ask our AI assistant to find alternatives.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSelectedRam('all');
                setSelectedCpu('all');
                setSelectedScreen('all');
                setSearchQuery('');
                setPriceRange(undefined);
              }}
              className="px-5 py-2 rounded-xl btn-amber text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedProducts.some((p) => p.id === product.id)}
                onViewDetails={setDetailProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Comparison Bottom Tray */}
      {comparedProducts.length > 0 && (
        <ComparisonTray
          comparedProducts={comparedProducts}
          onRemove={(id) => setComparedProducts((prev) => prev.filter((p) => p.id !== id))}
          onClear={() => setComparedProducts([])}
          onOpenCompare={() => setIsCompareModalOpen(true)}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={async (itemId, qty) => {
          const res = await api.updateCartQuantity(itemId, qty);
          setCart(res.cart);
        }}
        onRemoveItem={async (itemId) => {
          const res = await api.removeFromCart(itemId);
          setCart(res.cart);
        }}
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
          onToggleCompare={handleToggleCompare}
        />
      )}
    </div>
  );
};
