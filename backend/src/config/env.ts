import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres').default('dev-secret-change-me-please'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  OPERADOR_USER: z.string().default('operador'),
  OPERADOR_PASSWORD: z.string().default('operador123'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('reclamos'),
  DB_PASSWORD: z.string().default('reclamos'),
  DB_NAME: z.string().default('reclamos_db'),
});

export type Env = z.infer<typeof schema>;

export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => schema.parse(source);
