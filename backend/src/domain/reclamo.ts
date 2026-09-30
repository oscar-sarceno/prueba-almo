export const TIPOS_INCIDENCIA = ['Paquete Dañado', 'Paquete Incompleto', 'No Recibido'] as const;
export type TipoIncidencia = (typeof TIPOS_INCIDENCIA)[number];

export const ESTADOS = ['Recibido', 'En Revisión', 'Resuelto - Reembolso', 'Rechazado'] as const;
export type EstadoReclamo = (typeof ESTADOS)[number];

/** Estados terminales: una vez alcanzados, el reclamo ya no cambia de estado. */
export const ESTADOS_FINALES: readonly EstadoReclamo[] = ['Resuelto - Reembolso', 'Rechazado'];

export interface Observacion {
  comentario: string;
  autor: string;
  fecha: Date;
}

export interface Reclamo {
  folio: string;
  numeroGuia: string;
  tipoIncidencia: TipoIncidencia;
  descripcion: string;
  estado: EstadoReclamo;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  observaciones: Observacion[];
}

export const FOLIO_REGEX = /^REC-\d{8}-[A-F0-9]{6}$/;
