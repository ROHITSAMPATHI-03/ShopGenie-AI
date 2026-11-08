import { ProductService, ProductDto } from './productService.js';

export interface ComparisonResult {
  products: ProductDto[];
  specMatrix: Record<string, (string | number | boolean | null)[]>;
  priceDifference: {
    minPriceInr: number;
    maxPriceInr: number;
    differenceInr: number;
    cheapestId: string;
    priciestId: string;
  };
  bestValuePick: {
    productId: string;
    productName: string;
    reason: string;
  };
  summary: string;
}

export class CompareService {
  static compareProducts(productIds: string[], priority?: string): ComparisonResult {
    if (productIds.length < 2 || productIds.length > 4) {
      throw new Error('Comparison requires between 2 and 4 product IDs');
    }

    const products = ProductService.getProductsByIds(productIds);
    if (products.length !== productIds.length) {
      throw new Error('One or more requested products were not found in the catalogue');
    }

    // Spec Matrix construction
    const allSpecKeys = new Set<string>();
    for (const p of products) {
      Object.keys(p.specs || {}).forEach(k => allSpecKeys.add(k));
    }

    const specMatrix: Record<string, (string | number | boolean | null)[]> = {};
    for (const key of Array.from(allSpecKeys)) {
      specMatrix[key] = products.map(p => (p.specs && p.specs[key] !== undefined ? p.specs[key] : '—'));
    }

    // Price Analysis
    const sortedByPrice = [...products].sort((a, b) => a.price_inr_paise - b.price_inr_paise);
    const cheapest = sortedByPrice[0];
    const priciest = sortedByPrice[sortedByPrice.length - 1];
    const diffPaise = priciest.price_inr_paise - cheapest.price_inr_paise;

    // Deterministic Best-Value algorithm
    // Score = (Rating / 5.0) / (Price / MinPrice)
    let bestValueProduct = products[0];
    let highestValueScore = -1;

    for (const p of products) {
      const priceRatio = p.price_inr_paise / cheapest.price_inr_paise;
      let valScore = (p.rating / 5.0) / priceRatio;

      // Bonus if matches specific priority
      if (priority && priority.toLowerCase().includes('battery') && p.specs?.battery_hours) {
        valScore += (p.specs.battery_hours / 10.0) * 0.3;
      } else if (priority && priority.toLowerCase().includes('performance') && p.specs?.ram_gb) {
        valScore += (p.specs.ram_gb / 16.0) * 0.3;
      }

      if (valScore > highestValueScore) {
        highestValueScore = valScore;
        bestValueProduct = p;
      }
    }

    const priorityNote = priority ? ` with strong consideration for ${priority}` : '';
    const reason = `${bestValueProduct.name} delivers the highest feature-to-price ratio${priorityNote}, priced at ₹${bestValueProduct.price_inr.toLocaleString('en-IN')} with a ${bestValueProduct.rating}★ rating.`;

    const summary = `Comparing ${products.length} models across price range ₹${cheapest.price_inr.toLocaleString('en-IN')} to ₹${priciest.price_inr.toLocaleString('en-IN')}. ${bestValueProduct.name} emerges as the optimal value choice.`;

    return {
      products,
      specMatrix,
      priceDifference: {
        minPriceInr: cheapest.price_inr,
        maxPriceInr: priciest.price_inr,
        differenceInr: Math.round(diffPaise / 100),
        cheapestId: cheapest.id,
        priciestId: priciest.id,
      },
      bestValuePick: {
        productId: bestValueProduct.id,
        productName: bestValueProduct.name,
        reason,
      },
      summary,
    };
  }
}

