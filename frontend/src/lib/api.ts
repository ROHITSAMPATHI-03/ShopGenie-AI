/**
 * ShopGenie AI API Client
 * All requests include credentials for server-issued anonymous session cookies
 */

const API_BASE = '/api';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with HTTP ${response.status}`);
  }

  return data as T;
}

export interface Product {
  id: string;
  name: string;
  category: 'laptops' | 'phones' | 'headphones' | 'keyboards' | 'monitors';
  brand: string;
  price_inr_paise: number;
  price_inr: number;
  rating: number;
  description: string;
  image_url: string;
  specs: Record<string, any>;
  stock: number;
  created_at: string;
}

export interface ScoredProduct {
  product: Product;
  overallScore: number;
  breakdown: {
    budgetFit: number;
    usageFit: number;
    priorityMatch: number;
    ratingScore: number;
    brandFit: number;
  };
  matchedRequirements: string[];
  tradeoffs: string[];
  rankingReason: string;
}

export interface ComparisonResult {
  products: Product[];
  specMatrix: Record<string, (string | number | boolean | null)[]>;
  priceDifference: {
    minPriceInr: number;
    maxPriceInr: number;
    differenceInr: number;
    cheapestId: string;
    priciestId: string;
  };
  bestValuePick: {
    productId: string;
    productName: string;
    reason: string;
  };
  summary: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  itemTotalInrPaise: number;
  itemTotalInr: number;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotalInrPaise: number;
  subtotalInr: number;
  shippingInrPaise: number;
  shippingInr: number;
  taxInrPaise: number;
  taxInr: number;
  totalInrPaise: number;
  totalInr: number;
  chargeCurrency: string;
  chargeAmountUsdCents: number;
  chargeAmountUsd: string;
  inrToUsdRate: number;
}

export interface OrderItemSnapshot {
  id: string;
  productId: string;
  name: string;
  unitPriceInrPaise: number;
  unitPriceInr: number;
  quantity: number;
  itemTotalInrPaise: number;
  itemTotalInr: number;
}

export interface Order {
  id: string;
  sessionId: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  subtotalInrPaise: number;
  subtotalInr: number;
  shippingInrPaise: number;
  shippingInr: number;
  taxInrPaise: number;
  taxInr: number;
  totalInrPaise: number;
  totalInr: number;
  chargeCurrency: string;
  chargeAmountUsdCents: number;
  chargeAmountUsd: string;
  inrToUsdRate: number;
  items: OrderItemSnapshot[];
  payment?: {
    paypalOrderId: string;
    paypalCaptureId?: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentResponse {
  message: string;
  productCards: Product[];
  scoredProducts?: ScoredProduct[];
  comparison?: ComparisonResult;
  cart?: CartSummary;
  actions: string[];
  activities: string[];
  mode: 'live_gemini' | 'live_openai' | 'deterministic_fallback';
  unconfiguredReason?: string;
}

export const api = {
  // Products
  getProducts: (params: { q?: string; category?: string; sort?: string; minPrice?: number; maxPrice?: number; brand?: string } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params.brand && params.brand !== 'all') searchParams.set('brand', params.brand);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
    return fetchJson<{ products: Product[]; total: number }>(`/products?${searchParams.toString()}`);
  },

  getProductById: (id: string) => fetchJson<{ product: Product }>(`/products/${id}`),

  compareProducts: (productIds: string[], priority?: string) =>
    fetchJson<ComparisonResult>('/products/compare', {
      method: 'POST',
      body: JSON.stringify({ productIds, priority }),
    }),

  // Cart
  getCart: () => fetchJson<{ cart: CartSummary }>('/cart'),

  addToCart: (productId: string, quantity: number = 1) =>
    fetchJson<{ cart: CartSummary; message: string }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartQuantity: (cartItemId: string, quantity: number) =>
    fetchJson<{ cart: CartSummary; message: string }>(`/cart/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (cartItemId: string) =>
    fetchJson<{ cart: CartSummary; message: string }>(`/cart/${cartItemId}`, {
      method: 'DELETE',
    }),

  clearCart: () => fetchJson<{ cart: CartSummary; message: string }>('/cart', { method: 'DELETE' }),

  // Orders
  createOrder: () => fetchJson<{ order: Order; message: string }>('/orders', { method: 'POST' }),
  getOrderHistory: () => fetchJson<{ orders: Order[] }>('/orders'),
  getOrderById: (id: string) => fetchJson<{ order: Order }>(`/orders/${id}`),

  // PayPal
  getPayPalConfig: () =>
    fetchJson<{
      clientId: string;
      isConfigured: boolean;
      currency: string;
      env: string;
      inrToUsdRate: number;
    }>('/paypal/config'),

  createPayPalOrder: (orderId: string) =>
    fetchJson<{ paypalOrderId: string }>('/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  capturePayPalOrder: (paypalOrderId: string, orderId: string) =>
    fetchJson<{ order: Order; message: string }>('/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({ paypalOrderId, orderId }),
    }),

  cancelPayPalOrder: (orderId: string) =>
    fetchJson<{ order: Order; message: string }>('/paypal/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    }),

  // AI Shopping Assistant
  sendChatMessage: (message: string, conversationId?: string, signal?: AbortSignal) =>
    fetchJson<AgentResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
      signal,
    }),

  chat: (message: string, conversationId?: string, signal?: AbortSignal) =>
    fetchJson<AgentResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
      signal,
    }),

  resetConversation: (conversationId?: string) =>
    fetchJson<{ success: boolean; message: string }>('/ai/reset', {
      method: 'POST',
      body: JSON.stringify({ conversationId }),
    }),

  getChatHistory: (conversationId?: string) =>
    fetchJson<{ messages: any[] }>(`/ai/history${conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : ''}`),
};

