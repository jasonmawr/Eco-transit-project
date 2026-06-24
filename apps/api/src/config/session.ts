import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { prisma } from './db.js';
import { config } from './index.js';

export const sessionMiddleware = session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    get secure(): boolean {
      const isProdOrDemo = process.env.NODE_ENV === 'production' || process.env.APP_MODE === 'demo' || config.APP_MODE === 'demo';
      return process.env.COOKIE_SECURE === 'true' || (isProdOrDemo && process.env.COOKIE_SECURE !== 'false');
    },
    get sameSite(): any {
      const isProdOrDemo = process.env.NODE_ENV === 'production' || process.env.APP_MODE === 'demo' || config.APP_MODE === 'demo';
      return process.env.COOKIE_SAME_SITE || (isProdOrDemo ? 'none' : 'lax');
    },
  },
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma as any, {
    checkPeriod: 2 * 60 * 1000, // check and prune expired sessions every 2 mins
    dbRecordIdIsSessionId: true,
  }),
});
