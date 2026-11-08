import { Router, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
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

