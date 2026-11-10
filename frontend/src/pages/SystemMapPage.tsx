import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Bot,
  Server,
  Database,
  CreditCard,
  User as UserIcon,
  Layout,
  Radio,
  Sliders,
  ShieldCheck,
  Lock,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Code2,
  Cpu,
} from 'lucide-react';

export type NodeCategory = 'user' | 'frontend' | 'backend' | 'ai' | 'database' | 'payment';

export interface SystemNode {
  id: string;
  name: string;
  role: string;
  category: NodeCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  icon: string;
  technologies: string[];
  files: string[];
  responsibilities: string[];
  connections: { targetId: string; label: string; type: 'data' | 'tool' | 'payment' | 'guardrail' }[];
  details: string;
  securityNote?: string;
}

const NODES: SystemNode[] = [
  {
    id: 'user',
    name: 'End User / Shopper',
    role: 'Shopper interaction & final checkout approval',
    category: 'user',
    x: 60,
    y: 190,
    width: 200,
    height: 100,
    icon: 'user',
    technologies: ['Web Browser', 'PayPal Pop-up Modal', 'Session Cookie'],
    files: ['frontend/src/features/checkout/CheckoutPage.tsx'],
    responsibilities: [
      'Inputs natural-language shopping requests (e.g. "Laptop under ₹50,000 for coding")',
      'Reviews multi-criteria ranked options with transparent trade-offs',
      'Selects products for comparison and adds items to cart',
      'Approves or cancels checkout in the PayPal Sandbox popup',
    ],
    connections: [
      { targetId: 'frontend', label: 'HTTP / UI Events', type: 'data' },
      { targetId: 'paypal', label: 'Biometric / Password Approval in Sandbox Popup', type: 'payment' },
    ],
    details:
      'The human shopper remains in sovereign control of checkout. The AI assistant can propose options, but money is never moved without explicit user biometric or login approval in the official PayPal Sandbox window.',
  },
  {
    id: 'frontend',
    name: 'React 18 Frontend',
    role: 'User Interface & State Presentation',
    category: 'frontend',
    x: 320,
    y: 190,
    width: 220,
    height: 110,
    icon: 'layout',
    technologies: ['React 18', 'Vite', 'Tailwind CSS', '@paypal/react-paypal-js', 'Lucide Icons'],
    files: [
      'frontend/src/pages/HomePage.tsx',
      'frontend/src/features/assistant/AssistantPanel.tsx',
      'frontend/src/features/checkout/CheckoutPage.tsx',
      'frontend/src/lib/api.ts',
    ],
    responsibilities: [
      'Renders conversational assistant with live typing indicators & tool chips',
      'Visualizes match score rings, green matched criteria, and amber trade-off badges',
      'Manages 2 to 4 product side-by-side spec comparisons',
      'Mounts PayPal Buttons configured in sandbox mode with createOrder and onApprove handlers',
    ],
    connections: [
      { targetId: 'backend', label: 'Vite Proxy /api (CORS & Credentials)', type: 'data' },
    ],
    details:
      'The React frontend forwards all shopping actions, session tokens, and checkout requests through the Vite reverse proxy to the Express backend. It never stores PayPal client secrets or makes direct payment mutations.',
  },
  {
    id: 'backend',
    name: 'Express 4 Backend',
    role: 'Central Hub, Security Boundaries & API Orchestrator',
    category: 'backend',
    x: 600,
    y: 280,
    width: 240,
    height: 120,
    icon: 'server',
    technologies: ['Node.js (v20+)', 'Express 4', 'Zod', 'Helmet', 'Express-Rate-Limit', 'Cookie-Parser'],
    files: [
      'backend/src/server.ts',
      'backend/src/middleware/sessionMiddleware.js',
      'backend/src/routes/aiRoutes.ts',
      'backend/src/routes/paymentRoutes.ts',
      'backend/src/services/orderService.ts',
    ],
    responsibilities: [
      'Issues cryptographically secure HttpOnly session cookies (30-day persistence)',
      'Enforces strict rate limits (30 req/min for AI chat, 20 req/min for payment actions)',
      'Validates every incoming request payload using Zod schemas',
      'Recalculates cart subtotals, shipping, and taxes in integer paise from SQLite',
      'Orchestrates Gemini tool loops and server-side PayPal order lifecycle',
    ],
    connections: [
      { targetId: 'gemini', label: 'Agent Loop + 7 Validated Tools', type: 'tool' },
      { targetId: 'database', label: 'Prepared SQLite Transactions', type: 'data' },
      { targetId: 'paypal', label: 'Orders v2 REST API (Bearer Auth)', type: 'payment' },
    ],
    details:
      'Acts as the authoritative trust boundary. All calculations (INR prices, conversion to USD cents, cart validation, stock availability) happen here. The backend never accepts client-provided prices or unverified status updates.',
    securityNote: 'SEC-3, SEC-6, SEC-10: Complete session isolation, parameterized SQL, and server price recalculation.',
  },
  {
    id: 'gemini',
    name: 'Gemini AI Agent',
    role: 'Natural Language Understanding & Function Calling',
    category: 'ai',
    x: 600,
    y: 60,
    width: 240,
    height: 110,
    icon: 'bot',
    technologies: ['Google Gemini API', '@google/generative-ai', 'Model: gemini-1.5-flash', 'Zod Tool Schemas'],
    files: [
      'backend/src/services/agentService.ts',
      'backend/src/tools/toolSchemas.ts',
      'backend/src/tools/toolHandlers.ts',
    ],
    responsibilities: [
      'Extracts shopper intent: category, budget ceiling, usage persona, priority features',
      'Calls only 7 validated tools: searchProducts, filterProducts, getProductDetails, recommendProducts, compareProducts, addToCart, viewCart',
      'Phrases explainable summaries quoting directly from the deterministic score breakdown',
      'Enforces conversational reset (New Chat) with shopping cart preservation',
    ],
    connections: [
      { targetId: 'recommend', label: 'Executes recommendProducts() with weights', type: 'tool' },
      { targetId: 'backend', label: 'Structured JSON response (Cards + Actions)', type: 'data' },
    ],
    details:
      'Gemini operates strictly within a read-only and cart-preparation sandbox. The agent has NO tools to touch money, create orders, set prices, or capture funds.',
    securityNote: 'SEC-7: AI Tool Allow-List prevents prompt injection from altering payment states or database prices.',
  },
  {
    id: 'recommend',
    name: 'Recommendation Engine',
    role: 'Multi-Factor Scoring & Trade-off Generation',
    category: 'ai',
    x: 910,
    y: 110,
    width: 230,
    height: 110,
    icon: 'sliders',
    technologies: ['TypeScript', 'Usage Profiles (Student, Gamer, Creator, Dev)', 'Algorithmic Normalization'],
    files: [
      'backend/src/services/recommendService.ts',
      'backend/src/services/compareService.ts',
      'backend/src/config/usageProfiles.ts',
    ],
    responsibilities: [
      'Applies hard budget ceilings in database query (strictly excludes over-budget items)',
      'Calculates weighted scores (0–100) combining budget fit, usage specs, battery/RAM priorities, and user rating',
      'Generates green matched tags and amber trade-off tags for transparent explainability',
      'Computes deterministic best-value picks for side-by-side product comparisons',
    ],
    connections: [
      { targetId: 'database', label: 'Queries candidate specs within budget', type: 'data' },
      { targetId: 'gemini', label: 'Returns score breakdown & tradeoffs to LLM', type: 'data' },
    ],
    details:
      'Decouples scoring from text generation. Because the score breakdown is computed in deterministic code rather than free-form LLM hallucinations, users receive accurate, reproducible technical evaluations.',
  },
  {
    id: 'database',
    name: 'SQLite Database',
    role: 'Persistent Storage & Atomic Transactions',
    category: 'database',
    x: 600,
    y: 490,
    width: 240,
    height: 110,
    icon: 'database',
    technologies: ['Node.js built-in node:sqlite', 'better-sqlite3 compatibility', 'WAL mode', 'Integer paise'],
    files: [
      'backend/src/database/db.ts',
      'backend/src/database/schema.sql',
      'backend/src/database/seed.ts',
    ],
    responsibilities: [
      'Stores 28 curated electronics across 5 categories with structured JSON specifications',
      'Maintains anonymous sessions and active cart items (unit prices read dynamically from catalogue)',
      'Captures immutable order item snapshots at checkout creation',
      'Maintains payments table with unique constraints on paypal_order_id and paypal_capture_id',
      'Logs webhook_events for idempotent deduplication',
    ],
    connections: [
      { targetId: 'backend', label: 'Atomic db.transaction() commits', type: 'data' },
    ],
    details:
      'All monetary calculations are performed in integer paise (1 INR = 100 paise) and integer USD cents to prevent IEEE-754 floating-point rounding errors. Database journals survive restarts.',
    securityNote: 'SEC-3: Unit prices are never stored in cart_items; prices are read directly from products table.',
  },
  {
    id: 'paypal',
    name: 'PayPal Sandbox Gateway',
    role: 'Orders v2 REST API & Secure Funds Capture',
    category: 'payment',
    x: 910,
    y: 320,
    width: 230,
    height: 120,
    icon: 'creditCard',
    technologies: ['PayPal Orders v2 REST API', 'OAuth 2.0 Client Credentials', 'https://api-m.sandbox.paypal.com'],
    files: [
      'backend/src/services/paypalService.ts',
      'backend/src/routes/paymentRoutes.ts',
    ],
    responsibilities: [
      'Caches OAuth 2.0 access tokens in memory for fast performance',
      'Creates order with intent: CAPTURE, return_url, and cancel_url',
      'Captures payment server-side with unique PayPal-Request-Id idempotency header',
      'Verifies status COMPLETED, capture ID, currency, and exact amount against stored order',
    ],
    connections: [
      { targetId: 'webhook', label: 'Dispatches asynchronous webhook events', type: 'payment' },
      { targetId: 'backend', label: 'Returns verified capture payload to server', type: 'data' },
    ],
    details:
      'The entire payment processing lifecycle is verified on the backend. When the customer approves the popup, the backend calls capture, ensures the captured USD matches what the database expected, decrements stock, and clears the cart.',
    securityNote: 'SEC-4, SEC-5: Never trusts frontend payment confirmation alone; requires server-verified capture.',
  },
  {
    id: 'webhook',
    name: 'Webhook & Idempotency Pipeline',
    role: 'Cryptographic Signature Verification & Event Ingestion',
    category: 'payment',
    x: 910,
    y: 500,
    width: 230,
    height: 110,
    icon: 'radio',
    technologies: ['express.raw({ type: application/json })', 'PayPal Verify-Webhook-Signature API', 'Idempotent markPaid()'],
    files: [
      'backend/src/routes/paymentRoutes.ts',
      'backend/src/services/paypalService.ts',
      'backend/src/services/orderService.ts',
    ],
    responsibilities: [
      'Listens on POST /api/paypal/webhook mounted before express.json() with raw parser',
      'Verifies cryptographic signature headers with PayPal verification endpoint',
      'Deduplicates incoming event IDs against the webhook_events table',
      'Recovers browser drop-offs: captures payment, decrements stock, and marks order paid if user closes popup',
      'Detects amount or currency tampering and automatically marks orders failed',
    ],
    connections: [
      { targetId: 'database', label: 'Deduplicates in webhook_events & updates order state', type: 'data' },
      { targetId: 'backend', label: 'Triggers shared idempotent markPaid()', type: 'data' },
    ],
    details:
      'Provides bulletproof resilience. If a customer loses internet connection immediately after approving in PayPal, this pipeline safely captures the transaction, decrements inventory, and marks the order paid without double-charging.',
    securityNote: 'SEC-8: Strictly audits PAYMENT.CAPTURE.COMPLETED amount against stored database snapshot.',
  },
];

