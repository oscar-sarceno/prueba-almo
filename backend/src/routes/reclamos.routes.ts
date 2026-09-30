import { Router } from 'express';
import { ReclamoController } from '../controllers/ReclamoController';
import { authenticate, requireRole } from '../middlewares/auth';
import { AuthService, ROL_OPERADOR } from '../services/AuthService';

export const createReclamosRouter = (controller: ReclamoController, auth: AuthService) => {
  const router = Router();
  router.post('/', controller.crear);
  router.get('/:folio', controller.obtener);
  router.patch('/:folio', authenticate(auth), requireRole(ROL_OPERADOR), controller.actualizar);
  return router;
};
