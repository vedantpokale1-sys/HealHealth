import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey =
  process.env.AI_API_KEY ||
  process.env.BYNARA_API_KEY ||
  process.env.NVIDIA_NIM_API_KEY ||
  '';

const baseUrl =
  process.env.AI_BASE_URL ||
  process.env.NVIDIA_NIM_BASE_URL ||
  process.env.BYNARA_BASE_URL ||
  'https://integrate.api.nvidia.com/v1';

const defaultModel =
  process.env.AI_DEFAULT_MODEL ||
  process.env.NVIDIA_NIM_DEFAULT_MODEL ||
  process.env.BYNARA_DEFAULT_MODEL ||
  'nvidia/nemotron-3.5-super-vl-120b-a12b';

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  AI_API_KEY: z.string().min(1, 'AI Provider API key is required'),
  AI_BASE_URL: z.string().default('https://integrate.api.nvidia.com/v1'),
  AI_DEFAULT_MODEL: z.string().default('nvidia/nemotron-3.5-super-vl-120b-a12b'),
  JWT_SECRET: z.string().default('healhealth-super-secret-jwt-key-2026-production'),
});

const parsed = envSchema.safeParse({
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  AI_API_KEY: apiKey,
  AI_BASE_URL: baseUrl,
  AI_DEFAULT_MODEL: defaultModel,
  JWT_SECRET: process.env.JWT_SECRET || 'healhealth-super-secret-jwt-key-2026-production',
});

if (!parsed.success) {
  console.warn('⚠️ Environment warning:', parsed.error.format());
}

export const env = parsed.success
  ? parsed.data
  : {
      PORT: process.env.PORT || '5000',
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
      DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
      AI_API_KEY: apiKey,
      AI_BASE_URL: baseUrl,
      AI_DEFAULT_MODEL: defaultModel,
      JWT_SECRET: process.env.JWT_SECRET || 'healhealth-super-secret-jwt-key-2026-production',
    };
