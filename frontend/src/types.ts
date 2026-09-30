export const TIPOS_INCIDENCIA = ['Paquete Dañado', 'Paquete Incompleto', 'No Recibido'] as const;
export type TipoIncidencia = (typeof TIPOS_INCIDENCIA)[number];

export type EstadoReclamo = 'Recibido' | 'En Revisión' | 'Resuelto - Reembolso' | 'Rechazado';

export interface Observacion {
  comentario: string;
  autor: string;
  fecha: string;
}

export interface Reclamo {
  folio: string;
  numeroGuia: string;
  tipoIncidencia: TipoIncidencia;
  descripcion: string;
  estado: EstadoReclamo;
  fechaCreacion: string;
  fechaActualizacion: string;
  observaciones: Observacion[];
}

export interface NuevoReclamo {
  numeroGuia: string;
  tipoIncidencia: TipoIncidencia;
  descripcion: string;
}

export const DESCRIPCION_MIN = 20;
export const DESCRIPCION_MAX = 500;
