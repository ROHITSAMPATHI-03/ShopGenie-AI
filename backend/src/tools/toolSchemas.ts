import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { z } from 'zod';

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'searchProducts',
    description: 'Search the verified product catalogue by query string and/or category. Returns up to 10 matching products.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: 'Search terms such as laptop, phone, mechanical, lightweight, noise cancelling',
        },
        category: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: ['laptops', 'phones', 'headphones', 'keyboards', 'monitors'],
          description: 'Category filter',
        },
      },
    },
  },
  {
    name: 'filterProducts',
    description: 'Filter catalogue products by explicit budget, rating, brand, or category.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: ['laptops', 'phones', 'headphones', 'keyboards', 'monitors'],
          description: 'Product category',
        },
        maxPriceInr: {
          type: SchemaType.NUMBER,
          description: 'Maximum budget ceiling in Indian Rupees (₹)',
        },
        minPriceInr: {
          type: SchemaType.NUMBER,
          description: 'Minimum price in Indian Rupees (₹)',
        },
        minRating: {
          type: SchemaType.NUMBER,
          description: 'Minimum rating (e.g. 4.0 or 4.5)',
        },
        brand: {
          type: SchemaType.STRING,
          description: 'Specific brand name',
        },
      },
    },
  },
  {
    name: 'getProductDetails',
    description: 'Retrieve full technical specifications and details for a specific product ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        productId: {
          type: SchemaType.STRING,
          description: 'Exact product ID (e.g. LAP-001, PHO-002)',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'recommendProducts',
    description: 'Execute deterministic multi-factor ranking based on customer usage profile, budget ceiling, and specific priorities.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: ['laptops', 'phones', 'headphones', 'keyboards', 'monitors'],
          description: 'Product category',
        },
        budgetMaxInr: {
          type: SchemaType.NUMBER,
          description: 'Customer maximum budget in INR rupees (₹). Strictly excludes items above this price.',
        },
        usage: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: ['student', 'programmer', 'gamer', 'video_editor', 'everyday'],
          description: 'Target usage persona to match technical requirements against',
        },
        priorities: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Key customer priorities (e.g. ["battery", "portability", "performance", "display", "anc"])',
        },
        brands: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Preferred brands if explicitly mentioned by user',
        },
      },
      required: ['category'],
    },
  },
  {
    name: 'compareProducts',
    description: 'Generate an objective side-by-side comparison matrix and identify the best-value model for 2 to 4 products.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        productIds: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'List of 2 to 4 product IDs to compare',
        },
        priority: {
          type: SchemaType.STRING,
          description: 'Optional focus criteria (e.g. "battery", "price", "performance")',
        },
      },
      required: ['productIds'],
    },
  },
  {
    name: 'addToCart',
    description: 'Add a verified product to the customer session shopping cart. Only call when user explicitly asks to add or prepare cart.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        productId: {
          type: SchemaType.STRING,
          description: 'Product ID to add',
        },
        quantity: {
          type: SchemaType.INTEGER,
          description: 'Quantity between 1 and 10 (defaults to 1)',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'getCart',
    description: 'Retrieve the current items and server-calculated totals for the customer cart.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
];

// OpenAI formatted tools for multi-model interoperability
export const openAITools = [
  {
    type: 'function',
    function: {
      name: 'searchProducts',
      description: 'Search the verified product catalogue by query string and/or category. Returns up to 10 matching products.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search terms such as laptop, phone, mechanical, lightweight, noise cancelling' },
          category: { type: 'string', enum: ['laptops', 'phones', 'headphones', 'keyboards', 'monitors'], description: 'Category filter' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'filterProducts',
      description: 'Filter catalogue products by explicit budget, rating, brand, or category.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['laptops', 'phones', 'headphones', 'keyboards', 'monitors'] },
          maxPriceInr: { type: 'number', description: 'Maximum budget ceiling in Indian Rupees (₹)' },
          minPriceInr: { type: 'number', description: 'Minimum price in Indian Rupees (₹)' },
          minRating: { type: 'number', description: 'Minimum rating (e.g. 4.0 or 4.5)' },
          brand: { type: 'string', description: 'Specific brand name' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getProductDetails',
      description: 'Retrieve full technical specifications and details for a specific product ID.',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Exact product ID (e.g. LAP-001, PHO-002)' },
        },
        required: ['productId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommendProducts',
      description: 'Execute deterministic multi-factor ranking based on customer usage profile, budget ceiling, and specific priorities.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['laptops', 'phones', 'headphones', 'keyboards', 'monitors'] },
          budgetMaxInr: { type: 'number', description: 'Customer maximum budget in INR rupees (₹). Strictly excludes items above this price.' },
          usage: { type: 'string', enum: ['student', 'programmer', 'gamer', 'video_editor', 'everyday'], description: 'Target usage persona' },
          priorities: { type: 'array', items: { type: 'string' }, description: 'Key customer priorities' },
          brands: { type: 'array', items: { type: 'string' }, description: 'Preferred brands' },
        },
        required: ['category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compareProducts',
      description: 'Generate an objective side-by-side comparison matrix and identify the best-value model for 2 to 4 products.',
      parameters: {
        type: 'object',
        properties: {
          productIds: { type: 'array', items: { type: 'string' }, description: 'List of 2 to 4 product IDs to compare' },
          priority: { type: 'string', description: 'Optional focus criteria' },
        },
        required: ['productIds'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addToCart',
      description: 'Add a verified product to the customer session shopping cart. Only call when user explicitly asks to add or prepare cart.',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product ID to add' },
          quantity: { type: 'integer', description: 'Quantity between 1 and 10 (defaults to 1)' },
        },
        required: ['productId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCart',
      description: 'Retrieve current items and server-calculated totals for the customer cart.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];

// Zod schemas for strict backend argument validation
export const searchProductsSchema = z.object({
  query: z.string().optional(),
  category: z.enum(['laptops', 'phones', 'headphones', 'keyboards', 'monitors']).optional(),
});

export const filterProductsSchema = z.object({
  category: z.enum(['laptops', 'phones', 'headphones', 'keyboards', 'monitors']).optional(),
  maxPriceInr: z.number().positive().optional(),
  minPriceInr: z.number().positive().optional(),
  minRating: z.number().min(1).max(5).optional(),
  brand: z.string().optional(),
});

export const getProductDetailsSchema = z.object({
  productId: z.string().min(1),
});

export const recommendProductsSchema = z.object({
  category: z.enum(['laptops', 'phones', 'headphones', 'keyboards', 'monitors']),
  budgetMaxInr: z.number().positive().optional(),
  usage: z.enum(['student', 'programmer', 'gamer', 'video_editor', 'everyday']).optional(),
  priorities: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
});

export const compareProductsSchema = z.object({
  productIds: z.array(z.string()).min(2).max(4),
  priority: z.string().optional(),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).optional().default(1),
});
