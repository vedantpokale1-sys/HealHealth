import { Router } from 'express';
import { db } from '../db/db';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  let dbStatus = 'disconnected';
  try {
    if (db) {
      const row = db.prepare('SELECT 1 as ok').get() as any;
      if (row?.ok === 1) dbStatus = 'connected (sqlite)';
    } else {
      dbStatus = 'active (in-memory resilient store)';
    }
  } catch (e: any) {
    dbStatus = `fallback: ${e.message}`;
  }

  const aiConfigured = Boolean(env.AI_API_KEY && env.AI_API_KEY.length > 5);

  res.json({
    status: 'ok',
    service: 'HEALHEALTH Clinical Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    ai: {
      configured: aiConfigured,
      defaultModel: env.AI_DEFAULT_MODEL,
      provider: 'NVIDIA NIM Router',
      baseUrl: env.AI_BASE_URL,
    },
  });
});
