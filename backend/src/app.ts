import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AuthController } from './controllers/AuthController';
import { ReclamoController } from './controllers/ReclamoController';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { createAuthRouter } from './routes/auth.routes';
import { createReclamosRouter } from './routes/reclamos.routes';
import { AuthService } from './services/AuthService';
import { ReclamoService } from './services/ReclamoService';

export interface AppDeps {
  reclamoService: ReclamoService;
  authService: AuthService;
}

export const createApp = ({ reclamoService, authService }: AppDeps) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', createAuthRouter(new AuthController(authService)));
  app.use('/api/reclamos', createReclamosRouter(new ReclamoController(reclamoService), authService));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
