import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { getDatabase } from '../database/db.js';
import { OrderService } from '../services/orderService.js';
import { PayPalService } from '../services/paypalService.js';
import { AuthenticatedRequest } from '../middleware/sessionMiddleware.js';
import { env } from '../config/env.js';

export const paymentRouter = Router();

const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 payment actions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests. Please try again shortly.' },
});

paymentRouter.use(paymentRateLimiter);

// Public sandbox config for frontend PayPal Buttons
paymentRouter.get('/config', (req: any, res: Response) => {
  res.json({
    clientId: env.PAYPAL_CLIENT_ID || '',
    isConfigured: PayPalService.isConfigured(),
    currency: env.CHARGE_CURRENCY,
    env: env.PAYPAL_ENV,
    inrToUsdRate: env.INR_TO_USD,
  });
});

const createOrderSchema = z.object({
  orderId: z.string().min(1),
});

paymentRouter.post('/create-order', async (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Order ID is required', details: parsed.error.issues });
      return;
    }

    const { orderId } = parsed.data;
    const result = await OrderService.initiatePayPalPayment(authReq.sessionId, orderId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to initialize PayPal order' });
  }
});

const captureOrderSchema = z.object({
  paypalOrderId: z.string().min(1),
  orderId: z.string().min(1),
});

paymentRouter.post('/capture-order', async (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = captureOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing PayPal order or internal order ID', details: parsed.error.issues });
      return;
    }

    const { paypalOrderId, orderId } = parsed.data;
    const updatedOrder = await OrderService.capturePayPalPayment(authReq.sessionId, paypalOrderId, orderId);
    res.json({ order: updatedOrder, message: 'Payment successfully captured and verified' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Payment capture failed' });
  }
});

const cancelOrderSchema = z.object({
  orderId: z.string().min(1),
});

paymentRouter.post('/cancel', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = cancelOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    const { orderId } = parsed.data;
    const order = OrderService.cancelOrder(authReq.sessionId, orderId);
    res.json({ order, message: 'Payment cancelled. Your cart remains intact.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to cancel payment' });
  }
});

export async function handlePayPalWebhook(req: Request, res: Response): Promise<void> {
  try {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body || {});

    // 1. Verify webhook signature via PayPal API (or test bypass hook)
    const isValid = await PayPalService.verifyWebhookSignature(req.headers as any, rawBody);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid PayPal webhook signature' });
      return;
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      res.status(400).json({ error: 'Malformed JSON payload' });
      return;
    }

    const eventId = event?.id;
    const eventType = event?.event_type;

    if (!eventId || !eventType) {
      res.status(400).json({ error: 'Missing event ID or event_type' });
      return;
    }

    // 2. Deduplication: check webhook_events table
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM webhook_events WHERE id = ?').get(eventId);
    if (existing) {
      res.status(200).json({ received: true, deduplicated: true });
      return;
    }

    db.prepare('INSERT INTO webhook_events (id, event_type) VALUES (?, ?)').run(eventId, eventType);

    // 3. Process supported events
    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED': {
        const paypalOrderId = event.resource?.id;
        if (paypalOrderId) {
          const order = OrderService.getOrderByPayPalOrderId(paypalOrderId);
          if (order && order.status === 'pending') {
            await OrderService.capturePayPalPayment(null, paypalOrderId, order.id);
          }
        }
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        const captureId = event.resource?.id;
        const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id || event.resource?.order_id;
        const customId = event.resource?.custom_id;

        let order = paypalOrderId ? OrderService.getOrderByPayPalOrderId(paypalOrderId) : null;
        if (!order && captureId) order = OrderService.getOrderByPayPalCaptureId(captureId);
        if (!order && customId) order = OrderService.getOrderById(customId);

        if (order && captureId) {
          // Never trust amounts or prices from the event or frontend: verify strictly against stored order
          const eventAmount = parseFloat(event.resource?.amount?.value || '0').toFixed(2);
          const eventCurrency = event.resource?.amount?.currency_code || '';
          const expectedAmount = parseFloat(order.chargeAmountUsd).toFixed(2);
          const expectedCurrency = order.chargeCurrency;

          if (eventAmount !== expectedAmount || eventCurrency !== expectedCurrency) {
            console.error('[PayPal Webhook Mismatch]', {
              eventAmount,
              expectedAmount,
              eventCurrency,
              expectedCurrency,
            });
            OrderService.markFailed(order.id, 'Webhook amount/currency mismatch');
            res.status(200).json({ received: true, error: 'Amount or currency mismatch' });
            return;
          }

          OrderService.markPaid(order.id, captureId, event.resource?.status || 'COMPLETED');
        }
        break;
      }

      case 'PAYMENT.CAPTURE.PENDING': {
        const captureId = event.resource?.id;
        const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id || event.resource?.order_id;
        const customId = event.resource?.custom_id;

        let order = paypalOrderId ? OrderService.getOrderByPayPalOrderId(paypalOrderId) : null;
        if (!order && captureId) order = OrderService.getOrderByPayPalCaptureId(captureId);
        if (!order && customId) order = OrderService.getOrderById(customId);

        if (order) {
          OrderService.markPending(order.id);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        const captureId = event.resource?.id;
        const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id || event.resource?.order_id;
        const customId = event.resource?.custom_id;

        let order = paypalOrderId ? OrderService.getOrderByPayPalOrderId(paypalOrderId) : null;
        if (!order && captureId) order = OrderService.getOrderByPayPalCaptureId(captureId);
        if (!order && customId) order = OrderService.getOrderById(customId);

        if (order) {
          OrderService.markFailed(order.id, 'PAYMENT.CAPTURE.DENIED');
        }
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        const captureId = event.resource?.id;
        const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id || event.resource?.order_id;
        const customId = event.resource?.custom_id;

        let order = paypalOrderId ? OrderService.getOrderByPayPalOrderId(paypalOrderId) : null;
        if (!order && captureId) order = OrderService.getOrderByPayPalCaptureId(captureId);
        if (!order && customId) order = OrderService.getOrderById(customId);

        if (order) {
          OrderService.markRefunded(order.id);
        }
        break;
      }

      default:
        // Other events received and acknowledged without error
        break;
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[PayPal Webhook Exception]', error);
    res.status(500).json({ error: 'Webhook processing failed', message: error.message });
  }
}

