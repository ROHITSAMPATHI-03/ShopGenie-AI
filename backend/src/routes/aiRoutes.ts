import { Router, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { AgentService } from '../services/agentService.js';
import { AuthenticatedRequest } from '../middleware/sessionMiddleware.js';
import { getDatabase } from '../database/db.js';

export const aiRouter = Router();

// Strict rate limit for AI endpoint (SEC-10)
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many shopping assistant requests. Please wait a moment before trying again.' },
});

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000), // Bounded message length (SEC-11)
});

aiRouter.post('/chat', chatRateLimiter, async (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid message', details: parsed.error.issues });
      return;
    }

    const { message } = parsed.data;
    const response = await AgentService.handleUserMessage(authReq.sessionId, message);
    res.json(response);
  } catch (error: any) {
    console.error('[AI Chat Route Error]', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred while processing your request' });
  }
});

// History endpoint for current session
aiRouter.get('/history', (req: any, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT id, role, content, metadata_json, created_at
      FROM conversations
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(authReq.sessionId);

    res.json({ messages: rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve conversation history' });
  }
});
