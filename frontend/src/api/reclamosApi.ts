import { NuevoReclamo, Reclamo } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly detalles?: Record<string, string>,
  ) {
    super(message);
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init });
  } catch {
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.', 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.error ?? 'Ocurrió un error inesperado. Intenta de nuevo.', res.status, body?.detalles);
  }
  return body as T;
};

export const crearReclamo = (data: NuevoReclamo) =>
  request<Reclamo>('/api/reclamos', { method: 'POST', body: JSON.stringify(data) });

export const consultarReclamo = (folio: string) =>
  request<Reclamo>(`/api/reclamos/${encodeURIComponent(folio.trim())}`);
