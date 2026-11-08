import { ProductService, ProductDto } from '../services/productService.js';
import { RecommendService, ScoredProduct } from '../services/recommendService.js';
import { CompareService, ComparisonResult } from '../services/compareService.js';
import { CartService, CartSummaryDto } from '../services/cartService.js';
import {
  searchProductsSchema,
  filterProductsSchema,
  getProductDetailsSchema,
  recommendProductsSchema,
  compareProductsSchema,
  addToCartSchema,
} from './toolSchemas.js';

export interface ToolExecutionContext {
  sessionId: string;
  accumulatedProducts: Map<string, ProductDto>;
  comparisonResult?: ComparisonResult;
  updatedCart?: CartSummaryDto;
  scoredProducts?: ScoredProduct[];
  activities: string[];
}

export class ToolHandlers {
  static async execute(
    name: string,
    args: any,
    ctx: ToolExecutionContext
  ): Promise<{ result: any }> {
    switch (name) {
      case 'searchProducts': {
        const validated = searchProductsSchema.parse(args);
        ctx.activities.push(`Searching catalogue for "${validated.query || validated.category || 'all'}"`);
        const { products } = ProductService.getAllProducts({
          q: validated.query,
          category: validated.category,
          limit: 10,
        });

        products.forEach(p => ctx.accumulatedProducts.set(p.id, p));

        return {
          result: {
            count: products.length,
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              category: p.category,
              brand: p.brand,
              priceInr: p.price_inr,
              rating: p.rating,
              specs: p.specs,
            })),
          },
        };
      }

      case 'filterProducts': {
        const validated = filterProductsSchema.parse(args);
        ctx.activities.push('Filtering catalogue by specifications');
        const minPricePaise = validated.minPriceInr ? Math.round(validated.minPriceInr * 100) : undefined;
        const maxPricePaise = validated.maxPriceInr ? Math.round(validated.maxPriceInr * 100) : undefined;

        const { products } = ProductService.getAllProducts({
          category: validated.category,
          brand: validated.brand,
          minPricePaise,
          maxPricePaise,
          minRating: validated.minRating,
          limit: 10,
        });

        products.forEach(p => ctx.accumulatedProducts.set(p.id, p));

        return {
          result: {
            count: products.length,
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              priceInr: p.price_inr,
              rating: p.rating,
              specs: p.specs,
            })),
          },
        };
      }

      case 'getProductDetails': {
        const validated = getProductDetailsSchema.parse(args);
        ctx.activities.push(`Fetching details for product ${validated.productId}`);
        const product = ProductService.getProductById(validated.productId);
        if (!product) {
          return { result: { error: `Product ${validated.productId} not found` } };
        }

        ctx.accumulatedProducts.set(product.id, product);

        return {
          result: {
            id: product.id,
            name: product.name,
            category: product.category,
            brand: product.brand,
            priceInr: product.price_inr,
            rating: product.rating,
            description: product.description,
            specs: product.specs,
            stock: product.stock,
          },
        };
      }

      case 'recommendProducts': {
        const validated = recommendProductsSchema.parse(args);
        ctx.activities.push(`Computing deterministic ranking for ${validated.category}`);
        const budgetMaxPaise = validated.budgetMaxInr ? Math.round(validated.budgetMaxInr * 100) : undefined;

        const scored = RecommendService.rankProducts({
          category: validated.category,
          budgetMaxPaise,
          usage: validated.usage,
          priorities: validated.priorities,
          brands: validated.brands,
          limit: 4,
        });

        ctx.scoredProducts = scored;
        scored.forEach(s => ctx.accumulatedProducts.set(s.product.id, s.product));

        return {
          result: {
            count: scored.length,
            recommendations: scored.map(s => ({
              id: s.product.id,
              name: s.product.name,
              brand: s.product.brand,
              priceInr: s.product.price_inr,
              rating: s.product.rating,
              overallScore: s.overallScore,
              scoreBreakdown: s.breakdown,
              matchedRequirements: s.matchedRequirements,
              tradeoffs: s.tradeoffs,
              rankingReason: s.rankingReason,
            })),
          },
        };
      }

      case 'compareProducts': {
        const validated = compareProductsSchema.parse(args);
        ctx.activities.push(`Comparing ${validated.productIds.length} models side by side`);
        const comparison = CompareService.compareProducts(validated.productIds, validated.priority);
        ctx.comparisonResult = comparison;
        comparison.products.forEach(p => ctx.accumulatedProducts.set(p.id, p));

        return {
          result: {
            specMatrix: comparison.specMatrix,
            priceDifference: comparison.priceDifference,
            bestValuePick: comparison.bestValuePick,
            summary: comparison.summary,
          },
        };
      }

      case 'addToCart': {
        const validated = addToCartSchema.parse(args);
        ctx.activities.push(`Adding product ${validated.productId} to cart`);
        const updatedCart = CartService.addItem(ctx.sessionId, validated.productId, validated.quantity);
        ctx.updatedCart = updatedCart;

        return {
          result: {
            success: true,
            message: `Added to cart successfully`,
            totalItems: updatedCart.itemCount,
            subtotalInr: updatedCart.subtotalInr,
          },
        };
      }

      case 'getCart': {
        ctx.activities.push('Loading current cart summary');
        const cart = CartService.getCart(ctx.sessionId);
        ctx.updatedCart = cart;

        return {
          result: {
            itemCount: cart.itemCount,
            subtotalInr: cart.subtotalInr,
            chargeAmountUsd: cart.chargeAmountUsd,
            items: cart.items.map(i => ({
              productId: i.productId,
              name: i.product.name,
              quantity: i.quantity,
              itemTotalInr: i.itemTotalInr,
            })),
          },
        };
      }

      default:
        throw new Error(`Forbidden or unknown tool: ${name}`);
    }
  }
}

