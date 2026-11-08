import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { CompareService } from '../services/compareService.js';

export const compareRouter = Router();

const compareSchema = z.object({
  productIds: z.array(z.string()).min(2).max(4),
  priority: z.string().optional(),
});

compareRouter.post('/', (req: Request, res: Response) => {
  try {
    const parsed = compareSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please provide between 2 and 4 product IDs', details: parsed.error.issues });
      return;
    }

    const { productIds, priority } = parsed.data;
    const result = CompareService.compareProducts(productIds, priority);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Comparison failed' });
  }
});

