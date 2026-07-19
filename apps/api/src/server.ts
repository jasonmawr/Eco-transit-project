import { app } from './app.js';
import { config } from './config/index.js';

function validateEnvironment() {
  const isProdOrDemo = process.env.NODE_ENV === 'production' || config.APP_MODE === 'demo' || process.env.APP_MODE === 'production';
  
  console.log(`===============================================`);
  console.log(` [STARTUP] Running startup diagnostics...`);
  
  if (isProdOrDemo) {
    if (config.SESSION_SECRET === 'ecotransit-dev-default-session-secret-change-me') {
      console.warn(` [WARNING] SESSION_SECRET is using the insecure default dev secret in production/demo mode! Please configure process.env.SESSION_SECRET.`);
    }
    
    if (config.DATABASE_URL.includes('localhost') || config.DATABASE_URL.includes('127.0.0.1')) {
      console.warn(` [WARNING] DATABASE_URL points to localhost in production/demo mode. Please verify database connection.`);
    }
  }

  if (!config.GEMINI_API_KEY) {
    console.warn(` [WARNING] GEMINI_API_KEY is not configured. AI Assistant features will return 503 errors.`);
  } else {
    console.log(` [INFO] GEMINI_API_KEY is configured.`);
  }

  const mailProviderName = process.env.MAIL_PROVIDER || 'smtp';
  console.log(` [INFO] Selected Mail Provider: ${mailProviderName}`);
  if (mailProviderName === 'brevo_http') {
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
      console.warn(` [WARNING] Brevo mail provider is selected but BREVO_API_KEY or BREVO_SENDER_EMAIL is missing.`);
    }
  } else if (mailProviderName === 'smtp') {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(` [WARNING] SMTP mail provider is selected but SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASS) is incomplete.`);
    }
  }
  
  console.log(` [STARTUP] Startup diagnostics completed.`);
  console.log(`===============================================`);
}

const port = config.PORT;

validateEnvironment();

app.listen(port, () => {
  console.log(`===============================================`);
  console.log(` EcoTransit Backend API booting up...`);
  console.log(` Port: ${port}`);
  console.log(` Environment Mode: ${config.APP_MODE}`);
  console.log(` Integration Provider Mode: ${config.PROVIDER_MODE}`);
  console.log(` Redis Cache Enabled: ${config.REDIS_ENABLED}`);
  console.log(` Allowed Frontend CORS Origin: ${config.FRONTEND_URL}`);
  console.log(`===============================================`);
});
