import { RequestHandler } from 'express';
import { NotFoundError } from '../domain/errors';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};
