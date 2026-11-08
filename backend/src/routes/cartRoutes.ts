import { Router, Response } from 'express';
import { z } from 'zod';
import { CartService } from '../services/cartService.js';
import { AuthenticatedRequest } from '../middleware/sessionMiddleware.js';

export const cartRouter = Router();

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).optional().default(1),
});

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(10),
});

cartRouter.get('/', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const cart = CartService.getCart(authReq.sessionId);
    res.json({ cart });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve cart' });
  }
});

cartRouter.post('/', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid cart payload', details: parsed.error.issues });
      return;
    }

    const { productId, quantity } = parsed.data;
    const cart = CartService.addItem(authReq.sessionId, productId, quantity);
    res.json({ cart, message: 'Item added to cart' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to add item to cart' });
  }
});

cartRouter.patch('/:id', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const cartItemId = req.params.id;
    const parsed = updateQuantitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid quantity', details: parsed.error.issues });
      return;
    }

    const { quantity } = parsed.data;
    const cart = CartService.updateQuantity(authReq.sessionId, cartItemId, quantity);
    res.json({ cart, message: 'Cart updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update cart item' });
  }
});

cartRouter.delete('/:id', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const cartItemId = req.params.id;
    const cart = CartService.removeItem(authReq.sessionId, cartItemId);
    res.json({ cart, message: 'Item removed from cart' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to remove cart item' });
  }
});

cartRouter.delete('/', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    CartService.clearCart(authReq.sessionId);
    const cart = CartService.getCart(authReq.sessionId);
    res.json({ cart, message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to clear cart' });
  }
});

