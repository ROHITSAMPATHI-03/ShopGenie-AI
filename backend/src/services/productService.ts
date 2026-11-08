import { getDatabase } from '../database/db.js';

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  brand: string;
  price_inr_paise: number;
  rating: number;
  description: string;
  image_url: string;
  specs_json: string;
  stock: number;
  created_at: string;
}

export interface ProductDto extends Omit<ProductRecord, 'specs_json'> {
  specs: Record<string, any>;
  price_inr: number; // formatted in rupees for convenience
}

export function transformProduct(row: ProductRecord): ProductDto {
  let specs = {};
  try {
    specs = JSON.parse(row.specs_json);
  } catch {
    specs = {};
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    price_inr_paise: row.price_inr_paise,
    price_inr: Math.round(row.price_inr_paise / 100),
    rating: row.rating,
    description: row.description,
    image_url: row.image_url,
    specs,
    stock: row.stock,
    created_at: row.created_at,
  };
}

export interface ProductFilterOptions {
  q?: string;
  category?: string;
  brand?: string;
  minPricePaise?: number;
  maxPricePaise?: number;
  minRating?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc';
  limit?: number;
  offset?: number;
}

export class ProductService {
  static getAllProducts(options: ProductFilterOptions = {}): { products: ProductDto[]; total: number } {
    const db = getDatabase();
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (options.category) {
      conditions.push('category = @category');
      params.category = options.category;
    }

    if (options.brand) {
      conditions.push('LOWER(brand) = LOWER(@brand)');
      params.brand = options.brand;
    }

    if (options.minPricePaise !== undefined) {
      conditions.push('price_inr_paise >= @minPricePaise');
      params.minPricePaise = options.minPricePaise;
    }

    if (options.maxPricePaise !== undefined) {
      conditions.push('price_inr_paise <= @maxPricePaise');
      params.maxPricePaise = options.maxPricePaise;
    }

    if (options.minRating !== undefined) {
      conditions.push('rating >= @minRating');
      params.minRating = options.minRating;
    }

    if (options.q && options.q.trim()) {
      conditions.push('(LOWER(name) LIKE @query OR LOWER(description) LIKE @query OR LOWER(brand) LIKE @query)');
      params.query = `%${options.q.trim().toLowerCase()}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM products ${whereClause}`);
    const { total } = countStmt.get(params) as { total: number };

    // Sort order
    let orderBy = 'rating DESC, price_inr_paise ASC';
    if (options.sort === 'price_asc') {
      orderBy = 'price_inr_paise ASC';
    } else if (options.sort === 'price_desc') {
      orderBy = 'price_inr_paise DESC';
    } else if (options.sort === 'rating_desc') {
      orderBy = 'rating DESC';
    } else if (options.sort === 'name_asc') {
      orderBy = 'name ASC';
    }

    const limit = Math.min(options.limit || 50, 100);
    const offset = options.offset || 0;

    const dataStmt = db.prepare(`
      SELECT * FROM products
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `);

    const rows = dataStmt.all(params) as ProductRecord[];
    return {
      products: rows.map(transformProduct),
      total,
    };
  }

  static getProductById(id: string): ProductDto | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const row = stmt.get(id) as ProductRecord | undefined;
    return row ? transformProduct(row) : null;
  }

  static getProductsByIds(ids: string[]): ProductDto[] {
    if (!ids || ids.length === 0) return [];
    const db = getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`);
    const rows = stmt.all(...ids) as ProductRecord[];
    return rows.map(transformProduct);
  }
}

