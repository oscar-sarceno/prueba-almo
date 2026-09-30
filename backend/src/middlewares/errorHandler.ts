import { ErrorRequestHandler } from 'express';
import { AppError } from '../domain/errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, ...(err.detalles && { detalles: err.detalles }) });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error interno. Intenta de nuevo más tarde.' });
};
