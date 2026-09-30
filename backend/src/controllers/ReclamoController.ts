import { RequestHandler } from 'express';
import { Reclamo } from '../domain/reclamo';
import { ReclamoService } from '../services/ReclamoService';

/** Serializa el reclamo al contrato público de la API (fechas en ISO 8601). */
export const toReclamoDto = (r: Reclamo) => ({
  folio: r.folio,
  numeroGuia: r.numeroGuia,
  tipoIncidencia: r.tipoIncidencia,
  descripcion: r.descripcion,
  estado: r.estado,
  fechaCreacion: r.fechaCreacion.toISOString(),
  fechaActualizacion: r.fechaActualizacion.toISOString(),
  observaciones: r.observaciones.map((o) => ({
    comentario: o.comentario,
    autor: o.autor,
    fecha: o.fecha.toISOString(),
  })),
});

export class ReclamoController {
  constructor(private readonly service: ReclamoService) {}

  crear: RequestHandler = async (req, res, next) => {
    try {
      const reclamo = await this.service.crear(req.body);
      res.status(201).location(`/api/reclamos/${reclamo.folio}`).json(toReclamoDto(reclamo));
    } catch (err) {
      next(err);
    }
  };

  obtener: RequestHandler<{ folio: string }> = async (req, res, next) => {
    try {
      res.json(toReclamoDto(await this.service.obtener(req.params.folio)));
    } catch (err) {
      next(err);
    }
  };

  actualizar: RequestHandler<{ folio: string }> = async (req, res, next) => {
    try {
      const autor = req.user?.usuario ?? 'operador';
      res.json(toReclamoDto(await this.service.actualizar(req.params.folio, req.body, autor)));
    } catch (err) {
      next(err);
    }
  };
}
