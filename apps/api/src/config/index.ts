import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environmental values from .env if present at monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config(); // fallback to current workspace .env

export const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  APP_MODE: (process.env.APP_MODE || 'local') as 'local' | 'test' | 'demo',
  PROVIDER_MODE: (process.env.PROVIDER_MODE || 'local') as 'local' | 'mock' | 'free_demo' | 'google',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://ecotransit_user:ecotransit_password@localhost:5432/ecotransit_dev?schema=public',
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === undefined,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  SESSION_SECRET: process.env.SESSION_SECRET || 'ecotransit-dev-default-session-secret-change-me',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false') || (process.env.APP_MODE === 'demo' && process.env.COOKIE_SECURE !== 'false'),
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE || ((process.env.NODE_ENV === 'production' || process.env.APP_MODE === 'demo') ? 'none' : 'lax')) as 'lax' | 'none' | 'strict',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'tickets'),
};
