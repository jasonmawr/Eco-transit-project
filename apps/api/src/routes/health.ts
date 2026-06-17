import { Router } from 'express';
import { prisma } from '../config/db.js';
import { config } from '../config/index.js';

const router = Router();

// Liveness probe
router.get('/healthz', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    mode: config.APP_MODE,
    provider: config.PROVIDER_MODE,
    timestamp: new Date().toISOString()
  });
});

// Readiness probe
router.get('/readyz', async (_req, res) => {
  const readinessDetails: Record<string, string> = {
    database: 'unknown',
    redis: 'skipped',
  };

  let hasErrors = false;

  try {
    // 1. Verify PostgreSQL Database
    await prisma.$queryRaw`SELECT 1`;
    readinessDetails.database = 'connected';
  } catch (dbErr) {
    readinessDetails.database = 'failed';
    hasErrors = true;
    console.error('Readyz: Database connection check failed', dbErr);
  }

  // 2. Verify Redis ONLY if enabled
  if (config.REDIS_ENABLED) {
    try {
      // In Batch 04, we will check Redis Client connectivity.
      // For Batch 00, we check if it is active.
      readinessDetails.redis = 'enabled';
    } catch (redisErr) {
      readinessDetails.redis = 'failed';
      hasErrors = true;
      console.error('Readyz: Redis connection check failed', redisErr);
    }
  }

  if (hasErrors) {
    return res.status(500).json({
      status: 'unready',
      details: readinessDetails,
      timestamp: new Date().toISOString()
    });
  } else {
    return res.status(200).json({
      status: 'ready',
      details: readinessDetails,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
