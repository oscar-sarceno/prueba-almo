import { ConflictError, NotFoundError } from '../domain/errors';
import { ESTADOS_FINALES, FOLIO_REGEX, Reclamo } from '../domain/reclamo';
import { ReclamoRepository } from '../repositories/ReclamoRepository';
import {
  actualizarReclamoSchema,
  crearReclamoSchema,
  normalizarFolio,
  parseOrThrow,
} from '../validators/reclamo.schemas';
import { FolioGenerator, generarFolio } from './folio';

const MAX_INTENTOS_FOLIO = 5;

export interface ReclamoServiceOptions {
  now?: () => Date;
  folioGenerator?: FolioGenerator;
}

export class ReclamoService {
  private readonly now: () => Date;
  private readonly folioGenerator: FolioGenerator;

  constructor(
    private readonly repo: ReclamoRepository,
    options: ReclamoServiceOptions = {},
  ) {
    this.now = options.now ?? (() => new Date());
    this.folioGenerator = options.folioGenerator ?? generarFolio;
  }

  async crear(input: unknown): Promise<Reclamo> {
    const data = parseOrThrow(crearReclamoSchema, input);
    const fecha = this.now();

    for (let intento = 0; intento < MAX_INTENTOS_FOLIO; intento++) {
      const folio = this.folioGenerator(fecha);
      if (await this.repo.create({ ...data, folio, fecha })) {
        return this.obtenerExistente(folio);
      }
    }
    throw new ConflictError('No fue posible generar un folio único. Intenta de nuevo.');
  }

  async obtener(folioRaw: string): Promise<Reclamo> {
    return this.obtenerExistente(normalizarFolio(folioRaw));
  }

  async actualizar(folioRaw: string, input: unknown, autor: string): Promise<Reclamo> {
    const folio = normalizarFolio(folioRaw);
    const { estado, observacion } = parseOrThrow(actualizarReclamoSchema, input);

    const actual = await this.obtenerExistente(folio);
    if (estado && estado !== actual.estado && ESTADOS_FINALES.includes(actual.estado)) {
      throw new ConflictError(
        `El reclamo ya fue cerrado con estado "${actual.estado}" y no puede cambiar a "${estado}".`,
      );
    }

    const actualizado = await this.repo.update(folio, {
      estado,
      observacion: { comentario: observacion, autor },
      fecha: this.now(),
    });
    if (!actualizado) throw this.folioNoEncontrado(folio);
    return actualizado;
  }

  private async obtenerExistente(folio: string): Promise<Reclamo> {
    // Un folio con formato inválido no puede existir: se responde igual que un folio inexistente.
    const reclamo = FOLIO_REGEX.test(folio) ? await this.repo.findByFolio(folio) : null;
    if (!reclamo) throw this.folioNoEncontrado(folio);
    return reclamo;
  }

  private folioNoEncontrado(folio: string) {
    return new NotFoundError(`No encontramos un reclamo con el folio ${folio}. Verifica el folio e intenta de nuevo.`);
  }
}
