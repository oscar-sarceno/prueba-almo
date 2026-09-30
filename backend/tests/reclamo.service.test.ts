import { ConflictError, NotFoundError, ValidationError } from '../src/domain/errors';
import { InMemoryReclamoRepository } from '../src/repositories/InMemoryReclamoRepository';
import { generarFolio } from '../src/services/folio';
import { ReclamoService } from '../src/services/ReclamoService';
import { FOLIO_REGEX } from '../src/domain/reclamo';

const descripcionValida = 'El paquete llegó con la caja aplastada y el contenido roto.';
const reclamoValido = { numeroGuia: 'GU123456', tipoIncidencia: 'Paquete Dañado', descripcion: descripcionValida };

const crearServicio = (reloj: () => Date = () => new Date('2026-09-20T10:00:00Z')) =>
  new ReclamoService(new InMemoryReclamoRepository(), { now: reloj });

describe('ReclamoService.crear', () => {
  it('crea el reclamo con estado "Recibido", folio válido y fechas iguales', async () => {
    const reclamo = await crearServicio().crear(reclamoValido);

    expect(reclamo.folio).toMatch(FOLIO_REGEX);
    expect(reclamo.folio.startsWith('REC-20260920-')).toBe(true);
    expect(reclamo.estado).toBe('Recibido');
    expect(reclamo.observaciones).toEqual([]);
    expect(reclamo.fechaCreacion).toEqual(reclamo.fechaActualizacion);
  });

  it('rechaza un tipo de incidencia no permitido con ValidationError (400)', async () => {
    const promesa = crearServicio().crear({ ...reclamoValido, tipoIncidencia: 'Robo' });

    await expect(promesa).rejects.toBeInstanceOf(ValidationError);
    await expect(promesa).rejects.toMatchObject({ status: 400, detalles: { tipoIncidencia: expect.any(String) } });
  });

  it.each([
    ['demasiado corta', 'corta'],
    ['demasiado larga', 'x'.repeat(501)],
    ['solo espacios', ' '.repeat(30)],
  ])('rechaza una descripción %s', async (_caso, descripcion) => {
    await expect(crearServicio().crear({ ...reclamoValido, descripcion })).rejects.toMatchObject({
      status: 400,
      detalles: { descripcion: expect.any(String) },
    });
  });

  it('acepta descripciones en los límites (20 y 500 caracteres)', async () => {
    const servicio = crearServicio();
    await expect(servicio.crear({ ...reclamoValido, descripcion: 'a'.repeat(20) })).resolves.toBeDefined();
    await expect(servicio.crear({ ...reclamoValido, descripcion: 'a'.repeat(500) })).resolves.toBeDefined();
  });

  it('reintenta con otro folio cuando hay colisión', async () => {
    const folios = ['REC-20260920-AAAAAA', 'REC-20260920-AAAAAA', 'REC-20260920-BBBBBB'];
    const servicio = new ReclamoService(new InMemoryReclamoRepository(), {
      folioGenerator: () => folios.shift()!,
    });

    const primero = await servicio.crear(reclamoValido);
    const segundo = await servicio.crear(reclamoValido);

    expect(primero.folio).toBe('REC-20260920-AAAAAA');
    expect(segundo.folio).toBe('REC-20260920-BBBBBB');
  });

  it('falla con ConflictError si no logra generar un folio único', async () => {
    const servicio = new ReclamoService(new InMemoryReclamoRepository(), {
      folioGenerator: () => 'REC-20260920-AAAAAA',
    });
    await servicio.crear(reclamoValido);

    await expect(servicio.crear(reclamoValido)).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('ReclamoService.obtener', () => {
  it('devuelve el reclamo por folio, sin distinguir mayúsculas', async () => {
    const servicio = crearServicio();
    const { folio } = await servicio.crear(reclamoValido);

    const encontrado = await servicio.obtener(folio.toLowerCase());

    expect(encontrado.folio).toBe(folio);
  });

  it.each(['REC-20260101-000000', 'abc', ''])('lanza NotFoundError con mensaje amigable para "%s"', async (folio) => {
    const promesa = crearServicio().obtener(folio);

    await expect(promesa).rejects.toBeInstanceOf(NotFoundError);
    await expect(promesa).rejects.toThrow(/No encontramos un reclamo/);
  });
});

describe('ReclamoService.actualizar', () => {
  it('cambia el estado, agrega la observación y actualiza la fecha', async () => {
    let ahora = new Date('2026-09-20T10:00:00Z');
    const servicio = crearServicio(() => ahora);
    const { folio, fechaCreacion } = await servicio.crear(reclamoValido);

    ahora = new Date('2026-09-21T12:30:00Z');
    const actualizado = await servicio.actualizar(folio, { estado: 'En Revisión', observacion: 'Revisando evidencia' }, 'operador');

    expect(actualizado.estado).toBe('En Revisión');
    expect(actualizado.fechaCreacion).toEqual(fechaCreacion);
    expect(actualizado.fechaActualizacion).toEqual(ahora);
    expect(actualizado.observaciones).toEqual([{ comentario: 'Revisando evidencia', autor: 'operador', fecha: ahora }]);
  });

  it('mantiene el historial de observaciones en orden cronológico', async () => {
    let ahora = new Date('2026-09-20T10:00:00Z');
    const servicio = crearServicio(() => ahora);
    const { folio } = await servicio.crear(reclamoValido);

    for (const [i, texto] of ['primera', 'segunda', 'tercera'].entries()) {
      ahora = new Date(Date.UTC(2026, 8, 21 + i));
      await servicio.actualizar(folio, { observacion: texto }, 'operador');
    }

    const { observaciones } = await servicio.obtener(folio);
    expect(observaciones.map((o) => o.comentario)).toEqual(['primera', 'segunda', 'tercera']);
  });

  it('no permite cambiar el estado de un reclamo ya cerrado (ConflictError)', async () => {
    const servicio = crearServicio();
    const { folio } = await servicio.crear(reclamoValido);
    await servicio.actualizar(folio, { estado: 'Rechazado', observacion: 'Sin evidencia' }, 'operador');

    await expect(
      servicio.actualizar(folio, { estado: 'En Revisión', observacion: 'Reabrir' }, 'operador'),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('permite agregar observaciones a un reclamo cerrado sin cambiar su estado', async () => {
    const servicio = crearServicio();
    const { folio } = await servicio.crear(reclamoValido);
    await servicio.actualizar(folio, { estado: 'Resuelto - Reembolso', observacion: 'Reembolsado' }, 'operador');

    const actualizado = await servicio.actualizar(folio, { observacion: 'Cliente notificado' }, 'operador');

    expect(actualizado.estado).toBe('Resuelto - Reembolso');
    expect(actualizado.observaciones).toHaveLength(2);
  });

  it('valida estado y observación', async () => {
    const servicio = crearServicio();
    const { folio } = await servicio.crear(reclamoValido);

    await expect(servicio.actualizar(folio, { estado: 'Cerrado', observacion: 'x' }, 'op')).rejects.toBeInstanceOf(ValidationError);
    await expect(servicio.actualizar(folio, { estado: 'Rechazado' }, 'op')).rejects.toBeInstanceOf(ValidationError);
    await expect(servicio.actualizar(folio, { observacion: '   ' }, 'op')).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si el folio no existe', async () => {
    await expect(
      crearServicio().actualizar('REC-20260101-000000', { observacion: 'hola' }, 'operador'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('generarFolio', () => {
  it('genera folios con el formato esperado y distintos entre sí', () => {
    const fecha = new Date('2026-01-05T00:00:00Z');
    const folios = new Set(Array.from({ length: 50 }, () => generarFolio(fecha)));

    expect(folios.size).toBe(50);
    folios.forEach((f) => expect(f).toMatch(/^REC-20260105-[A-F0-9]{6}$/));
  });
});
