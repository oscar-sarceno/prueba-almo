import { useRef, useState } from 'react';
import { ApiError, consultarReclamo } from './api/reclamosApi';
import { Alert } from './components/Alert';
import { BuscarFolio } from './components/BuscarFolio';
import { ReclamoCard } from './components/ReclamoCard';
import { ReclamoForm } from './components/ReclamoForm';
import { Reclamo } from './types';

type Consulta =
  | { estado: 'inactiva' }
  | { estado: 'cargando' }
  | { estado: 'error'; mensaje: string }
  | { estado: 'ok'; reclamo: Reclamo };

export const App = () => {
  const [folio, setFolio] = useState('');
  const [consulta, setConsulta] = useState<Consulta>({ estado: 'inactiva' });
  const ultimaPeticion = useRef(0);

  const consultar = async (valor: string) => {
    const id = ++ultimaPeticion.current;
    setFolio(valor);
    setConsulta({ estado: 'cargando' });
    try {
      const reclamo = await consultarReclamo(valor);
      if (id === ultimaPeticion.current) setConsulta({ estado: 'ok', reclamo });
    } catch (err) {
      if (id !== ultimaPeticion.current) return;
      const mensaje = err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.';
      setConsulta({ estado: 'error', mensaje });
    }
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>Reclamos de envíos</h1>
          <p>Registra una incidencia con tu paquete y sigue su avance con tu folio.</p>
        </div>
      </header>

      <main className="container layout">
        <ReclamoForm onCreado={(r) => setFolio(r.folio)} onConsultar={consultar} />

        <section className="card" aria-labelledby="titulo-consulta">
          <h2 id="titulo-consulta">Consultar reclamo</h2>
          <BuscarFolio folio={folio} onChange={setFolio} onBuscar={consultar} cargando={consulta.estado === 'cargando'} />

          <div aria-live="polite">
            {consulta.estado === 'error' && <Alert tipo="error">{consulta.mensaje}</Alert>}
            {consulta.estado === 'ok' && <ReclamoCard reclamo={consulta.reclamo} />}
          </div>
        </section>
      </main>

      <footer className="footer container">
        <small>Portal de reclamos · Si necesitas ayuda, conserva siempre tu folio.</small>
      </footer>
    </>
  );
};
