import { EstadoReclamo, Observacion, Reclamo, TipoIncidencia } from '../domain/reclamo';

export interface NuevoReclamo {
  folio: string;
  numeroGuia: string;
  tipoIncidencia: TipoIncidencia;
  descripcion: string;
  fecha: Date;
}

export interface ActualizacionReclamo {
  estado?: EstadoReclamo;
  observacion: Omit<Observacion, 'fecha'>;
  fecha: Date;
}

/** Contrato de persistencia (patrón Repository): el servicio no conoce MySQL. */
export interface ReclamoRepository {
  /** Crea el reclamo. Devuelve false si el folio ya existe (colisión). */
  create(data: NuevoReclamo): Promise<boolean>;
  findByFolio(folio: string): Promise<Reclamo | null>;
  /** Aplica estado/observación de forma atómica. Devuelve null si el folio no existe. */
  update(folio: string, data: ActualizacionReclamo): Promise<Reclamo | null>;
}
