import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/AuthController';

export const createAuthRouter = (controller: AuthController) => {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.' },
  });
  router.post('/token', limiter, controller.login);
  return router;
};
