import { createPool, Pool } from 'mysql2/promise';
import { Env } from './env';

export const createDbPool = (env: Env): Pool =>
  createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
    charset: 'utf8mb4',
  });
