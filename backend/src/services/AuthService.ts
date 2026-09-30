import { createHash, timingSafeEqual } from 'node:crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { UnauthorizedError } from '../domain/errors';
import { parseOrThrow } from '../validators/reclamo.schemas';

export const ROL_OPERADOR = 'operador';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  operadorUser: string;
  operadorPassword: string;
}

export interface AuthUser {
  usuario: string;
  role: string;
}

const loginSchema = z.object({
  usuario: z.string({ error: 'El usuario es obligatorio' }).min(1, 'El usuario es obligatorio'),
  password: z.string({ error: 'La contraseña es obligatoria' }).min(1, 'La contraseña es obligatoria'),
});

const digest = (value: string) => createHash('sha256').update(value).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

export class AuthService {
  constructor(private readonly config: AuthConfig) {}

  login(input: unknown): { token: string; tipo: 'Bearer'; expiraEn: string } {
    const { usuario, password } = parseOrThrow(loginSchema, input);
    const usuarioOk = safeEqual(usuario, this.config.operadorUser);
    const passwordOk = safeEqual(password, this.config.operadorPassword);
    if (!usuarioOk || !passwordOk) throw new UnauthorizedError('Credenciales inválidas');
    return { token: this.emitirToken(usuario), tipo: 'Bearer', expiraEn: this.config.jwtExpiresIn };
  }

  emitirToken(usuario: string, role: string = ROL_OPERADOR): string {
    return jwt.sign({ role }, this.config.jwtSecret, {
      algorithm: 'HS256',
      subject: usuario,
      expiresIn: this.config.jwtExpiresIn as SignOptions['expiresIn'],
    });
  }

  verificar(token: string): AuthUser {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret, { algorithms: ['HS256'] });
      if (typeof payload === 'string' || !payload.sub || typeof payload.role !== 'string') {
        throw new UnauthorizedError('Token inválido');
      }
      return { usuario: payload.sub, role: payload.role };
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      const expirado = (err as { name?: string }).name === 'TokenExpiredError';
      throw new UnauthorizedError(expirado ? 'El token ha expirado' : 'Token inválido');
    }
  }
}
