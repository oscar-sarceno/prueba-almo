import { Reclamo } from '../domain/reclamo';
import { ActualizacionReclamo, NuevoReclamo, ReclamoRepository } from './ReclamoRepository';

const clone = (r: Reclamo): Reclamo => ({ ...r, observaciones: r.observaciones.map((o) => ({ ...o })) });

export class InMemoryReclamoRepository implements ReclamoRepository {
  private readonly store = new Map<string, Reclamo>();

  async create(data: NuevoReclamo): Promise<boolean> {
    if (this.store.has(data.folio)) return false;
    this.store.set(data.folio, {
      folio: data.folio,
      numeroGuia: data.numeroGuia,
      tipoIncidencia: data.tipoIncidencia,
      descripcion: data.descripcion,
      estado: 'Recibido',
      fechaCreacion: data.fecha,
      fechaActualizacion: data.fecha,
      observaciones: [],
    });
    return true;
  }

  async findByFolio(folio: string): Promise<Reclamo | null> {
    const r = this.store.get(folio);
    return r ? clone(r) : null;
  }

  async update(folio: string, data: ActualizacionReclamo): Promise<Reclamo | null> {
    const r = this.store.get(folio);
    if (!r) return null;
    if (data.estado) r.estado = data.estado;
    r.observaciones.push({ ...data.observacion, fecha: data.fecha });
    r.fechaActualizacion = data.fecha;
    return clone(r);
  }
}
