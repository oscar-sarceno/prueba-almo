import { formatearFecha } from '../format';
import { Observacion } from '../types';

export const ObservacionesTimeline = ({ observaciones }: { observaciones: Observacion[] }) => (
  <section className="timeline" aria-labelledby="titulo-observaciones">
    <h3 id="titulo-observaciones">Historial de observaciones</h3>
    {observaciones.length === 0 ? (
      <p className="muted">Aún no hay observaciones del operador. Te mostraremos aquí cada avance de tu caso.</p>
    ) : (
      <ol className="timeline__list">
        {observaciones.map((o, i) => (
          <li key={`${o.fecha}-${i}`} className="timeline__item">
            <time dateTime={o.fecha}>{formatearFecha(o.fecha)}</time>
            <p>{o.comentario}</p>
            <span className="timeline__autor">Registrado por {o.autor}</span>
          </li>
        ))}
      </ol>
    )}
  </section>
);
