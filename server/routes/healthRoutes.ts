import { Router } from 'express';
import { db } from '../db/db';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const row = db.prepare('SELECT 1 as ok').get() as any;
    if (row?.ok === 1) dbStatus = 'connected';
  } catch (e: any) {
    dbStatus = `error: ${e.message}`;
  }

  const nimConfigured = Boolean(env.NVIDIA_NIM_API_KEY && env.NVIDIA_NIM_API_KEY.startsWith('nvapi-'));

  res.json({
    status: 'ok',
    service: 'HEALHEALTH Clinical Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    nim: {
      configured: nimConfigured,
      defaultModel: env.NVIDIA_NIM_DEFAULT_MODEL,
      provider: 'NVIDIA NIM (hosted at integrate.api.nvidia.com)',
    },
  });
});
