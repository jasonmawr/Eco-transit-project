import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
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
import aiRouter from './routes/ai.js';
import analyticsRouter from './routes/analytics.js';
import { xanhwrapRouter } from './routes/xanhwrap.js';

const app = express();

// Trust proxy behind load balancers/CDNs for secure cookies in production/demo.
// Render's routing layer acts as a single reverse proxy (1 hop) in front of the application.
// By setting 'trust proxy' to 1, we trust only the single immediate proxy hop (Render's load balancer).
// Express will resolve the client's actual connection IP as the rightmost entry in X-Forwarded-For,
// and it will ignore any upstream addresses that a malicious client might have appended to spoof their IP.
// This prevents header spoofing attacks while ensuring correct client IP resolution for rate limiting,
// geo-ip logic, and correct HTTPS/Secure session cookie transmission over proxy tunnels.
app.set('trust proxy', 1);

// HTTP Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Strict CORS check
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      // Parse dynamically to support runtime config changes during tests
      const currentCorsOrigin = process.env.CORS_ORIGIN || config.CORS_ORIGIN || '';
      const allowedOrigins = currentCorsOrigin
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);

      if (!allowedOrigins.includes('http://localhost:3000')) {
        allowedOrigins.push('http://localhost:3000');
      }
      if (!allowedOrigins.includes('http://localhost:3001')) {
        allowedOrigins.push('http://localhost:3001');
      }
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

// Skip rate limiting in test environment
const skipTestEnv = () => process.env.NODE_ENV === 'test' || process.env.VITEST === 'true' || process.env.SKIP_RATE_LIMIT === 'true';

// Define Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 200, // Limit each IP to 200 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipTestEnv,
  message: {
    message: 'Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau.'
  }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 10, // Limit each IP to 10 requests per minute for register/login/resend
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipTestEnv,
  message: {
    message: 'Bạn đã thử đăng ký hoặc đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.'
  }
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 20, // Limit each IP to 20 chat messages per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipTestEnv,
  message: {
    message: 'Hệ thống trợ lý AI đang nhận được nhiều yêu cầu từ bạn. Vui lòng đợi một chút rồi tiếp tục trò chuyện nhé.'
  }
});

// Apply Rate Limiters
app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);

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
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api', analyticsRouter);
app.use('/api/xanhwrap', xanhwrapRouter);

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
