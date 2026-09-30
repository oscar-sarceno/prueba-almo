import { z } from 'zod';
import { ESTADOS, TIPOS_INCIDENCIA } from '../domain/reclamo';
import { ValidationError } from '../domain/errors';

export const DESCRIPCION_MIN = 20;
export const DESCRIPCION_MAX = 500;
export const OBSERVACION_MAX = 1000;

const requerido = (mensaje: string) => ({ error: mensaje });

export const crearReclamoSchema = z.object({
  numeroGuia: z
    .string(requerido('El número de guía es obligatorio'))
    .trim()
    .regex(/^[A-Za-z0-9-]{6,30}$/, 'El número de guía debe tener entre 6 y 30 caracteres alfanuméricos'),
  tipoIncidencia: z.enum(TIPOS_INCIDENCIA, {
    error: `El tipo de incidencia debe ser uno de: ${TIPOS_INCIDENCIA.join(', ')}`,
  }),
  descripcion: z
    .string(requerido('La descripción es obligatoria'))
    .trim()
    .min(DESCRIPCION_MIN, `La descripción debe tener al menos ${DESCRIPCION_MIN} caracteres`)
    .max(DESCRIPCION_MAX, `La descripción no puede exceder ${DESCRIPCION_MAX} caracteres`),
});

export const actualizarReclamoSchema = z.object({
  estado: z.enum(ESTADOS, { error: `El estado debe ser uno de: ${ESTADOS.join(', ')}` }).optional(),
  observacion: z
    .string(requerido('La observación es obligatoria'))
    .trim()
    .min(1, 'La observación no puede estar vacía')
    .max(OBSERVACION_MAX, `La observación no puede exceder ${OBSERVACION_MAX} caracteres`),
});

export const normalizarFolio = (folio: string): string => folio.trim().toUpperCase();

export type CrearReclamoInput = z.infer<typeof crearReclamoSchema>;
export type ActualizarReclamoInput = z.infer<typeof actualizarReclamoSchema>;

/** Valida con zod y traduce los issues a un ValidationError con detalle por campo. */
export const parseOrThrow = <T extends z.ZodType>(schema: T, data: unknown, campoPorDefecto = 'body'): z.infer<T> => {
  const result = schema.safeParse(data ?? {});
  if (result.success) return result.data;
  const detalles: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const campo = issue.path.join('.') || campoPorDefecto;
    detalles[campo] ??= issue.message;
  }
  throw new ValidationError('Los datos enviados no son válidos', detalles);
};
