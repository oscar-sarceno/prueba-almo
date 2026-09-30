import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  // Número de proxies de confianza delante de la API (1 con nginx) para obtener la IP real del cliente.
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
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

const OBLIGATORIAS_EN_PRODUCCION = ['JWT_SECRET', 'OPERADOR_PASSWORD'] as const;

export const loadEnv = (source: NodeJS.ProcessEnv = process.env): Env => {
  const env = schema.parse(source);
  if (env.NODE_ENV === 'production') {
    // Los valores por defecto del código son solo para desarrollo: en producción deben definirse explícitamente.
    const faltantes = OBLIGATORIAS_EN_PRODUCCION.filter((k) => !source[k]);
    if (faltantes.length > 0) {
      throw new Error(`Faltan variables de entorno obligatorias en producción: ${faltantes.join(', ')}`);
    }
  }
  return env;
};
