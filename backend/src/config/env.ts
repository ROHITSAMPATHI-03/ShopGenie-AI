import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root or backend root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(val => parseInt(val, 10)),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().default('shopgenie_default_secret_key_hackathon_2026'),
  DATABASE_PATH: z.string().default('./data/shopgenie.db'),
  
  // Gemini config
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  
  // OpenAI config (Multi-model compatibility)
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  
  // PayPal config
  PAYPAL_CLIENT_ID: z.string().optional().default(''),
  PAYPAL_CLIENT_SECRET: z.string().optional().default(''),
  PAYPAL_WEBHOOK_ID: z.string().optional().default(''),
  PAYPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),
  
  // Currency & Rate config
  CHARGE_CURRENCY: z.string().default('USD'),
  INR_TO_USD: z.string().default('0.012').transform(val => parseFloat(val)),
});

export const env = envSchema.parse(process.env);

