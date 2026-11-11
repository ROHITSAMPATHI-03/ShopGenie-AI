import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root or backend root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const FORBIDDEN_SAMPLE_SECRETS = new Set([
  'shopgenie_default_secret_key_hackathon_2026',
  'shopgenie_super_secure_secret_key_12345',
  'shopgenie_super_secure_session_secret_change_in_production',
  'your_session_secret_here',
  'secret',
  'change_me',
]);

const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

// In development or test, auto-generate a strong random secret if none is supplied
let fallbackDevSecret: string | undefined;
if (nodeEnv !== 'production') {
  fallbackDevSecret = crypto.randomBytes(32).toString('hex');
}

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform(val => parseInt(val, 10)),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().optional(),
  DATABASE_PATH: z.string().default('./data/shopgenie.db'),
  
  // Gemini config
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  
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
}).superRefine((data, ctx) => {
  const isProd = data.NODE_ENV === 'production';

  // Validate FRONTEND_ORIGIN
  try {
    const url = new URL(data.FRONTEND_ORIGIN);
    if (isProd && url.protocol !== 'https:') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FRONTEND_ORIGIN'],
        message: 'FRONTEND_ORIGIN must use HTTPS in production',
      });
    }
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['FRONTEND_ORIGIN'],
      message: 'FRONTEND_ORIGIN must be a valid URL',
    });
  }

  // Validate SESSION_SECRET
  const secret = data.SESSION_SECRET?.trim();
  if (isProd) {
    if (!secret || secret.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'Production requires SESSION_SECRET of at least 32 characters.',
      });
    }
    if (secret && FORBIDDEN_SAMPLE_SECRETS.has(secret)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'Production SESSION_SECRET cannot use sample or default secrets.',
      });
    }
  }
}).transform((data) => {
  let secret = data.SESSION_SECRET?.trim();
  if (!secret || FORBIDDEN_SAMPLE_SECRETS.has(secret)) {
    secret = fallbackDevSecret || crypto.randomBytes(32).toString('hex');
  }
  return {
    ...data,
    SESSION_SECRET: secret,
  };
});

export const env = envSchema.parse(process.env);

