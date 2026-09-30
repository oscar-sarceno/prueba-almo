import { Router } from 'express';
import { ReclamoController } from '../controllers/ReclamoController';

export const createReclamosRouter = (controller: ReclamoController) => {
  const router = Router();
  router.post('/', controller.crear);
  router.get('/:folio', controller.obtener);
  return router;
};
