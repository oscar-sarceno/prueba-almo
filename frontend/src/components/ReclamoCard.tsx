import { formatearFecha } from '../format';
import { EstadoReclamo, Reclamo } from '../types';
import { ObservacionesTimeline } from './ObservacionesTimeline';

const ESTADO_UI: Record<EstadoReclamo, { clase: string; icono: string }> = {
  Recibido: { clase: 'recibido', icono: '📥' },
  'En Revisión': { clase: 'revision', icono: '🔍' },
  'Resuelto - Reembolso': { clase: 'resuelto', icono: '✅' },
  Rechazado: { clase: 'rechazado', icono: '⛔' },
};

export const ReclamoCard = ({ reclamo }: { reclamo: Reclamo }) => {
  const ui = ESTADO_UI[reclamo.estado];
  return (
    <article className="result" aria-label={`Reclamo ${reclamo.folio}`}>
      <div className={`status status--${ui.clase}`}>
        <span className="status__label">Estado del reclamo</span>
        <span className="status__value">
          <span aria-hidden="true">{ui.icono}</span> {reclamo.estado}
        </span>
      </div>

      <dl className="meta">
        <div>
          <dt>Folio</dt>
          <dd>{reclamo.folio}</dd>
        </div>
        <div>
          <dt>Número de guía</dt>
          <dd>{reclamo.numeroGuia}</dd>
        </div>
        <div>
          <dt>Tipo de incidencia</dt>
          <dd>{reclamo.tipoIncidencia}</dd>
        </div>
        <div>
          <dt>Fecha de creación</dt>
          <dd>
            <time dateTime={reclamo.fechaCreacion}>{formatearFecha(reclamo.fechaCreacion)}</time>
          </dd>
        </div>
        <div>
          <dt>Última actualización</dt>
          <dd>
            <time dateTime={reclamo.fechaActualizacion}>{formatearFecha(reclamo.fechaActualizacion)}</time>
          </dd>
        </div>
        <div className="meta__wide">
          <dt>Descripción</dt>
          <dd>{reclamo.descripcion}</dd>
        </div>
      </dl>

      <ObservacionesTimeline observaciones={reclamo.observaciones} />
    </article>
  );
};
