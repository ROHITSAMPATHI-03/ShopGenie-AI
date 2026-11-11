import crypto from 'crypto';
import { getDatabase } from '../database/db.js';
import { CartService } from './cartService.js';
import { PayPalService } from './paypalService.js';
import { env } from '../config/env.js';

export interface OrderItemSnapshotDto {
  id: string;
  productId: string;
  name: string;
  unitPriceInrPaise: number;
  unitPriceInr: number;
  quantity: number;
  itemTotalInrPaise: number;
  itemTotalInr: number;
}

export interface OrderDto {
  id: string;
  sessionId: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'reversed';
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
  items: OrderItemSnapshotDto[];
  payment?: {
    paypalOrderId: string;
    paypalCaptureId?: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class OrderService {
  static createOrderFromCart(sessionId: string): OrderDto {
    const db = getDatabase();
    const cart = CartService.getCart(sessionId);

    if (cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    // Verify stock availability for all items
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new Error(`Insufficient stock for "${item.product.name}" (only ${item.product.stock} available)`);
      }
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const createTransaction = db.transaction(() => {
      // 1. Insert order record
      db.prepare(`
        INSERT INTO orders (
          id, session_id, status,
          subtotal_inr_paise, shipping_inr_paise, tax_inr_paise, total_inr_paise,
          charge_currency, charge_amount_usd_cents, inr_to_usd_rate
        ) VALUES (
          @id, @session_id, 'pending',
          @subtotal_inr_paise, @shipping_inr_paise, @tax_inr_paise, @total_inr_paise,
          @charge_currency, @charge_amount_usd_cents, @inr_to_usd_rate
        )
      `).run({
        id: orderId,
        session_id: sessionId,
        subtotal_inr_paise: cart.subtotalInrPaise,
        shipping_inr_paise: cart.shippingInrPaise,
        tax_inr_paise: cart.taxInrPaise,
        total_inr_paise: cart.totalInrPaise,
        charge_currency: cart.chargeCurrency,
        charge_amount_usd_cents: cart.chargeAmountUsdCents,
        inr_to_usd_rate: cart.inrToUsdRate,
      });

      // 2. Insert immutable order items snapshots
      const itemStmt = db.prepare(`
        INSERT INTO order_items (
          id, order_id, product_id, name_snapshot, unit_price_inr_paise_snapshot, quantity
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const item of cart.items) {
        const orderItemId = `item_${crypto.randomBytes(8).toString('hex')}`;
        itemStmt.run(
          orderItemId,
          orderId,
          item.productId,
          item.product.name,
          item.product.price_inr_paise,
          item.quantity
        );
      }
    });

    createTransaction();

    return this.getOrderById(orderId, sessionId)!;
  }

  static getOrderById(orderId: string, sessionId?: string): OrderDto | null {
    const db = getDatabase();

    const orderQuery = sessionId
      ? 'SELECT * FROM orders WHERE id = ? AND session_id = ?'
      : 'SELECT * FROM orders WHERE id = ?';
    const params = sessionId ? [orderId, sessionId] : [orderId];

    const order = db.prepare(orderQuery).get(...params) as any;
    if (!order) return null;

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1').get(orderId) as any;

    const itemsDto: OrderItemSnapshotDto[] = items.map(i => {
      const unitPaise = i.unit_price_inr_paise_snapshot;
      const totalPaise = unitPaise * i.quantity;
      return {
        id: i.id,
        productId: i.product_id,
        name: i.name_snapshot,
        unitPriceInrPaise: unitPaise,
        unitPriceInr: Math.round(unitPaise / 100),
        quantity: i.quantity,
        itemTotalInrPaise: totalPaise,
        itemTotalInr: Math.round(totalPaise / 100),
      };
    });

    return {
      id: order.id,
      sessionId: order.session_id,
      status: order.status,
      subtotalInrPaise: order.subtotal_inr_paise,
      subtotalInr: Math.round(order.subtotal_inr_paise / 100),
      shippingInrPaise: order.shipping_inr_paise,
      shippingInr: Math.round(order.shipping_inr_paise / 100),
      taxInrPaise: order.tax_inr_paise,
      taxInr: Math.round(order.tax_inr_paise / 100),
      totalInrPaise: order.total_inr_paise,
      totalInr: Math.round(order.total_inr_paise / 100),
      chargeCurrency: order.charge_currency,
      chargeAmountUsdCents: order.charge_amount_usd_cents,
      chargeAmountUsd: (order.charge_amount_usd_cents / 100).toFixed(2),
      inrToUsdRate: order.inr_to_usd_rate,
      items: itemsDto,
      payment: payment ? {
        paypalOrderId: payment.paypal_order_id,
        paypalCaptureId: payment.paypal_capture_id,
        status: payment.status,
      } : undefined,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  }

  static getOrdersBySession(sessionId: string): OrderDto[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT id FROM orders WHERE session_id = ? ORDER BY created_at DESC').all(sessionId) as { id: string }[];
    return rows.map(r => this.getOrderById(r.id, sessionId)!).filter(Boolean);
  }

  static async initiatePayPalPayment(sessionId: string, orderId: string): Promise<{ paypalOrderId: string }> {
    const order = this.getOrderById(orderId, sessionId);
    if (!order) {
      throw new Error('Order not found or does not belong to session');
    }

    if (order.status !== 'pending') {
      throw new Error(`Order cannot be paid because status is "${order.status}"`);
    }

    // Check if a payment record already exists for this order
    const db = getDatabase();
    const existingPayment = db.prepare('SELECT paypal_order_id, status FROM payments WHERE order_id = ?').get(orderId) as any;
    if (existingPayment && existingPayment.status === 'CREATED') {
      return { paypalOrderId: existingPayment.paypal_order_id };
    }

    if (!PayPalService.isConfigured()) {
      // Return clear error if credentials not yet configured
      throw new Error('PayPal Sandbox credentials not configured. Please supply PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.');
    }

    // Call PayPal Orders v2 API with the database-frozen USD charge
    const created = await PayPalService.createOrder(order.id, order.chargeAmountUsd);

    const paymentId = `pay_${crypto.randomBytes(12).toString('hex')}`;
    const idempotencyKey = `idemp_${order.id}_${created.id}`;

    db.prepare(`
      INSERT INTO payments (
        id, order_id, paypal_order_id, idempotency_key, status, raw_status, amount_cents, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      paymentId,
      order.id,
      created.id,
      idempotencyKey,
      'CREATED',
      created.status,
      order.chargeAmountUsdCents,
      order.chargeCurrency
    );

    return { paypalOrderId: created.id };
  }

  static async capturePayPalPayment(sessionId: string | null | undefined, paypalOrderId: string, orderId: string): Promise<OrderDto> {
    const db = getDatabase();

    // 1. Ownership & existence verification
    const order = sessionId ? this.getOrderById(orderId, sessionId) : this.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found or authorization failed');
    }

    // 2. Fetch linked payment record
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? AND paypal_order_id = ?')
      .get(orderId, paypalOrderId) as any;

    if (!payment) {
      throw new Error('Payment record matching this order was not found');
    }

    // 3. Idempotency Check: if already completed, return stored result without re-capturing! (SEC-5)
    if (payment.status === 'COMPLETED' && order.status === 'paid') {
      return order;
    }

    if (!PayPalService.isConfigured()) {
      throw new Error('PayPal Sandbox credentials not configured.');
    }

    // 4. Capture with stable idempotency key
    const captureResult = await PayPalService.captureOrder(paypalOrderId, payment.idempotency_key);

    // 5. Strict Server-Side Verification (SEC-4, SEC-8):
    // Status must be COMPLETED, capture ID must be present, currency must match, and captured amount must match expected (integer cents)
    const isStatusCompleted = captureResult.status === 'COMPLETED';
    const isCurrencyMatched = captureResult.currency === order.chargeCurrency;
    const expectedAmountUsd = order.chargeAmountUsd;
    const capturedCents = Math.round(parseFloat(captureResult.amount || '0') * 100);
    const isAmountMatched = capturedCents === order.chargeAmountUsdCents;

    if (!isStatusCompleted || !captureResult.captureId || !isCurrencyMatched || !isAmountMatched) {
      console.error('[Capture Verification Mismatch]', {
        isStatusCompleted,
        captureId: captureResult.captureId,
        currencyMatch: `${captureResult.currency} vs ${order.chargeCurrency}`,
        amountMatch: `${capturedCents} cents vs ${order.chargeAmountUsdCents} cents (${captureResult.amount} vs ${expectedAmountUsd})`,
      });

      db.prepare(`
        UPDATE payments 
        SET status = 'FAILED', raw_status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(JSON.stringify(captureResult), payment.id);

      db.prepare("UPDATE orders SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(orderId);

      throw new Error('Payment capture verification failed: amount, currency, or status mismatch');
    }

    // 6. Verification Passed! Mark order paid using shared idempotent markPaid
    return this.markPaid(orderId, captureResult.captureId, captureResult.status);
  }

  static getOrderByPayPalOrderId(paypalOrderId: string): OrderDto | null {
    const db = getDatabase();
    const payment = db.prepare('SELECT order_id FROM payments WHERE paypal_order_id = ?').get(paypalOrderId) as any;
    if (!payment) return null;
    return this.getOrderById(payment.order_id);
  }

  static getOrderByPayPalCaptureId(paypalCaptureId: string): OrderDto | null {
    const db = getDatabase();
    const payment = db.prepare('SELECT order_id FROM payments WHERE paypal_capture_id = ?').get(paypalCaptureId) as any;
    if (!payment) return null;
    return this.getOrderById(payment.order_id);
  }

  /**
   * Idempotent markPaid function shared between the direct capture endpoint and webhooks.
   * Safe to call multiple times with the same captureId (no double stock decrements, no duplicate cart clearing).
   */
  static markPaid(orderId: string, captureId: string, rawStatus: string = 'COMPLETED'): OrderDto {
    const db = getDatabase();
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Idempotency: if already marked paid, return stored snapshot without mutating stock again
    if (order.status === 'paid') {
      return order;
    }

    // Terminal state protection: Never transition refunded or reversed order back to paid
    if (order.status === 'refunded' || order.status === 'reversed') {
      console.warn(`[OrderService] Attempted to mark ${order.status} order ${orderId} as paid. Rejected.`);
      return order;
    }

    const finalizeTransaction = db.transaction(() => {
      // Re-verify current status inside transaction for concurrency safety
      const current = db.prepare('SELECT status FROM orders WHERE id = ?').get(orderId) as any;
      if (current?.status === 'paid' || current?.status === 'refunded' || current?.status === 'reversed') {
        return;
      }

      // 1. Update payments table (or record payment if called directly)
      const existingPayment = db.prepare('SELECT id FROM payments WHERE order_id = ?').get(orderId);
      if (existingPayment) {
        db.prepare(`
          UPDATE payments
          SET 
            paypal_capture_id = ?,
            status = 'COMPLETED',
            raw_status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE order_id = ?
        `).run(captureId, rawStatus, orderId);
      } else {
        db.prepare(`
          INSERT INTO payments (id, order_id, paypal_order_id, paypal_capture_id, idempotency_key, status, raw_status, amount_cents, currency)
          VALUES (?, ?, ?, ?, ?, 'COMPLETED', ?, ?, ?)
        `).run(
          `pay_${Date.now()}`,
          orderId,
          `PAYPAL-${orderId}`,
          captureId,
          `idemp_${orderId}`,
          rawStatus,
          order.chargeAmountUsdCents,
          order.chargeCurrency
        );
      }

      // 2. Update orders table to 'paid'
      db.prepare(`
        UPDATE orders
        SET status = 'paid', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(orderId);

      // 3. Decrement stock for purchased items
      for (const item of order.items) {
        db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?')
          .run(item.quantity, item.productId);
      }

      // 4. Clear cart for this order's session
      CartService.clearCart(order.sessionId);
    });

    finalizeTransaction();

    return this.getOrderById(orderId)!;
  }

  static markFailed(orderId: string, reason?: string): OrderDto {
    const db = getDatabase();
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Never overwrite an already settled order
    if (order.status === 'paid' || order.status === 'refunded' || order.status === 'reversed') {
      return order;
    }

    db.prepare(`
      UPDATE orders
      SET status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(orderId);

    if (reason) {
      db.prepare(`
        UPDATE payments
        SET status = 'FAILED', raw_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE order_id = ?
      `).run(reason, orderId);
    }

    return this.getOrderById(orderId)!;
  }

  static markPending(orderId: string): OrderDto {
    const db = getDatabase();
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status === 'paid' || order.status === 'refunded' || order.status === 'reversed' || order.status === 'cancelled') {
      return order;
    }

    db.prepare(`
      UPDATE orders
      SET status = 'pending', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(orderId);

    return this.getOrderById(orderId)!;
  }

  static markRefunded(orderId: string): OrderDto {
    const db = getDatabase();
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Idempotent: already refunded
    if (order.status === 'refunded') {
      return order;
    }

    db.prepare("UPDATE orders SET status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(orderId);

    db.prepare("UPDATE payments SET status = 'REFUNDED', raw_status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?")
      .run(orderId);

    return this.getOrderById(orderId)!;
  }

  static markReversed(orderId: string): OrderDto {
    const db = getDatabase();
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Idempotent: already reversed
    if (order.status === 'reversed') {
      return order;
    }

    db.prepare("UPDATE orders SET status = 'reversed', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(orderId);

    db.prepare("UPDATE payments SET status = 'REVERSED', raw_status = 'REVERSED', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?")
      .run(orderId);

    return this.getOrderById(orderId)!;
  }

  static cancelOrder(sessionId: string, orderId: string): OrderDto {
    const db = getDatabase();
    const order = this.getOrderById(orderId, sessionId);
    if (!order) {
      throw new Error('Order not found or authorization failed');
    }

    // Invariant: Never overwrite an already settled order! (SEC-7, SEC-8)
    if (order.status === 'paid' || order.status === 'refunded' || order.status === 'reversed') {
      return order;
    }

    db.prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(orderId);

    return this.getOrderById(orderId, sessionId)!;
  }
}
