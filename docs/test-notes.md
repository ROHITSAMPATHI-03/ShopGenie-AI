# ShopGenie AI — Test Notes & Verification Report

---

## 1. Automated Test Suite Summary

The automated test suite runs via Vitest and covers unit, integration, and security layers.

### Run All Tests
```bash
npm test
# Or inside backend:
cd backend && npm test
```

### Verified Test Matrix (18 Tests Across 3 Suites)

#### Discovery & Recommendation Engine (`discovery_cart_payment.test.ts`)
- [x] **Budget Exclusion**: Laptops exceeding budget (e.g., MacBook M2 ₹89,990, HP Pavilion ₹54,990) are strictly excluded from results when budget is ₹50,000.
- [x] **Battery Priority**: Prioritizing battery life promotes high-endurance devices (10h-12h rating) with higher priority match scores and clear explanation badges.
- [x] **Divergent Usage Profiles**: Student, Gamer, and Video Editor profiles produce visibly different top rankings on the same catalogue (e.g. Gamer selects ASUS TUF Gaming with dedicated GPU & 144Hz screen).
- [x] **No Hallucinated Specs**: Phone evaluations do not apply laptop RAM or CPU compilation criteria.

#### Comparison Engine (`discovery_cart_payment.test.ts`)
- [x] **Side-by-side Matrix**: 2 to 4 products compared accurately with spec values, price differences, and deterministic best-value score.
- [x] **Boundary Enforcement**: Rejects comparisons with fewer than 2 or more than 4 products.

#### Cart Calculations & Security (`discovery_cart_payment.test.ts`)
- [x] **Integer Paise Precision**: Computes server-side totals in integer paise and rupees without binary floating-point drift.
- [x] **Quantity Mutations**: Updating item quantity recalculates totals on the server.
- [x] **Quantity Bounds**: Strict validation rejects quantities <1 or >10.
- [x] **Session Isolation**: Session A cannot access, view, or modify Session B's cart.

#### Order Snapshots & Payment Lifecycles (`discovery_cart_payment.test.ts`)
- [x] **Immutable Order Snapshot**: Creates order record with frozen item names, unit prices in paise, and exact converted USD cents.
- [x] **Cart Preservation on Cancel**: Order cancellation marks status `cancelled` while preserving user cart intact.
- [x] **Session Scoping & Persistence**: Past orders survive across queries and only appear for the owning session.

#### Security & Trust Boundaries (`security.test.ts`)
- [x] **Tool Allow-List (SEC-7)**: Never exposes payment creation, capture, or price manipulation tools to Gemini.
- [x] **Price Tampering Protection (SEC-3)**: Prompt injections attempting to "make it free" or "set price to 0" have 0 effect on server cart calculations.
- [x] **Payment State Protection (SEC-8)**: Prompt injections attempting to "mark order paid" are rejected with no state change.
- [x] **Cancellation Invariant**: Order cancellation cannot overwrite an already paid order.

---

## 2. PayPal Sandbox Testing Credentials Guide

To run live Sandbox approval in your browser:
1. Obtain Sandbox credentials from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Create or locate a **Sandbox Personal (Buyer)** account in **Sandbox > Accounts**.
3. Set your `.env` file with:
   ```env
   PAYPAL_CLIENT_ID=<your-sandbox-client-id>
   PAYPAL_CLIENT_SECRET=<your-sandbox-client-secret>
   PAYPAL_ENV=sandbox
   ```
4. Restart backend server (`npm run dev`).
5. In Checkout, log into the PayPal popup with your Sandbox Buyer email and password to complete the live capture!

---

## 3. Persistence & Deployment Notes

- **Database**: SQLite with `better-sqlite3` storing in `./data/shopgenie.db`.
- **Persistent Disk**: For production deployments (such as Render or Railway), mount a persistent disk to the `./data` directory to retain orders across server restarts.
- **CSRF / Cookies**: Session cookies are configured with `HttpOnly: true`. In production with HTTPS, cookies are configured with `secure: true` and `sameSite: 'none'` (or `'lax'` on same-origin).

