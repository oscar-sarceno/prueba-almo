import { randomBytes } from 'node:crypto';

export type FolioGenerator = (fecha: Date) => string;

/** Formato REC-YYYYMMDD-XXXXXX (6 hex en mayúsculas, aleatorios criptográficamente). */
export const generarFolio: FolioGenerator = (fecha) => {
  const ymd = fecha.toISOString().slice(0, 10).replace(/-/g, '');
  return `REC-${ymd}-${randomBytes(3).toString('hex').toUpperCase()}`;
};
