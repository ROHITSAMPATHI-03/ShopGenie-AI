import crypto from 'crypto';
import { getDatabase } from '../database/db.js';
import { transformProduct, ProductDto, ProductRecord } from './productService.js';
import { env } from '../config/env.js';

export interface CartItemDto {
  id: string;
  productId: string;
  product: ProductDto;
  quantity: number;
  itemTotalInrPaise: number;
  itemTotalInr: number;
}

export interface CartSummaryDto {
  items: CartItemDto[];
  itemCount: number;
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
}

export class CartService {
  static getCart(sessionId: string): CartSummaryDto {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        p.*
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.session_id = ?
      ORDER BY c.created_at ASC
    `);

    const rows = stmt.all(sessionId) as any[];

    let subtotalPaise = 0;
    let itemCount = 0;

    const items: CartItemDto[] = rows.map(row => {
      const productRecord: ProductRecord = {
        id: row.id,
        name: row.name,
        category: row.category,
        brand: row.brand,
        price_inr_paise: row.price_inr_paise,
        rating: row.rating,
        description: row.description,
        image_url: row.image_url,
        specs_json: row.specs_json,
        stock: row.stock,
        created_at: row.created_at,
      };

      const product = transformProduct(productRecord);
      const qty = Math.max(1, Math.min(row.quantity, 10));
      const itemTotalPaise = product.price_inr_paise * qty;

      subtotalPaise += itemTotalPaise;
      itemCount += qty;

      return {
        id: row.cart_item_id,
        productId: product.id,
        product,
        quantity: qty,
        itemTotalInrPaise: itemTotalPaise,
        itemTotalInr: Math.round(itemTotalPaise / 100),
      };
    });

    // Free shipping for demo, 0 tax or transparent
    const shippingInrPaise = 0;
    const taxInrPaise = 0;
    const totalInrPaise = subtotalPaise + shippingInrPaise + taxInrPaise;

    // Decimal-safe conversion to USD cents:
    // (totalInrPaise / 100) * INR_TO_USD * 100 = totalInrPaise * INR_TO_USD
    const chargeAmountUsdCents = Math.round(totalInrPaise * env.INR_TO_USD);
    const chargeAmountUsd = (chargeAmountUsdCents / 100).toFixed(2);

    return {
      items,
      itemCount,
      subtotalInrPaise: subtotalPaise,
      subtotalInr: Math.round(subtotalPaise / 100),
      shippingInrPaise,
      shippingInr: Math.round(shippingInrPaise / 100),
      taxInrPaise,
      taxInr: Math.round(taxInrPaise / 100),
      totalInrPaise,
      totalInr: Math.round(totalInrPaise / 100),
      chargeCurrency: env.CHARGE_CURRENCY,
      chargeAmountUsdCents,
      chargeAmountUsd,
      inrToUsdRate: env.INR_TO_USD,
    };
  }

  static addItem(sessionId: string, productId: string, quantity: number = 1): CartSummaryDto {
    if (quantity < 1 || quantity > 10) {
      throw new Error('Quantity must be between 1 and 10');
    }

    const db = getDatabase();

    // Ensure session exists in sessions table (respects foreign key constraint)
    db.prepare('INSERT OR IGNORE INTO sessions (id) VALUES (?)').run(sessionId);

    // Verify product exists and check stock
    const prodStmt = db.prepare('SELECT id, stock FROM products WHERE id = ?');
    const product = prodStmt.get(productId) as { id: string; stock: number } | undefined;
    if (!product) {
      throw new Error(`Product ${productId} not found in catalogue`);
    }

    if (product.stock <= 0) {
      throw new Error('Product is currently out of stock');
    }

    // Check if already in cart
    const existingStmt = db.prepare('SELECT id, quantity FROM cart_items WHERE session_id = ? AND product_id = ?');
    const existing = existingStmt.get(sessionId, productId) as { id: string; quantity: number } | undefined;

    if (existing) {
      const newQty = Math.min(10, Math.min(product.stock, existing.quantity + quantity));
      db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newQty, existing.id);
    } else {
      const finalQty = Math.min(10, Math.min(product.stock, quantity));
      const cartItemId = `cart_${crypto.randomBytes(12).toString('hex')}`;
      db.prepare('INSERT INTO cart_items (id, session_id, product_id, quantity) VALUES (?, ?, ?, ?)')
        .run(cartItemId, sessionId, productId, finalQty);
    }

    return this.getCart(sessionId);
  }

  static updateQuantity(sessionId: string, cartItemId: string, quantity: number): CartSummaryDto {
    if (quantity < 1 || quantity > 10) {
      throw new Error('Quantity must be between 1 and 10');
    }

    const db = getDatabase();

    // Verify cart item belongs to this session
    const itemStmt = db.prepare(`
      SELECT c.id, c.product_id, p.stock
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.id = ? AND c.session_id = ?
    `);
    const item = itemStmt.get(cartItemId, sessionId) as { id: string; product_id: string; stock: number } | undefined;

    if (!item) {
      throw new Error('Cart item not found or does not belong to session');
    }

    const finalQty = Math.min(quantity, item.stock);
    db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(finalQty, cartItemId);

    return this.getCart(sessionId);
  }

  static removeItem(sessionId: string, cartItemId: string): CartSummaryDto {
    const db = getDatabase();
    db.prepare('DELETE FROM cart_items WHERE id = ? AND session_id = ?').run(cartItemId, sessionId);
    return this.getCart(sessionId);
  }

  static clearCart(sessionId: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(sessionId);
  }
}
