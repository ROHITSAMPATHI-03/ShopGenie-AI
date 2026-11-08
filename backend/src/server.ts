import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { getDatabase } from './database/db.js';
import { seedCatalogue } from './database/seed.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';
import { productRouter } from './routes/productRoutes.js';
import { compareRouter } from './routes/compareRoutes.js';
import { cartRouter } from './routes/cartRoutes.js';
import { orderRouter } from './routes/orderRoutes.js';
import { paymentRouter } from './routes/paymentRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';

export const app = express();

// 1. Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Let frontend Vite handle scripts in dev/prod
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Strict CORS
app.use(
  cors({
    origin: [env.FRONTEND_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'PayPal-Request-Id'],
  })
);

// 3. Body Parsing with bounds
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(env.SESSION_SECRET));

// 4. Session Identification
app.use(sessionMiddleware);

// 5. Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    product: 'ShopGenie AI',
    version: '1.0.0',
    geminiConfigured: Boolean(env.GEMINI_API_KEY?.trim()),
    paypalConfigured: Boolean(env.PAYPAL_CLIENT_ID?.trim() && env.PAYPAL_CLIENT_SECRET?.trim()),
    timestamp: new Date().toISOString(),
  });
});

// 6. Application Routes
app.use('/api/products/compare', compareRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/paypal', paymentRouter);
app.use('/api/ai', aiRouter);

// 7. Global 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 8. Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// Auto-seed if database is empty
try {
  const db = getDatabase();
  const count = db.prepare('SELECT count(*) as total FROM products').get() as { total: number };
  if (!count || count.total === 0) {
    console.log('[Bootstrap] Initializing empty catalogue with 28 curated products...');
    seedCatalogue(db);
  }
} catch (e) {
  console.error('[Bootstrap Warning] Failed to inspect catalogue:', e);
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  ShopGenie AI Backend running at http://localhost:${env.PORT}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log(`  Gemini: ${env.GEMINI_API_KEY ? 'Configured (' + env.GEMINI_MODEL + ')' : 'Unconfigured (Fallback Ready)'}`);
    console.log(`  PayPal Sandbox: ${env.PAYPAL_CLIENT_ID ? 'Configured' : 'Unconfigured'}`);
    console.log(`=======================================================`);
  });
}

