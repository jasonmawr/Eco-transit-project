import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { sessionMiddleware } from './config/session.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import stationRouter from './routes/stations.js';
import routesRouter from './routes/routes.js';
import placesRouter from './routes/places.js';
import reviewsRouter from './routes/reviews.js';
import guidesRouter from './routes/guides.js';
import ticketsRouter from './routes/tickets.js';
import walletRouter from './routes/wallet.js';
import rewardsRouter from './routes/rewards.js';
import adminRouter from './routes/admin.js';
import timeBillsRouter from './routes/timeBills.js';
import leaderboardRouter from './routes/leaderboard.js';

const app = express();

// Trust proxy behind load balancers/CDNs for secure cookies in production/demo
if (process.env.NODE_ENV === 'production' || config.APP_MODE === 'demo') {
  app.set('trust proxy', 1);
}

// Parse comma-separated list of allowed origins from config
const allowedOrigins = (config.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Always append local defaults to whitelist
if (!allowedOrigins.includes('http://localhost:3000')) {
  allowedOrigins.push('http://localhost:3000');
}
if (!allowedOrigins.includes('http://localhost:3001')) {
  allowedOrigins.push('http://localhost:3001');
}

// Strict CORS check
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowed => allowed === origin || allowed === origin + '/') ||
                        (config.APP_MODE === 'local' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')));
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS not allowed for this origin: ${origin}`), false);
    },
    credentials: true,
  })
);

// 2. Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session Middleware
app.use(sessionMiddleware);

// 4. Mount Routes
app.use('/api', healthRouter);
app.use('/', healthRouter); // Root level health check mount
app.use('/api/auth', authRouter);
app.use('/api', stationRouter);
app.use('/api', routesRouter);
app.use('/api', placesRouter);
app.use('/api', reviewsRouter);
app.use('/api', guidesRouter);
app.use('/api', ticketsRouter);
app.use('/api', walletRouter);
app.use('/api', rewardsRouter);
app.use('/api', timeBillsRouter);
app.use('/api', leaderboardRouter);
app.use('/api/admin', adminRouter);

// 5. Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  
  const statusCode = err.statusCode || err.status || 500;
  const isDemoOrProd = process.env.NODE_ENV === 'production' || config.APP_MODE === 'demo';

  if (statusCode >= 500) {
    return res.status(statusCode).json({
      message: 'Đã xảy ra lỗi nội bộ hệ thống. Vui lòng liên hệ quản trị viên.',
      error: isDemoOrProd ? undefined : err.message,
    });
  } else {
    return res.status(statusCode).json({
      message: err.message || 'Yêu cầu không hợp lệ.',
      error: isDemoOrProd ? undefined : err.message,
    });
  }
});

export default app;
export { app };
