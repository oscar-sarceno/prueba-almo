import { FormEvent } from 'react';

interface Props {
  folio: string;
  onChange: (folio: string) => void;
  onBuscar: (folio: string) => void;
  cargando: boolean;
}

export const BuscarFolio = ({ folio, onChange, onBuscar, cargando }: Props) => {
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    onBuscar(folio);
  };

  return (
    <form onSubmit={enviar} className="search" role="search" aria-labelledby="titulo-consulta">
      <div className="field">
        <label htmlFor="folio">Folio de reclamo</label>
        <span id="folio-hint" className="hint">
          Ej: REC-20260902-B2C3D4
        </span>
        <div className="search__row">
          <input
            id="folio"
            name="folio"
            value={folio}
            onChange={(e) => onChange(e.target.value)}
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-describedby="folio-hint"
          />
          <button type="submit" className="btn btn--primary" disabled={cargando}>
            {cargando ? 'Consultando…' : 'Consultar'}
          </button>
        </div>
      </div>
    </form>
  );
};
