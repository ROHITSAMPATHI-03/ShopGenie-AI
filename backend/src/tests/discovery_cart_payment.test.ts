import { describe, it, expect, beforeEach } from 'vitest';
import { handlePayPalWebhook } from '../routes/paymentRoutes.js';
import { ProductService } from '../services/productService.js';
import { RecommendService } from '../services/recommendService.js';
import { CompareService } from '../services/compareService.js';
import { CartService } from '../services/cartService.js';
import { OrderService } from '../services/orderService.js';
import { AgentService } from '../services/agentService.js';
import { getDatabase } from '../database/db.js';

describe('ShopGenie AI - Comprehensive Verification Suite', () => {
  const testSession1 = 'ses_test_alice_1234567890';
  const testSession2 = 'ses_test_bob_0987654321';

  beforeEach(() => {
    // Reset test carts and product stock for clean repeatable test runs
    CartService.clearCart(testSession1);
    CartService.clearCart(testSession2);
    const db = getDatabase();
    db.prepare("UPDATE products SET stock = 15 WHERE id = 'LAP-001'").run();
    db.prepare("UPDATE products SET stock = 12 WHERE id = 'LAP-002'").run();
  });

  describe('1. Discovery & Recommendation Engine (FR-2, 3, 5, 9)', () => {
    it('Budget filtering strictly excludes products above the specified ceiling', () => {
      const budgetMaxInr = 50000;
      const budgetMaxPaise = budgetMaxInr * 100;

      const results = RecommendService.rankProducts({
        category: 'laptops',
        budgetMaxPaise,
        usage: 'student',
      });

      expect(results.length).toBeGreaterThan(0);
      for (const item of results) {
        expect(item.product.price_inr_paise).toBeLessThanOrEqual(budgetMaxPaise);
        expect(item.product.price_inr).toBeLessThanOrEqual(budgetMaxInr);
      }

      // Check that expensive laptops (MacBook M2 ₹89,990, HP Pavilion ₹54,990) are excluded
      const ids = results.map(r => r.product.id);
      expect(ids).not.toContain('LAP-007'); // MacBook Air M2
      expect(ids).not.toContain('LAP-005'); // HP Pavilion (₹54,990)
    });

    it('Prioritizing battery life promotes high-battery laptops in ranking and explanation', () => {
      const standardRanking = RecommendService.rankProducts({
        category: 'laptops',
        budgetMaxPaise: 5000000,
        usage: 'everyday',
      });

      const batteryFocusedRanking = RecommendService.rankProducts({
        category: 'laptops',
        budgetMaxPaise: 5000000,
        usage: 'everyday',
        priorities: ['battery', 'endurance'],
      });

      // LAP-001 (ThinkPad E14 with 12h battery) or LAP-003 (IdeaPad with 11h battery) should rank high
      const topPick = batteryFocusedRanking[0];
      expect(topPick.product.specs.battery_hours).toBeGreaterThanOrEqual(10);
      expect(topPick.breakdown.priorityMatch).toBeGreaterThan(0.6);
      expect(topPick.matchedRequirements.some(r => r.toLowerCase().includes('battery'))).toBe(true);
    });

    it('Different usage profiles produce visibly different rankings on the catalogue', () => {
      const programmerPicks = RecommendService.rankProducts({
        category: 'laptops',
        budgetMaxPaise: 9000000, // ₹90k ceiling
        usage: 'programmer',
      });

      const gamerPicks = RecommendService.rankProducts({
        category: 'laptops',
        budgetMaxPaise: 9000000,
        usage: 'gamer',
      });

      const videoEditorPicks = RecommendService.rankProducts({
        category: 'laptops',
        budgetMaxPaise: 9000000,
        usage: 'video_editor',
      });

      // Top picks should reflect the divergent needs
      expect(programmerPicks[0].product.id).toBeDefined();
      expect(gamerPicks[0].product.id).toBe('LAP-006'); // ASUS TUF Gaming with RTX GPU & 144Hz
      expect(videoEditorPicks[0].product.specs.color_gamut).toBeDefined();
    });

    it('Missing or optional specs do not hallucinate false claims', () => {
      const phonePicks = RecommendService.rankProducts({
        category: 'phones',
        usage: 'student',
      });

      for (const pick of phonePicks) {
        expect(pick.product.category).toBe('phones');
        // Laptop RAM rules must NOT be applied to phones!
        expect(pick.matchedRequirements.some(r => r.includes('for compiling'))).toBe(false);
      }
    });

    it('Out-of-domain guardrail uses word boundaries and catalogue bypasses (Item 2)', async () => {
      const oodSession = `ses_ood_test_${Date.now()}`;

      // 1. "MacBook Air vs Pavilion" contains "book" as substring, but is a laptop -> MUST NOT BLOCK
      const res1 = await AgentService.handleUserMessage(oodSession, 'MacBook Air vs Pavilion');
      expect(res1.activities).not.toContain('Out-of-domain guardrail applied');

      // 2. "phone with memory card slot" -> MUST NOT BLOCK
      const res2 = await AgentService.handleUserMessage(oodSession, 'phone with memory card slot');
      expect(res2.activities).not.toContain('Out-of-domain guardrail applied');

      // 3. "adjustable stand monitor" contains "table" as substring in adjustable, but is monitor -> MUST NOT BLOCK
      const res3 = await AgentService.handleUserMessage(oodSession, 'adjustable stand monitor');
      expect(res3.activities).not.toContain('Out-of-domain guardrail applied');

      // 4. "buy me shoes" is genuinely out-of-domain -> MUST BLOCK
      const res4 = await AgentService.handleUserMessage(oodSession, 'buy me shoes');
      expect(res4.activities).toContain('Out-of-domain guardrail applied');
      expect(res4.message).toMatch(/specialized.*strictly for electronics/i);
    });
  });

  describe('2. Comparison Engine (FR-4)', () => {
    it('Accurately compares two to four products with specs, price diffs, and best-value pick', () => {
      const productIds = ['LAP-001', 'LAP-002', 'LAP-003'];
      const comparison = CompareService.compareProducts(productIds, 'battery');

      expect(comparison.products.length).toBe(3);
      expect(comparison.priceDifference.cheapestId).toBe('LAP-003'); // IdeaPad Slim 3 ₹44,990
      expect(comparison.priceDifference.priciestId).toBe('LAP-001'); // ThinkPad E14 ₹49,990
      expect(comparison.priceDifference.differenceInr).toBe(5000); // 49990 - 44990 = 5000
      expect(comparison.bestValuePick.productId).toBeDefined();
      expect(comparison.bestValuePick.reason).toContain('ratio');
      expect(comparison.specMatrix.ram_gb).toEqual([16, 16, 16]);
    });

    it('Rejects comparisons with fewer than 2 or more than 4 products', () => {
      expect(() => CompareService.compareProducts(['LAP-001'])).toThrow();
      expect(() => CompareService.compareProducts(['LAP-001', 'LAP-002', 'LAP-003', 'LAP-004', 'LAP-005'])).toThrow();
    });
  });

  describe('3. Cart Calculations & Security (FR-6, SEC-3, SEC-6)', () => {
    it('Adds items and correctly calculates server totals in paise and rupees', () => {
      // Add LAP-001 (₹49,990 = 4,999,000 paise)
      let cart = CartService.addItem(testSession1, 'LAP-001', 1);
      expect(cart.itemCount).toBe(1);
      expect(cart.subtotalInrPaise).toBe(4999000);
      expect(cart.subtotalInr).toBe(49990);
      expect(cart.totalInrPaise).toBe(4999000);

      // Add AUD-001 (₹22,990 = 2,299,000 paise)
      cart = CartService.addItem(testSession1, 'AUD-001', 2);
      expect(cart.itemCount).toBe(3);
      const expectedTotalPaise = 4999000 + (2299000 * 2); // 4999000 + 4598000 = 9597000
      expect(cart.totalInrPaise).toBe(expectedTotalPaise);
      expect(cart.totalInr).toBe(95970);
    });

    it('Quantity update re-computes server totals accurately', () => {
      CartService.addItem(testSession1, 'LAP-002', 1);
      const cart = CartService.getCart(testSession1);
      const itemId = cart.items[0].id;

      const updatedCart = CartService.updateQuantity(testSession1, itemId, 3);
      expect(updatedCart.itemCount).toBe(3);
      expect(updatedCart.totalInrPaise).toBe(4899000 * 3);
    });

    it('Enforces strict quantity boundaries (1 to 10)', () => {
      expect(() => CartService.addItem(testSession1, 'LAP-001', 0)).toThrow();
      expect(() => CartService.addItem(testSession1, 'LAP-001', 11)).toThrow();
    });

    it('Guarantees session isolation: Session A cannot access or modify Session B cart', () => {
      CartService.addItem(testSession1, 'LAP-001', 1);
      const cartA = CartService.getCart(testSession1);
      expect(cartA.itemCount).toBe(1);

      // Session B should have an empty cart
      const cartB = CartService.getCart(testSession2);
      expect(cartB.itemCount).toBe(0);

      // Session B cannot mutate Session A's cart item
      const itemAId = cartA.items[0].id;
      expect(() => CartService.updateQuantity(testSession2, itemAId, 2)).toThrow();
    });
  });

  describe('4. Order Snapshotting & Payment Lifecycles (FR-7, 8, SEC-4, SEC-5, SEC-8)', () => {
    it('Creates an immutable internal order snapshot with exact frozen prices and USD conversion', () => {
      CartService.addItem(testSession1, 'LAP-001', 1);
      const order = OrderService.createOrderFromCart(testSession1);

      expect(order.id).toMatch(/^ORD-/);
      expect(order.status).toBe('pending');
      expect(order.items.length).toBe(1);
      expect(order.items[0].name).toBe('Lenovo ThinkPad E14 Gen 5');
      expect(order.items[0].unitPriceInrPaise).toBe(4999000);
      expect(order.totalInrPaise).toBe(4999000);

      // USD charge calculation check: 4999000 paise * 0.012 = 59988 cents = $599.88
      expect(order.chargeCurrency).toBe('USD');
      expect(order.chargeAmountUsdCents).toBe(Math.round(4999000 * 0.012));
      expect(order.chargeAmountUsd).toBe('599.88');
    });

    it('Order cancellation preserves the user shopping cart intact', () => {
      CartService.addItem(testSession1, 'LAP-003', 1);
      const order = OrderService.createOrderFromCart(testSession1);

      const cancelled = OrderService.cancelOrder(testSession1, order.id);
      expect(cancelled.status).toBe('cancelled');

      // Cart must remain intact with the item!
      const cart = CartService.getCart(testSession1);
      expect(cart.itemCount).toBe(1);
      expect(cart.items[0].productId).toBe('LAP-003');
    });

    it('Orders survive database querying and maintain session scoping', () => {
      CartService.addItem(testSession1, 'LAP-004', 1);
      const order = OrderService.createOrderFromCart(testSession1);

      const userOrders = OrderService.getOrdersBySession(testSession1);
      expect(userOrders.some(o => o.id === order.id)).toBe(true);

      const otherUserOrders = OrderService.getOrdersBySession(testSession2);
      expect(otherUserOrders.some(o => o.id === order.id)).toBe(false);
    });
  });

  describe('5. PayPal Webhook & Idempotency Pipeline', () => {
    const webhookSession = 'ses_test_webhook_99881122';

    function createMockReqRes(body: any, headers: Record<string, string> = {}) {
      const req = {
        body: Buffer.from(JSON.stringify(body)),
        headers,
      } as any;

      let statusCode = 200;
      let responseData: any = null;

      const res = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          responseData = data;
          return this;
        },
        get statusCode() {
          return statusCode;
        },
        get body() {
          return responseData;
        },
      } as any;

      return { req, res };
    }

    beforeEach(() => {
      CartService.clearCart(webhookSession);
    });

    it('Rejects unauthorized webhook request without valid signature headers with 400', async () => {
      const { req, res } = createMockReqRes(
        { id: 'WH-TEST-UNAUTH-1', event_type: 'PAYMENT.CAPTURE.COMPLETED' },
        { 'content-type': 'application/json' }
      );

      await handlePayPalWebhook(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/Invalid PayPal webhook signature/i);
    });

    it('Deduplicates events by event ID and returns 200 without duplicate side effects', async () => {
      const eventId = `WH-DEDUP-${Date.now()}`;
      const payload = {
        id: eventId,
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: { id: 'CAP-DEDUP-001', amount: { value: '10.00', currency_code: 'USD' } },
      };

      // First delivery with test signature bypass header
      const mock1 = createMockReqRes(payload, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(mock1.req, mock1.res);

      expect(mock1.res.statusCode).toBe(200);
      expect(mock1.res.body.received).toBe(true);
      expect(mock1.res.body.deduplicated).toBeUndefined();

      // Duplicate delivery with same event ID
      const mock2 = createMockReqRes(payload, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(mock2.req, mock2.res);

      expect(mock2.res.statusCode).toBe(200);
      expect(mock2.res.body.deduplicated).toBe(true);
    });

    it('Strictly detects amount tampering on PAYMENT.CAPTURE.COMPLETED and marks order failed', async () => {
      CartService.addItem(webhookSession, 'LAP-001', 1);
      const order = OrderService.createOrderFromCart(webhookSession);

      // Create linked payment in DB
      const db = getDatabase();
      const fakePaypalOrderId = `PAYPAL-TAMPER-${Date.now()}`;
      db.prepare(`
        INSERT INTO payments (id, order_id, paypal_order_id, idempotency_key, status, amount_cents, currency)
        VALUES (?, ?, ?, ?, 'CREATED', ?, ?)
      `).run(`pay_${Date.now()}`, order.id, fakePaypalOrderId, `idemp_${order.id}`, order.chargeAmountUsdCents, order.chargeCurrency);

      // Webhook event with tampered (lower) amount
      const tamperedEvent = {
        id: `WH-TAMPER-${Date.now()}`,
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {
          id: `CAP-TAMPER-${Date.now()}`,
          order_id: fakePaypalOrderId,
          amount: { value: '1.00', currency_code: 'USD' }, // Tampered: expected != $1.00
        },
      };

      const { req, res } = createMockReqRes(tamperedEvent, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.error).toMatch(/mismatch/i);

      // Order status should be marked failed, never paid
      const refreshed = OrderService.getOrderById(order.id);
      expect(refreshed?.status).toBe('failed');
    });

    it('Processes valid PAYMENT.CAPTURE.COMPLETED: marks paid, decrements stock, clears cart idempotently', async () => {
      CartService.addItem(webhookSession, 'LAP-002', 1);
      const initialProduct = ProductService.getProductById('LAP-002');
      const initialStock = initialProduct!.stock;

      const order = OrderService.createOrderFromCart(webhookSession);
      const db = getDatabase();
      const fakePaypalOrderId = `PAYPAL-VALID-${Date.now()}`;
      const fakeCaptureId = `CAP-VALID-${Date.now()}`;

      db.prepare(`
        INSERT INTO payments (id, order_id, paypal_order_id, idempotency_key, status, amount_cents, currency)
        VALUES (?, ?, ?, ?, 'CREATED', ?, ?)
      `).run(`pay_${Date.now()}`, order.id, fakePaypalOrderId, `idemp_${order.id}`, order.chargeAmountUsdCents, order.chargeCurrency);

      const validEvent = {
        id: `WH-VALID-${Date.now()}`,
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {
          id: fakeCaptureId,
          order_id: fakePaypalOrderId,
          amount: { value: order.chargeAmountUsd, currency_code: order.chargeCurrency },
        },
      };

      const { req, res } = createMockReqRes(validEvent, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(req, res);

      expect(res.statusCode).toBe(200);

      const refreshedOrder = OrderService.getOrderById(order.id);
      expect(refreshedOrder?.status).toBe('paid');
      expect(refreshedOrder?.payment?.paypalCaptureId).toBe(fakeCaptureId);

      // Stock was decremented by 1
      const updatedProduct = ProductService.getProductById('LAP-002');
      expect(updatedProduct!.stock).toBe(initialStock - 1);

      // Cart was cleared
      const refreshedCart = CartService.getCart(webhookSession);
      expect(refreshedCart.itemCount).toBe(0);

      // Direct markPaid call to verify idempotency: calling markPaid again must NOT decrement stock again!
      OrderService.markPaid(order.id, fakeCaptureId);
      const productAfterSecondCall = ProductService.getProductById('LAP-002');
      expect(productAfterSecondCall!.stock).toBe(initialStock - 1);
    });

    it('Processes PAYMENT.CAPTURE.DENIED: marks order failed and preserves cart for retry', async () => {
      CartService.addItem(webhookSession, 'MON-001', 1);
      const order = OrderService.createOrderFromCart(webhookSession);

      const db = getDatabase();
      const fakePaypalOrderId = `PAYPAL-DENIED-${Date.now()}`;
      db.prepare(`
        INSERT INTO payments (id, order_id, paypal_order_id, idempotency_key, status, amount_cents, currency)
        VALUES (?, ?, ?, ?, 'CREATED', ?, ?)
      `).run(`pay_${Date.now()}`, order.id, fakePaypalOrderId, `idemp_${order.id}`, order.chargeAmountUsdCents, order.chargeCurrency);

      const deniedEvent = {
        id: `WH-DENIED-${Date.now()}`,
        event_type: 'PAYMENT.CAPTURE.DENIED',
        resource: {
          id: `CAP-DENIED-${Date.now()}`,
          order_id: fakePaypalOrderId,
        },
      };

      const { req, res } = createMockReqRes(deniedEvent, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(req, res);

      expect(res.statusCode).toBe(200);

      const refreshedOrder = OrderService.getOrderById(order.id);
      expect(refreshedOrder?.status).toBe('failed');

      // Cart must remain intact for customer to retry
      const refreshedCart = CartService.getCart(webhookSession);
      expect(refreshedCart.itemCount).toBe(1);
    });

    it('Allows webhook retry when previous execution failed instead of wrongly treating as deduplicated', async () => {
      CartService.addItem(webhookSession, 'AUD-001', 1);
      const order = OrderService.createOrderFromCart(webhookSession);
      const db = getDatabase();
      const fakePaypalOrderId = `PAYPAL-RETRY-TEST-${Date.now()}`;
      const fakeCaptureId = `CAP-RETRY-TEST-${Date.now()}`;
      const eventId = `WH-RETRY-${Date.now()}`;

      db.prepare(`
        INSERT INTO payments (id, order_id, paypal_order_id, idempotency_key, status, amount_cents, currency)
        VALUES (?, ?, ?, ?, 'CREATED', ?, ?)
      `).run(`pay_${Date.now()}`, order.id, fakePaypalOrderId, `idemp_${order.id}`, order.chargeAmountUsdCents, order.chargeCurrency);

      // Event payload with invalid/mismatched event type or simulating handler exception
      // We simulate a failed webhook event by pre-marking or triggering error
      db.prepare("INSERT INTO webhook_events (id, event_type, status, error_message) VALUES (?, 'PAYMENT.CAPTURE.COMPLETED', 'failed', 'Simulated transient network failure')")
        .run(eventId);

      // Verify DB shows failed
      const failedEntry = db.prepare('SELECT status FROM webhook_events WHERE id = ?').get(eventId) as any;
      expect(failedEntry.status).toBe('failed');

      // Now PayPal retries the exact same event ID with valid completed resource
      const retryEvent = {
        id: eventId,
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {
          id: fakeCaptureId,
          order_id: fakePaypalOrderId,
          amount: { value: order.chargeAmountUsd, currency_code: order.chargeCurrency },
        },
      };

      const mockRetry = createMockReqRes(retryEvent, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(mockRetry.req, mockRetry.res);

      expect(mockRetry.res.statusCode).toBe(200);
      expect(mockRetry.res.body.received).toBe(true);
      // It should NOT have been skipped as deduplicated!
      expect(mockRetry.res.body.deduplicated).toBeUndefined();

      // Order is now successfully paid
      const paidOrder = OrderService.getOrderById(order.id);
      expect(paidOrder?.status).toBe('paid');

      // Database event record is now updated to completed
      const completedEntry = db.prepare('SELECT status FROM webhook_events WHERE id = ?').get(eventId) as any;
      expect(completedEntry.status).toBe('completed');

      // A third delivery of the now-completed event should be properly deduplicated
      const mockThird = createMockReqRes(retryEvent, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(mockThird.req, mockThird.res);
      expect(mockThird.res.statusCode).toBe(200);
      expect(mockThird.res.body.deduplicated).toBe(true);
    });

    it('Processes PAYMENT.CAPTURE.REFUNDED and PAYMENT.CAPTURE.REVERSED idempotently and locks order from being marked paid', async () => {
      CartService.addItem(webhookSession, 'AUD-002', 1);
      const order = OrderService.createOrderFromCart(webhookSession);
      const db = getDatabase();
      const fakePaypalOrderId = `PAYPAL-REFUND-${Date.now()}`;
      const fakeCaptureId = `CAP-REFUND-${Date.now()}`;

      db.prepare(`
        INSERT INTO payments (id, order_id, paypal_order_id, idempotency_key, status, amount_cents, currency)
        VALUES (?, ?, ?, ?, 'CREATED', ?, ?)
      `).run(`pay_${Date.now()}`, order.id, fakePaypalOrderId, `idemp_${order.id}`, order.chargeAmountUsdCents, order.chargeCurrency);

      // First mark order as paid
      OrderService.markPaid(order.id, fakeCaptureId);
      expect(OrderService.getOrderById(order.id)?.status).toBe('paid');

      // Deliver PAYMENT.CAPTURE.REFUNDED
      const refundEvent = {
        id: `WH-REFUND-${Date.now()}`,
        event_type: 'PAYMENT.CAPTURE.REFUNDED',
        resource: {
          id: fakeCaptureId,
          order_id: fakePaypalOrderId,
        },
      };

      const mockRefund = createMockReqRes(refundEvent, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(mockRefund.req, mockRefund.res);
      expect(mockRefund.res.statusCode).toBe(200);

      const refundedOrder = OrderService.getOrderById(order.id);
      expect(refundedOrder?.status).toBe('refunded');

      // Stale or duplicate markPaid attempts on refunded order must be safely rejected
      OrderService.markPaid(order.id, fakeCaptureId);
      expect(OrderService.getOrderById(order.id)?.status).toBe('refunded');

      // Test reversal on another order
      CartService.addItem(webhookSession, 'AUD-002', 1);
      const order2 = OrderService.createOrderFromCart(webhookSession);
      const fakePaypalOrderId2 = `PAYPAL-REVERSE-${Date.now()}`;
      const fakeCaptureId2 = `CAP-REVERSE-${Date.now()}`;

      db.prepare(`
        INSERT INTO payments (id, order_id, paypal_order_id, idempotency_key, status, amount_cents, currency)
        VALUES (?, ?, ?, ?, 'CREATED', ?, ?)
      `).run(`pay_${Date.now()}`, order2.id, fakePaypalOrderId2, `idemp_${order2.id}`, order2.chargeAmountUsdCents, order2.chargeCurrency);

      OrderService.markPaid(order2.id, fakeCaptureId2);
      expect(OrderService.getOrderById(order2.id)?.status).toBe('paid');

      const reverseEvent = {
        id: `WH-REVERSE-${Date.now()}`,
        event_type: 'PAYMENT.CAPTURE.REVERSED',
        resource: {
          id: fakeCaptureId2,
          order_id: fakePaypalOrderId2,
        },
      };

      const mockReverse = createMockReqRes(reverseEvent, { 'x-test-bypass-signature': 'true' });
      await handlePayPalWebhook(mockReverse.req, mockReverse.res);
      expect(mockReverse.res.statusCode).toBe(200);

      const reversedOrder = OrderService.getOrderById(order2.id);
      expect(reversedOrder?.status).toBe('reversed');

      // Stale markPaid attempt on reversed order must also be safely rejected
      OrderService.markPaid(order2.id, fakeCaptureId2);
      expect(OrderService.getOrderById(order2.id)?.status).toBe('reversed');
    });
  });

  describe('6. AI Conversation Scoping & Reset (Item 2)', () => {
    const convSession = 'ses_conv_test_112233';
    const convId1 = 'conv_uuid_alpha_1';
    const convId2 = 'conv_uuid_beta_2';

    it('Scopes chat messages by conversationId and preserves cart on reset', async () => {
      CartService.clearCart(convSession);

      // 1. Add item to cart
      CartService.addItem(convSession, 'LAP-001', 1);

      // 2. Send message with convId1
      await AgentService.handleUserMessage(convSession, 'Recommend a laptop under 50000', convId1);

      // 3. Send message with convId2
      await AgentService.handleUserMessage(convSession, 'Find headphones', convId2);

      const db = getDatabase();
      const rowsConv1 = db.prepare('SELECT * FROM conversations WHERE session_id = ? AND conversation_id = ?').all(convSession, convId1);
      const rowsConv2 = db.prepare('SELECT * FROM conversations WHERE session_id = ? AND conversation_id = ?').all(convSession, convId2);

      expect(rowsConv1.length).toBeGreaterThan(0);
      expect(rowsConv2.length).toBeGreaterThan(0);

      // 4. Reset convId1
      AgentService.resetConversation(convSession, convId1);

      const rowsConv1After = db.prepare('SELECT * FROM conversations WHERE session_id = ? AND conversation_id = ?').all(convSession, convId1);
      const rowsConv2After = db.prepare('SELECT * FROM conversations WHERE session_id = ? AND conversation_id = ?').all(convSession, convId2);

      expect(rowsConv1After.length).toBe(0);
      expect(rowsConv2After.length).toBeGreaterThan(0);

      // 5. Cart MUST be kept!
      const cart = CartService.getCart(convSession);
      expect(cart.itemCount).toBe(1);
      expect(cart.items[0].productId).toBe('LAP-001');
    }, 15000);

    it('Loads latest 10 messages in chronological order, correctly resolving latest recommendations after 12+ messages (Item 3)', async () => {
      const db = getDatabase();
      const testSession = `ses_history_order_${Date.now()}`;
      const convId = 'conv_history_order';

      // Ensure test session exists
      db.prepare('INSERT OR IGNORE INTO sessions (id) VALUES (?)').run(testSession);

      // Insert 12 messages with timestamps incrementing
      const baseTime = Date.now() - 60000;
      for (let i = 1; i <= 12; i++) {
        const timeStr = new Date(baseTime + i * 1000).toISOString();
        let metaJson = '{}';
        if (i === 2) {
          // Old recommendation
          metaJson = JSON.stringify({ recommendedIds: ['LAP-001', 'LAP-002'] });
        } else if (i === 11) {
          // Latest recommendation
          metaJson = JSON.stringify({ recommendedIds: ['LAP-003', 'LAP-004'] });
        }

        db.prepare(`
          INSERT INTO conversations (id, session_id, conversation_id, role, content, metadata_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(`msg_${testSession}_${i}`, testSession, convId, i % 2 === 1 ? 'user' : 'assistant', `Test message ${i}`, metaJson, timeStr);
      }

      // Now send refinement: "compare the first two"
      const res = await AgentService.handleUserMessage(testSession, 'compare the first two', convId);

      // It must compare LAP-003 and LAP-004 (from message 11), NOT LAP-001 and LAP-002 (from message 2)
      expect(res.comparison).toBeDefined();
      const comparedIds = res.comparison?.products.map(p => p.id);
      expect(comparedIds).toContain('LAP-003');
      expect(comparedIds).toContain('LAP-004');
      expect(comparedIds).not.toContain('LAP-001');
    });
  });

  describe('7. End-to-End Buyer Journey & Edge Cases (Item 10)', () => {
    it('Executes the full end-to-end buyer journey successfully', () => {
      const journeySession = `ses_journey_${Date.now()}`;

      // 1. Search & Rank laptops within budget (₹50,000) for programming
      const rankings = RecommendService.rankProducts({
        category: 'laptops',
        budgetMaxPaise: 5000000,
        usage: 'programmer',
      });
      expect(rankings.length).toBeGreaterThanOrEqual(2);
      expect(rankings[0].matchedRequirements.length).toBeGreaterThan(0);

      // 2. Compare top 2 laptops
      const topIds = [rankings[0].product.id, rankings[1].product.id];
      const comparison = CompareService.compareProducts(topIds);
      expect(comparison.products.length).toBe(2);
      expect(comparison.bestValuePick.productId).toBeDefined();

      // 3. Add best value product to cart
      const chosenProductId = comparison.bestValuePick.productId;
      const initialStock = ProductService.getProductById(chosenProductId)!.stock;
      const cartAfterAdd = CartService.addItem(journeySession, chosenProductId, 1);
      expect(cartAfterAdd.itemCount).toBe(1);

      // 4. Create pending order (checkout snapshot)
      const order = OrderService.createOrderFromCart(journeySession);
      expect(order.status).toBe('pending');
      expect(order.items.length).toBe(1);
      expect(order.items[0].productId).toBe(chosenProductId);

      // 5. Capture payment (PayPal approval)
      const captureId = `CAP-E2E-${Date.now()}`;
      const paidOrder = OrderService.markPaid(order.id, captureId);
      expect(paidOrder.status).toBe('paid');
      expect(paidOrder.payment?.paypalCaptureId).toBe(captureId);

      // 6. Verify stock decremented & cart cleared
      const updatedProduct = ProductService.getProductById(chosenProductId);
      expect(updatedProduct!.stock).toBe(initialStock - 1);

      const clearedCart = CartService.getCart(journeySession);
      expect(clearedCart.itemCount).toBe(0);

      // 7. Verify order exists in user's order history
      const history = OrderService.getOrdersBySession(journeySession);
      expect(history.length).toBe(1);
      expect(history[0].id).toBe(order.id);
      expect(history[0].status).toBe('paid');
    });

    it('Mid-way checkout cancellation preserves cart and allows subsequent checkout retry', () => {
      const cancelSession = `ses_cancel_${Date.now()}`;

      // 1. Add item to cart
      CartService.addItem(cancelSession, 'KEY-001', 1);
      const cartBefore = CartService.getCart(cancelSession);
      expect(cartBefore.itemCount).toBe(1);

      // 2. Create pending order
      const order1 = OrderService.createOrderFromCart(cancelSession);
      expect(order1.status).toBe('pending');

      // 3. User cancels payment flow mid-way on PayPal modal
      const cancelledOrder = OrderService.cancelOrder(cancelSession, order1.id);
      expect(cancelledOrder.status).toBe('cancelled');

      // 4. Cart MUST still be kept intact
      const cartAfterCancel = CartService.getCart(cancelSession);
      expect(cartAfterCancel.itemCount).toBe(1);
      expect(cartAfterCancel.items[0].productId).toBe('KEY-001');

      // 5. Customer retries checkout with same cart
      const order2 = OrderService.createOrderFromCart(cancelSession);
      expect(order2.status).toBe('pending');
      expect(order2.id).not.toBe(order1.id);

      // 6. Completes payment on retry
      const completedOrder = OrderService.markPaid(order2.id, `CAP-RETRY-${Date.now()}`);
      expect(completedOrder.status).toBe('paid');

      // 7. Cart is cleared after successful retry
      const finalCart = CartService.getCart(cancelSession);
      expect(finalCart.itemCount).toBe(0);

      // 8. Order history shows both the cancelled attempt and the completed order
      const history = OrderService.getOrdersBySession(cancelSession);
      expect(history.length).toBe(2);
      expect(history.some(o => o.id === order1.id && o.status === 'cancelled')).toBe(true);
      expect(history.some(o => o.id === order2.id && o.status === 'paid')).toBe(true);
    });

    it('Reserves stock atomically at order creation and restores stock upon cancellation, failure, or refund (Item 5)', () => {
      const stockSession = `ses_stock_lifecycle_${Date.now()}`;
      const db = getDatabase();

      // Reset stock for MON-002 to known value 5
      db.prepare("UPDATE products SET stock = 5 WHERE id = 'MON-002'").run();
      expect(ProductService.getProductById('MON-002')?.stock).toBe(5);

      // 1. Add 2 units of MON-002 to cart
      CartService.addItem(stockSession, 'MON-002', 2);

      // 2. Create order: stock must be decremented immediately to 3
      const order = OrderService.createOrderFromCart(stockSession);
      expect(order.status).toBe('pending');
      expect(ProductService.getProductById('MON-002')?.stock).toBe(3);

      // 3. Attempting to create another order exceeding remaining stock fails with insufficient stock
      const greedySession = `ses_greedy_${Date.now()}`;
      CartService.addItem(greedySession, 'MON-002', 2);
      // Simulate concurrent reservation dropping stock below cart quantity
      db.prepare("UPDATE products SET stock = 1 WHERE id = 'MON-002'").run();
      expect(() => {
        OrderService.createOrderFromCart(greedySession);
      }).toThrow(/Insufficient stock/i);

      // Restore stock back to 3 for continuation
      db.prepare("UPDATE products SET stock = 3 WHERE id = 'MON-002'").run();

      // 4. Cancel the first order: stock must be restored from 3 back to 5
      OrderService.cancelOrder(stockSession, order.id);
      expect(ProductService.getProductById('MON-002')?.stock).toBe(5);

      // 5. Customer re-creates order: stock drops from 5 to 3
      const order2 = OrderService.createOrderFromCart(stockSession);
      expect(ProductService.getProductById('MON-002')?.stock).toBe(3);

      // 6. Complete payment: stock must NOT decrement twice (remains 3)
      OrderService.markPaid(order2.id, `CAP-STOCK-${Date.now()}`);
      expect(ProductService.getProductById('MON-002')?.stock).toBe(3);

      // 7. Refund the order: stock must be restored from 3 back to 5
      OrderService.markRefunded(order2.id);
      expect(ProductService.getProductById('MON-002')?.stock).toBe(5);
    });
  });
});

