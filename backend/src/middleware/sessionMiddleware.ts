import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../database/db.js';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'shopgenie_session';

export interface AuthenticatedRequest extends Request {
  sessionId: string;
}

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  // CSRF Origin validation on state-changing requests
  const method = (req.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // Exempt PayPal webhook (incoming from PayPal IPN/webhook infrastructure)
    if (req.path !== '/api/paypal/webhook' && !req.originalUrl?.includes('/api/paypal/webhook')) {
      const origin = req.headers.origin || req.headers.referer;
      if (origin && typeof origin === 'string') {
        try {
          const originUrl = new URL(origin);
          const allowedOrigins = env.NODE_ENV === 'production'
            ? [env.FRONTEND_ORIGIN]
            : [
                env.FRONTEND_ORIGIN,
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:4000',
                'http://127.0.0.1:4000',
              ];
          const isAllowed = allowedOrigins.some(allowed => {
            try {
              const u = new URL(allowed);
              return originUrl.origin === u.origin;
            } catch {
              return false;
            }
          });

          if (!isAllowed) {
            console.warn('[Security Warning] Blocked potential CSRF request from origin:', origin);
            res.status(403).json({ error: 'Forbidden: cross-origin request rejected' });
            return;
          }
        } catch {
          // If URL parsing fails for origin header, continue
        }
      }
    }
  }

  const db = getDatabase();
  const signedSession = req.signedCookies?.[SESSION_COOKIE_NAME];
  let sessionId = (signedSession && typeof signedSession === 'string')
    ? signedSession
    : req.cookies?.[SESSION_COOKIE_NAME];

  let isValidSession = false;
  if (sessionId && typeof sessionId === 'string' && sessionId.length >= 16) {
    // Verify session exists in DB
    const stmt = db.prepare('SELECT id FROM sessions WHERE id = ?');
    const existing = stmt.get(sessionId) as { id: string } | undefined;
    if (existing) {
      isValidSession = true;
      // Update last_active_at
      db.prepare('UPDATE sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?').run(sessionId);
    }
  }

  if (!isValidSession) {
    // Issue a cryptographically secure random session ID
    sessionId = `ses_${crypto.randomBytes(24).toString('hex')}`;
    db.prepare('INSERT INTO sessions (id, preferences_json) VALUES (?, ?)')
      .run(sessionId, JSON.stringify({}));

    const isProduction = env.NODE_ENV === 'production';
    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      signed: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }

  (req as AuthenticatedRequest).sessionId = sessionId;
  next();
}

