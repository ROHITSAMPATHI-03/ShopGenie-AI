import { describe, it, expect, beforeEach } from 'vitest';
import { ProductService } from '../services/productService.js';
import { RecommendService } from '../services/recommendService.js';
import { CompareService } from '../services/compareService.js';
import { CartService } from '../services/cartService.js';
import { OrderService } from '../services/orderService.js';
import { getDatabase } from '../database/db.js';

describe('ShopGenie AI - Comprehensive Verification Suite', () => {
  const testSession1 = 'ses_test_alice_1234567890';
  const testSession2 = 'ses_test_bob_0987654321';

  beforeEach(() => {
    // Reset test carts for clean test runs
    CartService.clearCart(testSession1);
    CartService.clearCart(testSession2);
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
});

