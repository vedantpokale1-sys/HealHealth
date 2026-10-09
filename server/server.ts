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

// Initialize database schema and seeds
seedDatabase();

// Security and CORS
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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

// Mount Routes under /api/v1
app.use('/api/v1', healthRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/facilities', facilityRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/auth', authRouter);

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
🤖 NVIDIA NIM:  Configured (integrate.api.nvidia.com)
🗄  Database:    Relational SQLite (dev.db)
=====================================================
    `);
  });
}

export default app;
