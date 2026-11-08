# ShopGenie AI — Demo Guide & Judge Evaluation Path

This document provides a guided walkthrough for evaluators, judges, and developers testing ShopGenie AI.

---

## 1. Quick Start Local Run (Under 2 Minutes)

```bash
# 1. From workspace root, install dependencies (if not already installed)
npm run install:all

# 2. Seed database with 28 curated products across 5 categories
npm run seed

# 3. Start development servers (Backend: port 4000, Frontend: port 5173)
npm run dev
```

Open your browser to: **`http://localhost:5173`**

---

## 2. Judge Evaluation Path (End-to-End Walkthrough)

### Step 1: Natural Language Discovery
1. On the home page hero search bar, enter:
   > *"I am a college student. Find me a laptop under ₹50,000 for programming with good battery life."*
2. Press **Ask Genie** or Hit Enter.
3. Observe:
   - Grounded product picks appear: **Lenovo ThinkPad E14** (₹49,990, 16GB RAM, 12h battery) and **Acer Swift Go 14** (₹48,990, 16GB RAM, 10.5h battery).
   - Expensive laptops above ₹50,000 (such as Apple MacBook Air M2 ₹89,990, HP Pavilion ₹54,990) are strictly excluded by code.
   - Each card displays score breakdowns, matched criteria, and honest trade-offs.

### Step 2: Context Refinement
1. In the chat input, type:
   > *"Compare the first two."*
2. Observe:
   - ShopGenie identifies the top 2 candidate laptops and launches the side-by-side comparison modal with full specs, price spread, and best-value pick.

### Step 3: Cart Preparation
1. Click **Add to Cart** on one of the recommended laptops.
2. The slide-over cart drawer appears:
   - Subtotal is computed server-side in integer paise.
   - Exact USD Sandbox charge is displayed with transparent disclosure of the fixed demo rate (`1 INR = $0.012 USD`).
3. Increment the quantity to 2 and watch the server update totals.

### Step 4: Checkout & Sandbox Payment
1. Click **Review & Checkout** in the cart drawer.
2. You will be taken to `/checkout`:
   - Summary of the internal order snapshot.
   - Sandbox disclosure banner.
3. If PayPal Sandbox credentials are provided in `.env`:
   - Click the yellow **PayPal** button.
   - Log in with your PayPal Sandbox buyer account.
   - Approve the payment.
   - Server captures the payment, verifies status (`COMPLETED`), currency (`USD`), and exact expected amount.
   - Order confirmation page renders with internal Order ID and PayPal Capture ID!

### Step 5: Order History Persistence
1. Navigate to **Orders** in the navbar.
2. See your confirmed order. Refresh the page—history remains intact!

### Step 6: Payment Cancellation Test
1. Add an item to the cart and click Checkout.
2. In the PayPal popup, click **Cancel and return**.
3. Notice:
   - Order is recorded as `cancelled`.
   - Your cart remains intact without losing any items!

---

## 3. Three-Minute Video Demo Script

| Time | Screen | Spoken Script |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Home page & Hero | *"Welcome to ShopGenie AI. Online shopping is fragmented—shoppers bounce between spec sheets, reviews, and confusing filters. ShopGenie AI solves this with our core principle: Autonomous discovery, human-approved purchase."* |
| **0:25 - 1:05** | Typing laptop query | *"I'll enter: 'I am a college student. Find me a laptop under ₹50,000 for programming with good battery life.' Watch how our backend deterministically filters out over-budget laptops and ranks options on RAM, battery endurance, and compiler suitability. Each card shows why it fits and its honest trade-offs."* |
| **1:05 - 1:40** | Comparison matrix | *"Now let's ask: 'Compare the first two.' The assistant executes our side-by-side comparison engine. We see the spec matrix, price differences, and a code-calculated best-value pick."* |
| **1:40 - 2:25** | Cart & PayPal Checkout | *"I'll add the ThinkPad to my cart. Notice that totals are calculated strictly on the server in integer paise and converted to USD Sandbox cents. Crucially, the AI has zero payment permissions. When I click Checkout and approve in PayPal Sandbox, the server verifies the capture amount and marks it paid."* |
| **2:25 - 2:45** | Cancellation handling | *"If a customer closes the PayPal popup or cancels, the order is safely marked cancelled, and the cart is kept completely intact."* |
| **2:45 - 3:00** | Architecture slide | *"Built with React, Express, better-sqlite3, Gemini function calling, and PayPal Orders v2 REST API. Think Smart. Shop Better. Pay Smarter."* |

