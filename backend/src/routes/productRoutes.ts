import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ProductService } from '../services/productService.js';
import { RecommendService } from '../services/recommendService.js';
import { Category, UsageProfileKey } from '../config/usageProfiles.js';

export const productRouter = Router();

const recommendSchema = z.object({
  category: z.enum(['laptops', 'phones', 'headphones', 'keyboards', 'monitors']),
  budgetMax: z.number().positive().optional(), // INR in rupees
  usage: z.enum(['student', 'programmer', 'gamer', 'video_editor', 'everyday']).optional(),
  priorities: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(10).optional(),
});

productRouter.post('/recommend', (req: Request, res: Response) => {
  try {
    const parsed = recommendSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid recommendation criteria', details: parsed.error.issues });
      return;
    }

    const { category, budgetMax, usage, priorities, brands, limit } = parsed.data;
    const budgetMaxPaise = budgetMax ? Math.round(budgetMax * 100) : undefined;

    const recommendations = RecommendService.rankProducts({
      category: category as Category,
      budgetMaxPaise,
      usage: usage as UsageProfileKey,
      priorities,
      brands,
      limit,
    });

    res.json({ recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Recommendation failed' });
  }
});

const productQuerySchema = z.object({
  q: z.string().optional(),
  category: z.enum(['laptops', 'phones', 'headphones', 'keyboards', 'monitors']).optional(),
  brand: z.string().optional(),
  minPrice: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  minRating: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'name_asc']).optional(),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : undefined)),
  offset: z.string().optional().transform(val => (val ? parseInt(val, 10) : undefined)),
});

productRouter.get('/', (req: Request, res: Response) => {
  try {
    const parsed = productQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.issues });
      return;
    }

    const { q, category, brand, minPrice, maxPrice, minRating, sort, limit, offset } = parsed.data;

    // Convert INR rupee values to paise for exact integer comparisons
    const minPricePaise = minPrice !== undefined ? Math.round(minPrice * 100) : undefined;
    const maxPricePaise = maxPrice !== undefined ? Math.round(maxPrice * 100) : undefined;

    const result = ProductService.getAllProducts({
      q,
      category,
      brand,
      minPricePaise,
      maxPricePaise,
      minRating,
      sort,
      limit,
      offset,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
});

productRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const product = ProductService.getProductById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch product' });
  }
});
