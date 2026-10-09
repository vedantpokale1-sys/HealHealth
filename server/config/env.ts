import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  NVIDIA_NIM_API_KEY: z.string().min(1, 'NVIDIA NIM API key is required'),
  NVIDIA_NIM_BASE_URL: z.string().default('https://integrate.api.nvidia.com/v1'),
  NVIDIA_NIM_DEFAULT_MODEL: z.string().default('nvidia/nemotron-3.5-lightning-30b-a3b'),
  JWT_SECRET: z.string().default('healhealth-super-secret-jwt-key-2026-production'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables in .env:', parsed.error.format());
}

export const env = parsed.success
  ? parsed.data
  : {
      PORT: '5000',
      NODE_ENV: 'development',
      FRONTEND_URL: 'http://localhost:5173',
      DATABASE_URL: 'file:./dev.db',
      NVIDIA_NIM_API_KEY: process.env.NVIDIA_NIM_API_KEY || '',
      NVIDIA_NIM_BASE_URL: 'https://integrate.api.nvidia.com/v1',
      NVIDIA_NIM_DEFAULT_MODEL: 'nvidia/nemotron-3.5-lightning-30b-a3b',
      JWT_SECRET: 'healhealth-super-secret-jwt-key-2026-production',
    };
