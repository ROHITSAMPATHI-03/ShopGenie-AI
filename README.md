# ShopGenie AI

> **Tagline**: *Think Smart. Shop Better. Pay Smarter.*  
> **Defining Principle**: *Autonomous discovery. Human-approved purchase.*

An AI-powered autonomous shopping assistant with intelligent product discovery, explainable recommendations, and secure PayPal Sandbox checkout—with the customer always in control of the final purchase.

---

## Highlights

- **Autonomous Discovery**: Natural language shopping queries parsed into structured criteria (budget, category, usage persona, priorities).
- **Deterministic Multi-Factor Ranking**: Transparent code computes scores (0–100) based on budget fit, usage profiles (student, programmer, gamer, video editor, everyday), priorities, and ratings.
- **Explainable AI**: Every recommendation clearly lists matched requirements and honest trade-offs.
- **Side-by-Side Comparison**: Compare 2 to 4 products with full spec matrix, price difference analysis, and code-selected best-value pick.
- **Zero-Trust Payment Boundary**: The AI model has zero access to payment creation, capture, or price alteration tools.
- **Server-Verified PayPal Checkout**: Orders snapshot prices in integer paise and USD cents; capture is verified on the server for status (`COMPLETED`), currency, and exact expected amount before marking paid.
- **Session-Scoped History**: Anonymous sessions survive page refreshes and backend restarts with SQLite persistence.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, `@paypal/react-paypal-js` |
| **Backend** | Node.js, Express, TypeScript, `better-sqlite3`, `zod`, `helmet`, `cors`, `express-rate-limit` |
| **AI Integration** | Google Gemini API (`@google/generative-ai`) with 7 validated shopping function declarations |
| **Payments** | PayPal Orders v2 REST API + PayPal JS SDK (Sandbox Mode) |
| **Testing** | Vitest, Supertest (18 automated tests passing) |

---

## Quick Start (Under 2 Minutes)

### 1. Prerequisites
- Node.js (v18+ or v20 LTS recommended)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/ShopGenie-AI.git
cd ShopGenie-AI

# Install all dependencies (root, frontend & backend)
npm run install:all
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Configure your credentials in `.env`:
```env
# Gemini API Key (Optional for basic discovery; deterministic fallback active if omitted)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite

# PayPal Sandbox Credentials (Required for live Sandbox popup approval)
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_sandbox_webhook_id
PAYPAL_ENV=sandbox

# Currency & Rates
CHARGE_CURRENCY=USD
INR_TO_USD=0.012

# Server & Session
FRONTEND_ORIGIN=http://localhost:5173
SESSION_SECRET=shopgenie_super_secure_secret_key_12345
DATABASE_PATH=./data/shopgenie.db
PORT=4000
```

### 4. Seed Catalogue Data
Populates the database with 28 curated products across 5 categories:
```bash
npm run seed
```

### 5. Start Development (Single-Command Startup)
```bash
# Starts both Backend (port 4000 with node --watch) and Frontend (port 5173 with Vite /api proxy) concurrently:
npm run dev:all
```

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## Available Root Commands

| Command | Action |
| :--- | :--- |
| `npm run dev:all` | **Single-command startup**: runs backend & frontend concurrently via `concurrently` |
| `npm run dev` | Alias for `npm run dev:all` |
| `npm run dev:backend` | Starts backend development server (`node --watch`) |
| `npm run dev:frontend` | Starts Vite frontend dev server on port 5173 |
| `npm run build` | Compiles backend TypeScript and builds production Vite frontend |
| `npm run test` | Runs the Vitest automated test suite (20 tests) |
| `npm run seed` | Seeds or updates the 28 products catalogue in SQLite |
| `npm run install:all` | Installs root, backend, and frontend dependencies in one step |
| `npm run test` | Runs the Vitest automated test suite |
| `npm run seed` | Seeds or updates the 28 products catalogue in SQLite |

---

## Local PayPal Webhook Testing (Zero Cloud Hosting Needed)

The backend exposes `POST /api/paypal/webhook` with cryptographic signature verification and deduplication. To test real-time webhooks locally without deploying to any cloud host:

### Step 1: Start a Local Secure Tunnel
Use `ngrok` or `cloudflared` to expose your local backend port (`4000`):
```bash
# Using ngrok
ngrok http 4000

# Or using Cloudflare Tunnel
cloudflared tunnel --url http://localhost:4000
```
Note the HTTPS forwarding URL (e.g. `https://your-tunnel-id.ngrok-free.app`).

### Step 2: Register Webhook in PayPal Developer Dashboard
1. Log in to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Navigate to **Apps & Credentials** > Select your Sandbox App.
3. Under **Webhooks**, click **Add Webhook**.
4. Set **Webhook URL** to: `https://your-tunnel-id.ngrok-free.app/api/paypal/webhook`
5. Select the following event types:
   - `Checkout order approved` (`CHECKOUT.ORDER.APPROVED`)
   - `Payment capture completed` (`PAYMENT.CAPTURE.COMPLETED`)
   - `Payment capture pending` (`PAYMENT.CAPTURE.PENDING`)
   - `Payment capture denied` (`PAYMENT.CAPTURE.DENIED`)
   - `Payment capture refunded` (`PAYMENT.CAPTURE.REFUNDED`)
   - `Payment capture reversed` (`PAYMENT.CAPTURE.REVERSED`)
6. Save the webhook and copy the generated **Webhook ID**.
7. Paste this Webhook ID into your local `.env`:
   ```env
   PAYPAL_WEBHOOK_ID=your_webhook_id_here
   ```

### Step 3: Test via Webhook Simulator & Real Sandbox Payment
1. **Webhook Simulator**: In PayPal Developer Dashboard > **Webhooks Simulator**, select your Webhook URL, choose `Payment capture completed`, and click **Send test**. Check your backend terminal to verify delivery, cryptographic signature check, and deduplication logging.
2. **Real Sandbox Payment**: Perform a test purchase via the ShopGenie frontend using Sandbox buyer credentials. The server captures and verifies the payment, marks the order `paid`, and safely processes any parallel or asynchronous webhooks idempotently without duplicate stock decrements.

---

## Verification & Test Suite

ShopGenie AI comes with 25 automated tests covering discovery, cart math, PayPal order lifecycles, webhooks, and security invariants:

```bash
npm test
```

### Key Tests Verified:
- **Budget Filtering**: Hard constraint excludes over-budget products (e.g. ₹89,990 MacBook M2 excluded for ₹50,000 budget).
- **Battery Priority**: Promotes 10h–12h battery laptops in ranking score and explanation.
- **Usage Profiles**: Programmer, Gamer, and Video Editor profiles produce divergent top recommendations on the same catalogue.
- **Cart Calculations**: Integer paise calculation prevents floating-point rounding bugs.
- **Tampering Invariant**: Client cannot tamper with prices; unit price is read strictly from SQLite products table.
- **AI Security Invariants**: Prompt injections ("make it free", "mark order paid") cannot alter cart totals or order states.
- **Cancellation Safe**: Order cancellation safely sets status to `cancelled` without clearing the cart.
- **Session Scoping**: One session cannot access or mutate another session's cart or orders.

---

## Documentation

- [System Architecture](docs/architecture.md): Deep-dive into system design, trust boundary, data model, and ranking math.
- [Demo Guide & 3-Minute Script](docs/demo-guide.md): Step-by-step evaluator testing path and video script.
- [Test Notes & Verification Report](docs/test-notes.md): Automated test coverage and PayPal Sandbox credentials guide.

---

## License

This project is licensed under the [MIT License](LICENSE).

