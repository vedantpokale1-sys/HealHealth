import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { seedDatabase } from './db/seed';

import { healthRouter } from './routes/healthRoutes';
import { aiRouter } from './routes/aiRoutes';
import { doctorRouter } from './routes/doctorRoutes';
import { facilityRouter } from './routes/facilityRoutes';
import { appointmentRouter } from './routes/appointmentRoutes';
import { reportRouter } from './routes/reportRoutes';
import { authRouter } from './routes/authRoutes';

const app = express();

// Initialize database schema and seeds safely
try {
  seedDatabase();
} catch (err: any) {
  console.warn('[DB Init] Database seed skipped or in-memory fallback active:', err?.message);
}

// Security and CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));

// Safe non-sensitive request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount Routes under /api/v1, /v1, and /api for flexible serverless rewrites
app.use(['/api/v1', '/v1', '/api'], healthRouter);
app.use(['/api/v1/ai', '/v1/ai', '/api/ai'], aiRouter);
app.use(['/api/v1/doctors', '/v1/doctors', '/api/doctors'], doctorRouter);
app.use(['/api/v1/facilities', '/v1/facilities', '/api/facilities'], facilityRouter);
app.use(['/api/v1/appointments', '/v1/appointments', '/api/appointments'], appointmentRouter);
app.use(['/api/v1/reports', '/v1/reports', '/api/reports'], reportRouter);
app.use(['/api/v1/auth', '/v1/auth', '/api/auth'], authRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected internal healthcare service error occurred.';
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
  });
});

const PORT = parseInt(env.PORT, 10) || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
=====================================================
🚀 HEALHEALTH Full-Stack Backend Running!
📡 Server Port: http://localhost:${PORT}
🩺 API Health:  http://localhost:${PORT}/api/v1/health
🤖 AI Router:   Configured (${env.AI_BASE_URL} - ${env.AI_DEFAULT_MODEL})
🗄  Database:    Relational SQLite (dev.db)
=====================================================
    `);
  });
}

export default app;
