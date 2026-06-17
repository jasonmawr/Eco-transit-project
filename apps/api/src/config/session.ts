import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { prisma } from './db.js';
import { config } from './index.js';

export const sessionMiddleware = session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
  },
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma as any, {
    checkPeriod: 2 * 60 * 1000, // check and prune expired sessions every 2 mins
    dbRecordIdIsSessionId: true,
  }),
});
