# ShopGenie AI — System Architecture & Engineering Blueprint

**Tagline**: *Think Smart. Shop Better. Pay Smarter.*  
**Defining Principle**: *Autonomous discovery. Human-approved purchase.*

---

## 1. System Overview

ShopGenie AI is an autonomous, explainable AI shopping assistant designed to simplify electronics e-commerce. Traditional online stores overwhelm customers with complex specifications and disjointed filters. ShopGenie AI allows shoppers to express their needs in natural language, queries a verified catalogue of 28 products across 5 categories, executes deterministic multi-factor scoring to rank options with honest trade-offs, and prepares the cart—while guaranteeing that payment approval remains strictly in customer control.

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Browser                         │
│  React 18 + Vite + Tailwind CSS + PayPal JS SDK Buttons     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (Cookies, JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Node.js + Express Backend                    │
│                                                             │
│  ├── Session Middleware (HttpOnly Cookie, Anonymous UUID)   │
│  ├── Security (Helmet, CORS Origin Allowlist, Rate Limit)   │
│                                                             │
│  ├── /api/ai/chat ───────────► Google Gemini API (gemini-1.5-flash) │
│  │                            (7 Validated Read/Cart Tools) │
│  │                                                          │
│  ├── /api/products ──────────► SQLite (node:sqlite / fallback better-sqlite3) │
│  ├── /api/cart ──────────────► Cart Engine (Integer Paise)  │
│  ├── /api/orders ────────────► Order Snapshot Engine        │
│  └── /api/paypal/* ──────────► PayPal Orders v2 REST API    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Trust Boundary & Security Invariants

| Invariant | Implementation Mechanism |
| :--- | :--- |
| **Model is strictly untrusted** | The Gemini model only outputs text and structured tool arguments. Product names, prices, ratings, and stock are always re-hydrated directly from SQLite on the server before reaching the frontend. |
| **No payment tools in model schema** | Tools exposed to Gemini are strictly limited to `searchProducts`, `filterProducts`, `getProductDetails`, `recommendProducts`, `compareProducts`, `addToCart`, and `getCart`. Payment creation, capture, discounting, and order state updates have no tool definitions. |
| **Tamper-proof integer accounting** | All monetary values are stored in minor integer units: INR in paise (`price_inr_paise`), USD in cents (`charge_amount_usd_cents`). Float arithmetic is completely avoided. |
| **Server-side capture verification** | Capture responses from PayPal are verified for `status === 'COMPLETED'`, capture ID presence, currency (`USD`), and exact expected amount in integer cents before marking an order `paid`. |
| **Capture idempotency** | Stable idempotency keys (`idemp_{orderId}_{paypalOrderId}`) passed via `PayPal-Request-Id` headers prevent duplicate charges on repeat or concurrent requests. |
| **Session isolation & CSRF** | Server-issued cryptographically random session cookies (`shopgenie_session`) scope carts, conversations, and orders. Foreign origin state mutations are rejected with HTTP 403. |

---

## 3. Data Model (SQLite Schema)

All tables enforce foreign key integrity (`PRAGMA foreign_keys = ON;`).

### `products`
Controlled catalogue of exactly 28 products across 5 categories (8 laptops, 6 phones, 6 headphones, 4 keyboards, 4 monitors).
- `id` (e.g., `LAP-001`, `PHO-002`)
- `name`, `category`, `brand`, `price_inr_paise`, `rating`, `description`, `image_url`, `specs_json`, `stock`

### `sessions`
- `id`: Cryptographically generated UUID (e.g. `ses_...`)
- `preferences_json`: Stored usage preferences
- `created_at`, `last_active_at`

### `cart_items`
- `id`, `session_id`, `product_id`, `quantity` (1..10)
- `created_at`, `updated_at`
- *Note*: Unit prices are never stored here; they are joined dynamically from `products`.

### `orders`
- `id`: Internal order identifier (e.g., `ORD-849201-B3A`)
- `session_id`, `status` (`pending`, `paid`, `failed`, `cancelled`, `refunded`, `reversed`)
- `subtotal_inr_paise`, `shipping_inr_paise`, `tax_inr_paise`, `total_inr_paise`
- `charge_currency` (`USD`), `charge_amount_usd_cents`, `inr_to_usd_rate`
- `created_at`, `updated_at`

### `order_items`
- `id`, `order_id`, `product_id`, `name_snapshot`, `unit_price_inr_paise_snapshot`, `quantity`

### `payments`
- `id`, `order_id`, `paypal_order_id` (UNIQUE), `paypal_capture_id` (UNIQUE), `idempotency_key` (UNIQUE)
- `status`, `raw_status`, `amount_cents`, `currency`, `created_at`, `updated_at`

### `conversations`
- `id`, `session_id`, `conversation_id`, `role` (`user`, `assistant`), `content`, `metadata_json`, `created_at`

### `webhook_events`
- `id` (PayPal Event ID), `event_type`, `status` (`processing`, `completed`, `failed`), `error_message`, `received_at`, `processed_at`

---

## 4. Deterministic Scoring & Ranking Engine

Recommendations are calculated by backend code, never hallucinated by Gemini.

### Weight Distribution
$$\text{Score} = (W_{\text{budget}} \times S_{\text{budget}}) + (W_{\text{usage}} \times S_{\text{usage}}) + (W_{\text{priority}} \times S_{\text{priority}}) + (W_{\text{rating}} \times S_{\text{rating}}) + (W_{\text{brand}} \times S_{\text{brand}})$$

Default weights:
- **Budget Fit** ($W = 0.25$):
  - Hard constraint: Products with `price_inr_paise > budgetMaxPaise` are strictly excluded upfront.
  - Full score ($1.0$) at or below $85\%$ of the budget ceiling.
  - Linearly decreases from $1.0$ down to $0.0$ between $85\%$ and $100\%$ of budget limit.
- **Usage Fit** ($W = 0.30$):
  - Evaluates category rules defined per persona (`student`, `programmer`, `gamer`, `video_editor`, `everyday`).
  - Example (`programmer` laptop): RAM $\ge 16\text{GB}$, SSD $\ge 512\text{GB}$, battery $\ge 8\text{h}$, modern multi-core CPU.
- **Priority Match** ($W = 0.25$):
  - Normalized score for user-stated criteria (e.g., battery endurance, lightweight portability, 4K screen, active noise cancellation).
- **Rating** ($W = 0.10$):
  - $\text{Rating} / 5.0$.
- **Brand Preference** ($W = 0.10$):
  - $1.0$ if matching stated preferred brand, $0.5$ neutral baseline if none stated.

---

## 5. PayPal Sandbox Payment Flow

1. **Cart Review**: Customer reviews items with server-calculated INR subtotal and disclosed USD Sandbox charge.
2. **Order Snapshot**: Customer clicks Checkout. Server validates cart items and stock, creates an immutable internal order with status `pending`, and freezes the exact USD charge.
3. **PayPal Order Creation**: Frontend PayPal Button `createOrder` callback calls backend `POST /api/paypal/create-order` with the `orderId`. Backend calls PayPal Orders v2 API with intent `CAPTURE` and returns `paypalOrderId`.
4. **Customer Approval**: Customer approves in PayPal Sandbox popup using sandbox buyer test account.
5. **Verified Capture**: `onApprove` calls backend `POST /api/paypal/capture-order`. Backend executes capture with idempotency key, verifies `COMPLETED` status, currency match, and amount match.
6. **Finalization**: Order marked `paid`, stock decremented, and cart items cleared.

