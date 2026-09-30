import { createApp } from './app';
import { createDbPool } from './config/database';
import { loadEnv } from './config/env';
import { MySqlReclamoRepository } from './repositories/MySqlReclamoRepository';
import { ReclamoService } from './services/ReclamoService';

const env = loadEnv();
const pool = createDbPool(env);
const app = createApp({ reclamoService: new ReclamoService(new MySqlReclamoRepository(pool)) });

const server = app.listen(env.PORT, () => {
  console.log(`API de reclamos escuchando en http://localhost:${env.PORT}`);
});

const shutdown = () => {
  server.close(() => pool.end().finally(() => process.exit(0)));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
