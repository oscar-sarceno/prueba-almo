import { FormEvent, useRef, useState } from 'react';
import { ApiError, crearReclamo } from '../api/reclamosApi';
import { useUserInvalidAria } from '../hooks/useUserInvalidAria';
import { DESCRIPCION_MAX, DESCRIPCION_MIN, Reclamo, TIPOS_INCIDENCIA, TipoIncidencia } from '../types';
import { Alert } from './Alert';

interface Props {
  onCreado: (reclamo: Reclamo) => void;
  onConsultar: (folio: string) => void;
}

export const ReclamoForm = ({ onCreado, onConsultar }: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  useUserInvalidAria(formRef);

  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [creado, setCreado] = useState<Reclamo | null>(null);
  const [copiado, setCopiado] = useState(false);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const datos = new FormData(form);
    setEnviando(true);
    setError(null);
    setCreado(null);
    try {
      const reclamo = await crearReclamo({
        numeroGuia: String(datos.get('numeroGuia')).trim(),
        tipoIncidencia: datos.get('tipoIncidencia') as TipoIncidencia,
        descripcion: String(datos.get('descripcion')).trim(),
      });
      setCreado(reclamo);
      onCreado(reclamo);
      form.reset();
      setDescripcion('');
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError('Ocurrió un error inesperado.', 0));
    } finally {
      setEnviando(false);
    }
  };

  const copiarFolio = async () => {
    if (!creado) return;
    try {
      await navigator.clipboard.writeText(creado.folio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* Sin permisos de portapapeles: la persona puede seleccionar el folio manualmente. */
    }
  };

  return (
    <section className="card" aria-labelledby="titulo-nuevo">
      <h2 id="titulo-nuevo">Nuevo reclamo</h2>
      <p className="card__intro">Cuéntanos qué pasó con tu envío y te daremos un folio para darle seguimiento.</p>

      <form ref={formRef} onSubmit={enviar}>
        <div className="field">
          <label htmlFor="numeroGuia">Número de guía</label>
          <span id="guia-hint" className="hint">
            De 6 a 30 letras, números o guiones. Ej: GU100000123
          </span>
          <input
            id="numeroGuia"
            name="numeroGuia"
            required
            minLength={6}
            maxLength={30}
            pattern="[A-Za-z0-9\-]{6,30}"
            autoComplete="off"
            aria-describedby="guia-hint"
            aria-errormessage="guia-error"
          />
          <div id="guia-error" className="error-msg">
            Ingresa una guía válida: entre 6 y 30 letras, números o guiones.
          </div>
        </div>

        <div className="field">
          <label htmlFor="tipoIncidencia">Tipo de incidencia</label>
          <select id="tipoIncidencia" name="tipoIncidencia" required defaultValue="" aria-errormessage="tipo-error">
            <option value="" disabled>
              Selecciona una opción
            </option>
            {TIPOS_INCIDENCIA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div id="tipo-error" className="error-msg">
            Selecciona el tipo de incidencia.
          </div>
        </div>

        <div className="field">
          <label htmlFor="descripcion">Descripción</label>
          <span id="desc-hint" className="hint">
            Entre {DESCRIPCION_MIN} y {DESCRIPCION_MAX} caracteres.
          </span>
          <textarea
            id="descripcion"
            name="descripcion"
            required
            rows={5}
            minLength={DESCRIPCION_MIN}
            maxLength={DESCRIPCION_MAX}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            aria-describedby="desc-hint desc-count"
            aria-errormessage="desc-error"
          />
          <div id="desc-count" className="counter">
            {descripcion.length} / {DESCRIPCION_MAX}
          </div>
          <div id="desc-error" className="error-msg">
            La descripción debe tener entre {DESCRIPCION_MIN} y {DESCRIPCION_MAX} caracteres.
          </div>
        </div>

        {error && (
          <Alert tipo="error">
            {error.message}
            {error.detalles && (
              <ul>
                {Object.entries(error.detalles).map(([campo, msg]) => (
                  <li key={campo}>{msg}</li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Registrar reclamo'}
        </button>
      </form>

      {creado && (
        <div className="success" role="status">
          <p>
            <strong>¡Reclamo registrado!</strong> Guarda tu folio para consultarlo después:
          </p>
          <p className="folio">
            <code>{creado.folio}</code>
          </p>
          <div className="actions">
            <button type="button" className="btn" onClick={copiarFolio}>
              {copiado ? 'Copiado ✓' : 'Copiar folio'}
            </button>
            <button type="button" className="btn" onClick={() => onConsultar(creado.folio)}>
              Consultar ahora
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
