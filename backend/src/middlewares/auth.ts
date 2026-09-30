import { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../domain/errors';
import { AuthService, AuthUser } from '../services/AuthService';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export const authenticate =
  (auth: AuthService): RequestHandler =>
  (req, _res, next) => {
    try {
      const [esquema, token] = (req.headers.authorization ?? '').split(' ');
      if (esquema?.toLowerCase() !== 'bearer' || !token) {
        throw new UnauthorizedError('Se requiere un token Bearer en el encabezado Authorization');
      }
      req.user = auth.verificar(token);
      next();
    } catch (err) {
      next(err);
    }
  };

export const requireRole =
  (role: string): RequestHandler =>
  (req, _res, next) => {
    if (req.user?.role !== role) {
      next(new ForbiddenError(`Esta acción requiere el rol "${role}"`));
      return;
    }
    next();
  };
