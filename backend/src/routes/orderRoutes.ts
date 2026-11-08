import { Router, Response } from 'express';
import { OrderService } from '../services/orderService.js';
import { AuthenticatedRequest } from '../middleware/sessionMiddleware.js';

export const orderRouter = Router();

// Create internal order snapshot from cart
orderRouter.post('/', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const order = OrderService.createOrderFromCart(authReq.sessionId);
    res.status(201).json({ order, message: 'Order created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
});

// List orders for current session
orderRouter.get('/', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const orders = OrderService.getOrdersBySession(authReq.sessionId);
    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve orders' });
  }
});

// Get specific order detail
orderRouter.get('/:id', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const orderId = req.params.id;
    const order = OrderService.getOrderById(orderId, authReq.sessionId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve order' });
  }
});

