export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly detalles?: Record<string, string>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos inválidos', detalles?: Record<string, string>) {
    super(400, message, detalles);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Autenticación requerida') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}
