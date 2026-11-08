import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../database/db.js';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'shopgenie_session';

export interface AuthenticatedRequest extends Request {
  sessionId: string;
}

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const db = getDatabase();
  let sessionId = req.cookies?.[SESSION_COOKIE_NAME];

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
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }

  (req as AuthenticatedRequest).sessionId = sessionId;
  next();
}

