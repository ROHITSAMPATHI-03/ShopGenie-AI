import { describe, it, expect } from 'vitest';
import { ProductService } from '../services/productService.js';
import { getDatabase } from '../database/db.js';

describe('ShopGenie AI Backend Core Health & Catalogue', () => {
  it('Database connection is healthy and catalogue contains 28 products', () => {
    const db = getDatabase();
    const count = db.prepare('SELECT count(*) as total FROM products').get() as { total: number };
    expect(count.total).toBe(28);
  });

  it('ProductService.getAllProducts() returns all 28 products across 5 categories', () => {
    const res = ProductService.getAllProducts();
    expect(res.total).toBe(28);
    expect(res.products.length).toBe(28);

    const categories = new Set(res.products.map(p => p.category));
    expect(categories.has('laptops')).toBe(true);
    expect(categories.has('phones')).toBe(true);
    expect(categories.has('headphones')).toBe(true);
    expect(categories.has('keyboards')).toBe(true);
    expect(categories.has('monitors')).toBe(true);
  });
});