export const SystemMapPage: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('backend');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const selectedNode = NODES.find((n) => n.id === selectedNodeId) || NODES[2];

  // Canvas bounds
  const viewBoxWidth = 1200;
  const viewBoxHeight = 660;

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNodeId('backend');
    setActiveCategoryFilter('all');
  };

  // Render icons
  const renderIcon = (type: string, className = 'w-5 h-5') => {
    switch (type) {
      case 'user':
        return <UserIcon className={className} />;
      case 'layout':
        return <Layout className={className} />;
      case 'server':
        return <Server className={className} />;
      case 'bot':
        return <Bot className={className} />;
      case 'sliders':
        return <Sliders className={className} />;
      case 'database':
        return <Database className={className} />;
      case 'creditCard':
        return <CreditCard className={className} />;
      case 'radio':
        return <Radio className={className} />;
      default:
        return <Cpu className={className} />;
    }
  };

  const getCategoryColor = (cat: NodeCategory) => {
    switch (cat) {
      case 'user':
        return {
          border: 'border-indigo-500/50',
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-400',
          glow: 'rgba(99,102,241,0.25)',
          stroke: '#818CF8',
        };
      case 'frontend':
        return {
          border: 'border-sky-500/50',
          bg: 'bg-sky-500/10',
          text: 'text-sky-400',
          glow: 'rgba(56,189,248,0.25)',
          stroke: '#38BDF8',
        };
      case 'backend':
        return {
          border: 'border-[#FFB020]/60',
          bg: 'bg-[#FFB020]/10',
          text: 'text-[#FFB020]',
          glow: 'rgba(255,176,32,0.35)',
          stroke: '#FFB020',
        };
      case 'ai':
        return {
          border: 'border-purple-500/50',
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          glow: 'rgba(168,85,247,0.25)',
          stroke: '#C084FC',
        };
      case 'database':
        return {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          glow: 'rgba(52,211,153,0.25)',
          stroke: '#34D399',
        };
      case 'payment':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          glow: 'rgba(251,191,36,0.25)',
          stroke: '#FBBF24',
        };
    }
  };

  // Connection links data
  const EDGES = [
    { from: 'user', to: 'frontend', label: 'User Shopping Queries & Clicks', type: 'data' },
    { from: 'frontend', to: 'backend', label: 'REST API calls via /api proxy', type: 'data' },
    { from: 'backend', to: 'gemini', label: 'Agent Loop + 7 Tool Declarations', type: 'tool' },
    { from: 'gemini', to: 'recommend', label: 'recommendProducts() / compareProducts()', type: 'tool' },
    { from: 'recommend', to: 'database', label: 'Catalogue Query with Budget Ceiling', type: 'data' },
    { from: 'backend', to: 'database', label: 'Sessions, Cart Items & Orders', type: 'data' },
    { from: 'user', to: 'paypal', label: 'Popup Login & Biometric Approval', type: 'payment' },
    { from: 'backend', to: 'paypal', label: 'Orders v2 Create & Server Capture', type: 'payment' },
    { from: 'paypal', to: 'webhook', label: 'Async Webhook Events (Capture Completed)', type: 'payment' },
    { from: 'webhook', to: 'backend', label: 'Cryptographic Signature Verification', type: 'data' },
    { from: 'webhook', to: 'database', label: 'Deduplication & markPaid()', type: 'data' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0906] text-[#F5EFE6] selection:bg-[#FFB020]/30 selection:text-[#FFB020] flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0906]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-[#FFB020] text-xs font-mono font-semibold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#F5EFE6] flex items-center gap-2">
                <span>ShopGenie AI</span>
                <span className="text-[#FFB020] font-mono text-xs font-normal">/ Interactive System Architecture Map</span>
              </h1>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2">
            <Link
              to="/recommendations"
              className="px-3 py-1.5 rounded-xl border border-[#FFB020]/30 bg-[#FFB020]/10 hover:bg-[#FFB020] hover:text-[#0B0906] text-xs font-mono font-bold text-[#FFB020] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,176,32,0.15)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Try Assistant</span>
            </Link>

            <Link
              to="/products"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono font-medium text-[#A39A8C] hover:text-[#F5EFE6] transition-all"
            >
              Products
            </Link>

            <Link
              to="/cart"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono font-medium text-[#A39A8C] hover:text-[#F5EFE6] transition-all"
            >
              Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Filter / Controls Strip */}
      <div className="border-b border-white/5 bg-[#14120E]/50 px-4 sm:px-6 py-2.5">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#A39A8C] font-mono mr-1 text-[11px]">Filter View:</span>
            {[
              { id: 'all', label: 'All Layers' },
              { id: 'user', label: 'User & Client' },
              { id: 'frontend', label: 'Frontend' },
              { id: 'backend', label: 'Backend' },
              { id: 'ai', label: 'Gemini & Scoring' },
              { id: 'database', label: 'SQLite DB' },
              { id: 'payment', label: 'PayPal & Webhooks' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  activeCategoryFilter === f.id
                    ? 'bg-[#FFB020] text-[#0B0906] font-bold shadow-sm'
                    : 'bg-white/[0.04] text-[#A39A8C] hover:text-[#F5EFE6] hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Canvas Zoom & Reset Controls */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#F5EFE6] transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#F5EFE6] transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#A39A8C] hover:text-[#FFB020] transition-all flex items-center gap-1 text-[11px]"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <span className="text-[11px] text-[#A39A8C] ml-1">{Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace: Canvas (Left) + Detail Drawer (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left: Diagram Canvas */}
        <div
          className={`flex-1 relative bg-[#0B0906] overflow-hidden select-none cursor-grab ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255, 176, 32, 0.4) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Zero-Trust Boundary Decorative Overlay Label */}
          <div className="absolute top-4 left-6 z-10 pointer-events-none bg-[#14120E]/90 border border-red-500/30 rounded-2xl p-2.5 px-3.5 backdrop-blur-md shadow-lg flex items-center gap-2.5 text-xs text-[#F5EFE6]">
            <div className="w-6 h-6 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-mono font-bold text-red-400 block text-[11px] uppercase tracking-wider">
                Zero-Trust Security Boundary (SEC-7)
              </span>
              <span className="text-[11px] text-[#A39A8C]">
                Gemini AI has shopping tools only. AI cannot touch funds, change prices, or alter orders.
              </span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75 origin-center"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            }}
          >
            <svg
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              className="w-full h-full max-w-[1250px] max-h-[700px] overflow-visible"
            >
              <defs>
                {/* Arrow markers */}
                <marker
                  id="arrow-amber"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#FFB020" />
                </marker>
                <marker
                  id="arrow-cyan"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#38BDF8" />
                </marker>
                <marker
                  id="arrow-purple"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#C084FC" />
                </marker>
                <marker
                  id="arrow-green"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#34D399" />
                </marker>
              </defs>

              {/* Security Boundary Region Indicator (Dashed Box around Gemini & Recommendation Engine) */}
              <rect
                x="570"
                y="35"
                width="600"
                height="210"
                rx="24"
                fill="rgba(168, 85, 247, 0.03)"
                stroke="rgba(168, 85, 247, 0.35)"
                strokeDasharray="6 6"
              />
              <text
                x="590"
                y="55"
                fill="#C084FC"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                AI DISCOVERY & REASONING ZONE (READ-ONLY TOOLS)
              </text>

              {/* Trusted Financial Capture Region */}
              <rect
                x="880"
                y="275"
                width="290"
                height="360"
                rx="24"
                fill="rgba(251, 191, 36, 0.03)"
                stroke="rgba(251, 191, 36, 0.35)"
                strokeDasharray="6 6"
              />
              <text
                x="900"
                y="298"
                fill="#FFB020"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                TRUSTED FINANCIAL SETTLEMENT
              </text>

              {/* Render Connection Edges */}
              {EDGES.map((edge, index) => {
                const source = NODES.find((n) => n.id === edge.from);
                const target = NODES.find((n) => n.id === edge.to);
                if (!source || !target) return null;

                const isConnectedToSelected =
                  selectedNodeId === edge.from || selectedNodeId === edge.to;

                // Center points
                const sx = source.x + source.width / 2;
                const sy = source.y + source.height / 2;
                const tx = target.x + target.width / 2;
                const ty = target.y + target.height / 2;

                // Curve path
                const dx = tx - sx;
                const dy = ty - sy;
                const cx1 = sx + dx * 0.45;
                const cy1 = sy;
                const cx2 = sx + dx * 0.55;
                const cy2 = ty;
                const pathD = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

                const strokeColor =
                  edge.type === 'payment'
                    ? '#FBBF24'
                    : edge.type === 'tool'
                    ? '#C084FC'
                    : isConnectedToSelected
                    ? '#FFB020'
                    : '#4B463E';

                const strokeWidth = isConnectedToSelected ? 2.5 : 1.5;

                return (
                  <g key={`edge-${index}`}>
                    {/* Shadow / Glow line */}
                    {isConnectedToSelected && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="6"
                        strokeOpacity="0.25"
                      />
                    )}

                    {/* Main Edge Path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isConnectedToSelected ? '6 4' : 'none'}
                      className={isConnectedToSelected ? 'animate-pulse' : ''}
                      markerEnd={
                        edge.type === 'payment'
                          ? 'url(#arrow-amber)'
                          : edge.type === 'tool'
                          ? 'url(#arrow-purple)'
                          : 'url(#arrow-amber)'
                      }
                    />

                    {/* Edge Label Pill */}
                    <g
                      transform={`translate(${sx + dx * 0.5}, ${sy + dy * 0.5 - 8})`}
                      className="cursor-pointer"
                    >
                      <rect
                        x="-60"
                        y="-10"
                        width="120"
                        height="20"
                        rx="6"
                        fill="#14120E"
                        stroke={isConnectedToSelected ? strokeColor : '#2A2620'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={isConnectedToSelected ? '#F5EFE6' : '#A39A8C'}
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {edge.label.length > 20 ? edge.label.substring(0, 18) + '...' : edge.label}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Render Architecture Nodes */}
              {NODES.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const colors = getCategoryColor(node.category);
                const isFilteredOut =
                  activeCategoryFilter !== 'all' && node.category !== activeCategoryFilter;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="interactive-node cursor-pointer transition-all duration-200"
                    style={{
                      opacity: isFilteredOut ? 0.25 : 1,
                    }}
                  >
                    {/* Node Selected Glow */}
                    {isSelected && (
                      <rect
                        x="-6"
                        y="-6"
                        width={node.width + 12}
                        height={node.height + 12}
                        rx="22"
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="3"
                        strokeOpacity="0.8"
                        filter="drop-shadow(0 0 12px rgba(255,176,32,0.4))"
                      />
                    )}

                    {/* Node Card Background */}
                    <rect
                      x="0"
                      y="0"
                      width={node.width}
                      height={node.height}
                      rx="18"
                      fill="#14120E"
                      stroke={isSelected ? colors.stroke : 'rgba(255, 255, 255, 0.12)'}
                      strokeWidth={isSelected ? 2 : 1}
                    />

                    {/* Top Accent Gradient Bar */}
                    <rect
                      x="0"
                      y="0"
                      width={node.width}
                      height="4"
                      rx="2"
                      fill={colors.stroke}
                    />

                    {/* Icon Container */}
                    <g transform="translate(14, 16)">
                      <rect
                        x="0"
                        y="0"
                        width="34"
                        height="34"
                        rx="10"
                        fill={colors.bg}
                        stroke={colors.stroke}
                        strokeOpacity="0.4"
                      />
                      <foreignObject x="0" y="0" width="34" height="34">
                        <div
                          className={`w-full h-full flex items-center justify-center ${colors.text}`}
                        >
                          {renderIcon(node.icon, 'w-4 h-4')}
                        </div>
                      </foreignObject>
                    </g>

                    {/* Category Tag */}
                    <text
                      x="58"
                      y="26"
                      fill={colors.text}
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      letterSpacing="1"
                    >
                      {node.category.toUpperCase()}
                    </text>

                    {/* Node Title */}
                    <text
                      x="58"
                      y="42"
                      fill="#F5EFE6"
                      fontSize="13"
                      fontWeight="bold"
                      fontFamily="Inter, sans-serif"
                    >
                      {node.name}
                    </text>

                    {/* Node Role / Short Subtitle */}
                    <foreignObject x="14" y="58" width={node.width - 28} height="48">
                      <p className="text-[10px] text-[#A39A8C] leading-snug line-clamp-2">
                        {node.role}
                      </p>
                    </foreignObject>

                    {/* Active Ping Dot for selected */}
                    {isSelected && (
                      <circle
                        cx={node.width - 14}
                        cy="16"
                        r="4"
                        fill={colors.stroke}
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hint Overlay at bottom left of canvas */}
          <div className="absolute bottom-4 left-6 pointer-events-none text-[11px] font-mono text-[#A39A8C] bg-[#0B0906]/80 px-3 py-1.5 rounded-xl border border-white/5">
            Click any component to inspect responsibilities, files & security invariants
          </div>
        </div>

        {/* Right: Selected Node Details Slide-Out Inspector Panel */}
        <div className="w-full lg:w-[420px] bg-[#14120E] border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto max-h-[450px] lg:max-h-none shadow-2xl">
          <div className="space-y-6">
            {/* Header with Category Badge & Name */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    getCategoryColor(selectedNode.category).bg
                  } ${getCategoryColor(selectedNode.category).text} border ${
                    getCategoryColor(selectedNode.category).border
                  }`}
                >
                  {selectedNode.category} Layer
                </span>
                <span className="text-[11px] font-mono text-[#A39A8C]">ID: #{selectedNode.id}</span>
              </div>

              <div className="flex items-center gap-3.5 mt-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    getCategoryColor(selectedNode.category).bg
                  } ${getCategoryColor(selectedNode.category).border} ${
                    getCategoryColor(selectedNode.category).text
                  }`}
                >
                  {renderIcon(selectedNode.icon, 'w-6 h-6')}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#F5EFE6]">
                    {selectedNode.name}
                  </h2>
                  <p className="text-xs text-[#A39A8C] mt-0.5 leading-snug">
                    {selectedNode.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Architectural Explanation */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-[#F5EFE6] leading-relaxed">
              <span className="font-mono text-[10px] text-[#A39A8C] uppercase tracking-wider block mb-1">
                Architectural Role
              </span>
              {selectedNode.details}
            </div>

            {/* Security Guardrail Note (if applicable) */}
            {selectedNode.securityNote && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-red-300 font-mono text-[11px]">
                    Security Invariant
                  </span>
                  <p className="mt-0.5 leading-relaxed text-[11px]">{selectedNode.securityNote}</p>
                </div>
              </div>
            )}

            {/* Key Responsibilities */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A39A8C] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB020]" />
                <span>Primary Responsibilities</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#F5EFE6]">
                {selectedNode.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                    <span className="text-[#FFB020] font-mono text-[11px] mt-0.5">•</span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Repository Files */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A39A8C] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Repository Source Files</span>
              </h3>
              <div className="space-y-1.5">
                {selectedNode.files.map((file, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px] text-[#38BDF8] flex items-center justify-between"
                  >
                    <span className="truncate">{file}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A39A8C]">
                Technologies & Standards
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.technologies.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[#F5EFE6] text-[11px] font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Shortcut */}
          <div className="pt-6 border-t border-white/10 mt-6 flex items-center gap-3">
            <Link
              to="/recommendations"
              className="flex-1 py-2.5 rounded-xl btn-amber text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <span>Test AI Flow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/products"
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-[#F5EFE6] transition-all"
            >
              Catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

