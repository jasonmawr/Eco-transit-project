import { app } from './app.js';
import { config } from './config/index.js';

const port = config.PORT;

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
