🛍️ ShopGenie AI

«Think Smart. Shop Better. Pay Smarter.

Autonomous discovery. Human-approved purchase.»

An AI-powered shopping assistant that helps users discover products through natural-language conversations, receive explainable recommendations, compare products and complete purchases through PayPal Sandbox checkout.

Customers remain in control of every purchase.

---

🚀 Live Demo

Resource| Link
🌐 Live Application| "ShopGenie AI" (https://shopgenie-ai-km58.onrender.com)
💻 GitHub Repository| "ShopGenie AI Source Code" (https://github.com/ROHITSAMPATHI-03/ShopGenie-AI)
🎥 Demo video |https://youtu.be/xz-UZdAqr1I?si=e8POUIggjxvEz408

Hosting: Render

«Demo availability: The application runs on Render's free tier. The service may take some time to respond after periods of inactivity.»

What You Can Try

1. Enter a natural-language shopping request.
2. Explore AI-assisted product discovery.
3. View ranked recommendations and their explanations.
4. Compare multiple products.
5. Add products to your shopping cart.
6. Review your order and proceed to PayPal Sandbox checkout.
7. Approve a test payment using PayPal Sandbox buyer credentials.

---

✨ Key Features

1. AI-Powered Product Discovery

- Understands natural-language shopping requests.
- Extracts structured requirements such as budget, category, usage and preferences.
- Uses Google Gemini 2.5 Flash to coordinate product discovery.
- Supports seven validated shopping tools.
- Provides a deterministic fallback for supported discovery operations when AI is unavailable.

2. Explainable Product Recommendations

- Deterministic multi-factor product ranking.
- Scores recommendations on a 0–100 scale.
- Considers budget fit, usage profiles, priorities, ratings and brand preferences.
- Explains matched requirements and product trade-offs.

3. Side-by-Side Product Comparison

- Compare 2–4 products.
- View specifications in a comparison matrix.
- Analyse price differences.
- Identify the best-value option using backend ranking logic.

4. Shopping Cart Management

- Add and remove products.
- Update quantities.
- Calculate totals using integer paise to avoid floating-point rounding errors.
- Retrieve product prices from the backend rather than trusting client-provided prices.

5. PayPal Sandbox Checkout

- PayPal Orders v2 REST API integration.
- PayPal JavaScript SDK checkout interface.
- Backend-controlled order creation and capture.
- Server-side payment status, currency and amount verification.
- Webhook signature verification and event deduplication.

6. Human-Approved Purchases

ShopGenie AI follows a clear separation between AI-powered product discovery and financial transactions.

The purchase flow works as follows:

1. The AI helps the customer discover suitable products.
2. The customer selects products and adds them to the cart.
3. The checkout page presents the order details and payment summary.
4. The customer reviews the order and explicitly initiates PayPal checkout.
5. PayPal displays its approval interface.
6. The customer reviews and approves the Sandbox transaction.
7. The backend captures and verifies the payment before confirming the order.

Important security principle: Gemini does not have direct access to payment creation, payment capture, price modification or order-payment confirmation operations. These operations remain controlled by the backend.

---

🧠 How AI Works

ShopGenie AI uses Google Gemini 2.5 Flash as its conversational shopping assistant.

AI Workflow

1. User enters a shopping request in natural language.
2. Gemini interprets the request and extracts shopping requirements.
3. The assistant coordinates validated shopping tools.
4. The backend retrieves suitable products from the catalogue.
5. A deterministic recommendation engine calculates product scores.
6. The application displays ranked recommendations with explanations and trade-offs.

Recommendation Scoring

The backend uses a weighted multi-factor scoring system:

Factor| Weight
Budget Fit| 25%
Usage Fit| 30%
Priority Match| 25%
Rating| 10%
Brand Preference| 10%
Total| 100%

The recommendation engine applies budget constraints and evaluates product suitability before presenting the results.

This approach combines conversational AI with predictable backend decision-making.

---

💳 PayPal Integration

ShopGenie AI integrates the PayPal Developer Platform using its free Sandbox environment.

Technologies Used

1. PayPal Orders v2 REST API

- Creates payment orders.
- Captures approved payments.
- Verifies payment status and transaction details.

2. PayPal JavaScript SDK

- Provides the frontend checkout experience.
- Allows customers to approve their Sandbox payments.

3. PayPal Webhooks

- Handles payment lifecycle events.
- Verifies webhook signatures.
- Uses event deduplication to help prevent duplicate processing.

Payment Security

The backend independently verifies:

- Expected payment amount.
- Transaction currency.
- Payment completion status.
- Order state before confirmation.

Prices are stored and calculated using integer paise and USD cents to reduce floating-point calculation errors.

Environment: PayPal Sandbox only. No real-money transactions are processed.

---

🏗️ System Architecture

ShopGenie AI uses a full-stack architecture consisting of a React frontend, Node.js backend, AI integration, SQLite database and PayPal payment services.

              CUSTOMER
                  |
                  v
          REACT FRONTEND
          (Vite + TypeScript)
                  |
                  v
          EXPRESS BACKEND
                  |
          +-------+-------+
          |               |
          v               v
     GEMINI API       SQLITE DATABASE
          |               |
          v               v
    AI SHOPPING       PRODUCT CATALOGUE
      ASSISTANT        CART & ORDERS
          |
          v
   VALIDATED SHOPPING TOOLS
          |
          v
   DETERMINISTIC RANKING
          |
          v
   PRODUCT RECOMMENDATIONS
          |
          v
      CUSTOMER CART
          |
          v
    PAYPAL CHECKOUT
          |
          v
    USER APPROVAL
          |
          v
   BACKEND CAPTURE &
   PAYMENT VERIFICATION
          |
          v
     ORDER CONFIRMATION

---

🛠️ Technology Stack

Layer| Technologies
Frontend| React 18, Vite, TypeScript, Tailwind CSS
Backend| Node.js 20+, Express 4, TypeScript
AI| Google Gemini 2.5 Flash
AI Integration| Google AI Studio OpenAI-compatible endpoint
Payments| PayPal Orders v2 REST API
Checkout| PayPal JavaScript SDK, "@paypal/react-paypal-js"
Database| SQLite, "node:sqlite", "better-sqlite3" fallback
Validation| Zod
Security| Helmet, CORS, express-rate-limit
Testing| Vitest, Supertest
Hosting| Render

---

⚙️ Local Installation and Setup

Prerequisites

- Node.js 20 or later.
- npm or pnpm.
- Google Gemini API key.
- PayPal Developer Sandbox application credentials.

1. Clone the Repository

git clone https://github.com/ROHITSAMPATHI-03/ShopGenie-AI.git

cd ShopGenie-AI

2. Install Dependencies

npm run install:all

3. Configure Environment Variables

Copy ".env.example" to ".env".

Windows PowerShell:

Copy-Item .env.example .env

Linux / macOS:

cp .env.example .env

Configure the required credentials:

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# PayPal Sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
PAYPAL_ENV=sandbox

# Currency Configuration
CHARGE_CURRENCY=USD
INR_TO_USD=0.012

# Application Configuration
FRONTEND_ORIGIN=http://localhost:5173
SESSION_SECRET=your_secure_session_secret
DATABASE_PATH=./data/shopgenie.db
PORT=4000

Note: Gemini credentials are optional for supported deterministic fallback operations. PayPal Sandbox credentials are required for payment testing.

Never commit ".env" files or expose API secrets in frontend code.

4. Seed the Product Catalogue

The application includes 28 curated products across five categories.

npm run seed

5. Start the Application

npm run dev:all

This starts the backend and frontend development servers concurrently.

Open:

http://localhost:5173

---

📋 Available Commands

Command| Description
"npm run install:all"| Install all project dependencies
"npm run dev:all"| Start frontend and backend
"npm run dev"| Development startup alias
"npm run dev:backend"| Start backend only
"npm run dev:frontend"| Start frontend only
"npm run build"| Build frontend and backend
"npm run test"| Run automated tests
"npm run seed"| Seed product catalogue

---

🧪 Testing and Verification

The project includes an automated test suite covering product discovery, recommendation logic, cart calculations, payment operations, webhooks and security-related behaviour.

Run the tests using:

npm test

The currently documented test suite contains 39 automated tests across three suites. Confirm the latest test run before relying on this count.

Areas Covered

Product Discovery

- Budget-based filtering.
- Product suitability.
- Usage-profile recommendations.
- Priority-based ranking.

Cart and Pricing

- Integer paise calculations.
- Backend-controlled product pricing.
- Cart and order calculations.

Payment Processing

- PayPal order lifecycle.
- Capture verification.
- Payment cancellation.
- Transaction state handling.

Security

- Protection against client-side price tampering.
- Session isolation.
- CSRF protection.
- Webhook signature verification.
- Webhook retry and idempotency handling.

These tests validate application behaviour under the tested scenarios; they do not establish that every production environment or external integration is failure-proof.

---

🔔 PayPal Webhook Configuration

The backend exposes the following webhook endpoint:

POST /api/paypal/webhook

Local Webhook Testing

For local testing, a secure tunnel such as ngrok can expose the backend.

ngrok http 4000

Register the generated HTTPS URL in your PayPal Developer Dashboard:

https://your-ngrok-url/api/paypal/webhook

Configure the Sandbox webhook events supported by the application, including:

- "CHECKOUT.ORDER.APPROVED"
- "PAYMENT.CAPTURE.COMPLETED"
- "PAYMENT.CAPTURE.PENDING"
- "PAYMENT.CAPTURE.DENIED"
- "PAYMENT.CAPTURE.REFUNDED"
- "PAYMENT.CAPTURE.REVERSED"

Copy the generated Webhook ID into your local ".env" file.

PAYPAL_WEBHOOK_ID=your_webhook_id

Production Webhook Configuration

For the Render deployment, the intended webhook URL is:

https://shopgenie-ai-km58.onrender.com/api/paypal/webhook

To enable production webhook delivery:

1. Open the PayPal Developer Dashboard.
2. Select your Sandbox application.
3. Register the Render webhook URL.
4. Select the supported event types.
5. Copy the generated Webhook ID.
6. Configure "PAYPAL_WEBHOOK_ID" in Render environment variables.
7. Verify webhook delivery using the PayPal Webhooks Simulator.

Production verification status: Registering a local ngrok webhook does not automatically configure the Render deployment. Production webhook delivery must be independently tested.

---

⚠️ Current Limitations and Known Constraints

We believe in documenting the current capabilities and limitations of the prototype transparently.

Product Catalogue

The current application uses 28 curated products across five categories.

It does not currently represent a live marketplace-wide product catalogue or guarantee real-time market prices.

Currency Conversion

The application uses a fixed INR-to-USD conversion rate:

INR_TO_USD=0.012

This is a demonstration conversion rate and is not connected to a live foreign exchange service.

Payment Environment

PayPal integration operates in Sandbox mode.

No real-money transactions are processed.

Hosting and Availability

The application is hosted on Render's free tier.

The service may sleep after inactivity, resulting in slower initial responses when it starts again.

Database Persistence

The application uses SQLite.

Database persistence on Render depends on the configured storage location and persistent disk settings. If the database is stored on an ephemeral filesystem, its contents may be lost following redeployment or instance replacement.

Demo data may therefore need to be reseeded depending on the deployment configuration.

AI Dependency

Gemini-powered functionality depends on API availability, configured credentials and applicable usage limits.

Supported deterministic backend operations can provide fallback behaviour when AI functionality is unavailable.

---

📁 Project Documentation

Additional technical documentation is available in the repository:

- "System Architecture" (docs/architecture.md) – Architecture, security boundaries, database design and recommendation scoring.
- "Demo Guide" (docs/demo-guide.md) – Evaluator instructions and demonstration script.
- "Test Notes" (docs/test-notes.md) – Automated testing and verification details.

---

🔮 Future Improvements

Potential future improvements include:

- Expanding the product catalogue.
- Integrating live product and price feeds.
- Dynamic currency conversion using exchange-rate services.
- Persistent production database infrastructure.
- Enhanced conversational shopping preferences.
- Additional recommendation personalisation.
- Expanded production monitoring and integration testing.

---

🎯 Project Objective

ShopGenie AI demonstrates how conversational AI, explainable recommendation systems and secure digital payments can work together to improve the online shopping experience.

Our central design principle is simple:

AI helps customers discover what to buy. Customers decide what to buy. The backend securely handles how they pay.

---

👨‍💻 Contributors

Developed as a hackathon project.

GitHub Repository:
https://github.com/ROHITSAMPATHI-03/ShopGenie-AI

Live Application:
https://shopgenie-ai-km58.onrender.com

---

📄 License

This project is licensed under the "MIT License" (LICENSE).
