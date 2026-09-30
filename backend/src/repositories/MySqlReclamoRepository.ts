import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { EstadoReclamo, Observacion, Reclamo, TipoIncidencia } from '../domain/reclamo';
import { ActualizacionReclamo, NuevoReclamo, ReclamoRepository } from './ReclamoRepository';

interface ReclamoRow extends RowDataPacket {
  id: number;
  folio: string;
  numero_guia: string;
  tipo_incidencia: TipoIncidencia;
  descripcion: string;
  estado: EstadoReclamo;
  created_at: Date;
  updated_at: Date;
}

interface ObservacionRow extends RowDataPacket {
  comentario: string;
  autor: string;
  created_at: Date;
}

export class MySqlReclamoRepository implements ReclamoRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: NuevoReclamo): Promise<boolean> {
    try {
      await this.pool.execute(
        `INSERT INTO reclamos (folio, numero_guia, tipo_incidencia, descripcion, estado, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'Recibido', ?, ?)`,
        [data.folio, data.numeroGuia, data.tipoIncidencia, data.descripcion, data.fecha, data.fecha],
      );
      return true;
    } catch (err) {
      if ((err as { code?: string }).code === 'ER_DUP_ENTRY') return false;
      throw err;
    }
  }

  async findByFolio(folio: string): Promise<Reclamo | null> {
    return this.load(this.pool, folio);
  }

  async update(folio: string, data: ActualizacionReclamo): Promise<Reclamo | null> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.execute<ReclamoRow[]>('SELECT id FROM reclamos WHERE folio = ? FOR UPDATE', [folio]);
      if (rows.length === 0) {
        await conn.rollback();
        return null;
      }
      const id = rows[0].id;
      if (data.estado) {
        await conn.execute('UPDATE reclamos SET estado = ?, updated_at = ? WHERE id = ?', [data.estado, data.fecha, id]);
      } else {
        await conn.execute('UPDATE reclamos SET updated_at = ? WHERE id = ?', [data.fecha, id]);
      }
      await conn.execute('INSERT INTO observaciones (reclamo_id, comentario, autor, created_at) VALUES (?, ?, ?, ?)', [
        id,
        data.observacion.comentario,
        data.observacion.autor,
        data.fecha,
      ]);
      await conn.commit();
      return this.load(conn, folio);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  private async load(db: Pool | PoolConnection, folio: string): Promise<Reclamo | null> {
    const [rows] = await db.execute<ReclamoRow[]>('SELECT * FROM reclamos WHERE folio = ?', [folio]);
    if (rows.length === 0) return null;
    const row = rows[0];
    const [obs] = await db.execute<ObservacionRow[]>(
      'SELECT comentario, autor, created_at FROM observaciones WHERE reclamo_id = ? ORDER BY created_at ASC, id ASC',
      [row.id],
    );
    const observaciones: Observacion[] = obs.map((o) => ({ comentario: o.comentario, autor: o.autor, fecha: o.created_at }));
    return {
      folio: row.folio,
      numeroGuia: row.numero_guia,
      tipoIncidencia: row.tipo_incidencia,
      descripcion: row.descripcion,
      estado: row.estado,
      fechaCreacion: row.created_at,
      fechaActualizacion: row.updated_at,
      observaciones,
    };
  }
}
