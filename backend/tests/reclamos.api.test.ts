import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryReclamoRepository } from '../src/repositories/InMemoryReclamoRepository';
import { AuthService } from '../src/services/AuthService';
import { ReclamoService } from '../src/services/ReclamoService';

const auth = new AuthService({
  jwtSecret: 'secreto-de-pruebas-suficientemente-largo',
  jwtExpiresIn: '1h',
  operadorUser: 'operador',
  operadorPassword: 'operador123',
});

const nuevoReclamo = {
  numeroGuia: 'GU987654',
  tipoIncidencia: 'No Recibido',
  descripcion: 'El paquete nunca llegó a la dirección de entrega indicada.',
};

const crearApp = () => createApp({ reclamoService: new ReclamoService(new InMemoryReclamoRepository()), authService: auth });

describe('API de reclamos', () => {
  it('POST crea un reclamo y GET lo consulta por folio (público)', async () => {
    const app = crearApp();

    const creado = await request(app).post('/api/reclamos').send(nuevoReclamo).expect(201);
    const consultado = await request(app).get(`/api/reclamos/${creado.body.folio}`).expect(200);

    expect(consultado.body).toMatchObject({ estado: 'Recibido', observaciones: [] });
    expect(consultado.body.fechaCreacion).toBeDefined();
    expect(consultado.body.fechaActualizacion).toBeDefined();
  });

  it('POST con tipo de incidencia inválido responde 400', async () => {
    const res = await request(crearApp()).post('/api/reclamos').send({ ...nuevoReclamo, tipoIncidencia: 'Otro' }).expect(400);
    expect(res.body.detalles.tipoIncidencia).toMatch(/Paquete Dañado/);
  });

  it('GET con folio inexistente responde 404 con mensaje amigable', async () => {
    const res = await request(crearApp()).get('/api/reclamos/REC-20260101-000000').expect(404);
    expect(res.body.error).toMatch(/No encontramos un reclamo con el folio REC-20260101-000000/);
  });

  describe('PATCH /api/reclamos/:folio', () => {
    const parche = { estado: 'En Revisión', observacion: 'Investigando con el transportista' };

    it('responde 401 sin token', async () => {
      const app = crearApp();
      const { body } = await request(app).post('/api/reclamos').send(nuevoReclamo);
      await request(app).patch(`/api/reclamos/${body.folio}`).send(parche).expect(401);
    });

    it('responde 401 con un token manipulado', async () => {
      const app = crearApp();
      const { body } = await request(app).post('/api/reclamos').send(nuevoReclamo);
      await request(app).patch(`/api/reclamos/${body.folio}`).set('Authorization', 'Bearer invalido').send(parche).expect(401);
    });

    it('responde 403 si el token no tiene rol operador', async () => {
      const app = crearApp();
      const { body } = await request(app).post('/api/reclamos').send(nuevoReclamo);
      const token = auth.emitirToken('cliente', 'cliente');
      await request(app).patch(`/api/reclamos/${body.folio}`).set('Authorization', `Bearer ${token}`).send(parche).expect(403);
    });

    it('con token de operador actualiza estado y agrega observación visibles en el GET público', async () => {
      const app = crearApp();
      const { body } = await request(app).post('/api/reclamos').send(nuevoReclamo);
      const { body: login } = await request(app).post('/api/auth/token').send({ usuario: 'operador', password: 'operador123' }).expect(200);

      await request(app).patch(`/api/reclamos/${body.folio}`).set('Authorization', `Bearer ${login.token}`).send(parche).expect(200);
      const consultado = await request(app).get(`/api/reclamos/${body.folio}`).expect(200);

      expect(consultado.body.estado).toBe('En Revisión');
      expect(consultado.body.observaciones).toEqual([
        expect.objectContaining({ comentario: parche.observacion, autor: 'operador', fecha: expect.any(String) }),
      ]);
    });
  });

  it('POST /api/auth/token rechaza credenciales incorrectas con 401', async () => {
    await request(crearApp()).post('/api/auth/token').send({ usuario: 'operador', password: 'mal' }).expect(401);
  });
});
