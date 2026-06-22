import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const directUrl = process.env.DIRECT_URL || '';
const appMode = process.env.APP_MODE || '';
const nodeEnv = process.env.NODE_ENV || '';

console.log('Checking database safety for demo reset...');

const isNeonDb = (dbUrl.includes('neon.tech') || directUrl.includes('neon.tech')) &&
  !dbUrl.includes('ep-dry-term-ao0g9wds') &&
  !directUrl.includes('ep-dry-term-ao0g9wds');
const isProduction = appMode.toLowerCase() === 'production' || nodeEnv.toLowerCase() === 'production';

if (isNeonDb || isProduction) {
  console.error('\n======================================================');
  console.error('❌ SAFETY HARD-FAIL: DESTRUCTIVE COMMAND BLOCKED!');
  console.error('The "demo:reset" command is strictly limited to local development databases.');
  console.error('Destructive operations are blocked on remote Neon databases.');
  console.error('======================================================\n');
  process.exit(1);
}

console.log('Database safety checks passed (local development target detected).');
console.log('Commencing database reset...');
try {
  execSync('npx prisma db push --force-reset --schema=packages/db/prisma/schema.prisma', { stdio: 'inherit' });
  execSync('npx ts-node packages/db/prisma/seed.ts', { stdio: 'inherit' });
  console.log('Database reset and seed completed successfully!');
} catch (err) {
  console.error('Failed to reset and seed database:', err);
  process.exit(1);
}
