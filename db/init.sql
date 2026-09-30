-- Esquema y datos de prueba del módulo de reclamos
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS reclamos (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  folio           VARCHAR(20)  NOT NULL,
  numero_guia     VARCHAR(30)  NOT NULL,
  tipo_incidencia ENUM('Paquete Dañado', 'Paquete Incompleto', 'No Recibido') NOT NULL,
  descripcion     VARCHAR(500) NOT NULL,
  estado          ENUM('Recibido', 'En Revisión', 'Resuelto - Reembolso', 'Rechazado') NOT NULL DEFAULT 'Recibido',
  created_at      DATETIME(3)  NOT NULL,
  updated_at      DATETIME(3)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reclamos_folio (folio),
  KEY idx_reclamos_guia (numero_guia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS observaciones (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  reclamo_id  INT UNSIGNED NOT NULL,
  comentario  VARCHAR(1000) NOT NULL,
  autor       VARCHAR(60)   NOT NULL,
  created_at  DATETIME(3)   NOT NULL,
  PRIMARY KEY (id),
  KEY idx_obs_reclamo_fecha (reclamo_id, created_at),
  CONSTRAINT fk_obs_reclamo FOREIGN KEY (reclamo_id) REFERENCES reclamos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: 6 reclamos con distintos estados
INSERT INTO reclamos (id, folio, numero_guia, tipo_incidencia, descripcion, estado, created_at, updated_at) VALUES
(1, 'REC-20260901-A1B2C3', 'GU100000001', 'Paquete Dañado',     'La caja llegó aplastada y el producto interior tiene la pantalla rota.', 'Recibido',             '2026-09-01 15:10:00.000', '2026-09-01 15:10:00.000'),
(2, 'REC-20260902-B2C3D4', 'GU100000002', 'Paquete Incompleto', 'Se enviaron tres artículos pero en la caja solo venían dos de ellos.',   'En Revisión',          '2026-09-02 16:20:00.000', '2026-09-04 14:05:00.000'),
(3, 'REC-20260903-C3D4E5', 'GU100000003', 'No Recibido',        'Han pasado diez días desde la fecha estimada y el paquete no ha llegado.', 'En Revisión',          '2026-09-03 17:30:00.000', '2026-09-08 09:45:00.000'),
(4, 'REC-20260905-D4E5F6', 'GU100000004', 'Paquete Dañado',     'El empaque venía mojado y la mercancía quedó inservible por la humedad.', 'Resuelto - Reembolso', '2026-09-05 12:00:00.000', '2026-09-12 18:30:00.000'),
(5, 'REC-20260908-E5F6A7', 'GU100000005', 'No Recibido',        'El sistema indica entregado pero nadie en el domicilio recibió el envío.', 'Rechazado',            '2026-09-08 13:15:00.000', '2026-09-15 10:00:00.000'),
(6, 'REC-20260910-F6A7B8', 'GU100000006', 'Paquete Incompleto', 'Faltan los accesorios y el manual que venían incluidos en el pedido.',    'Recibido',             '2026-09-10 20:40:00.000', '2026-09-10 20:40:00.000');

INSERT INTO observaciones (reclamo_id, comentario, autor, created_at) VALUES
(2, 'Reclamo asignado al área de revisión de mercancía.',                                'operador', '2026-09-03 09:00:00.000'),
(2, 'Se solicitó al cliente evidencia fotográfica del contenido recibido.',              'operador', '2026-09-04 14:05:00.000'),
(3, 'Iniciamos la búsqueda del paquete con la sucursal de destino.',                    'operador', '2026-09-04 10:30:00.000'),
(3, 'La sucursal confirma que el paquete no fue escaneado en la última ruta.',          'operador', '2026-09-06 16:10:00.000'),
(3, 'Se abrió una investigación con el transportista.',                                  'operador', '2026-09-08 09:45:00.000'),
(4, 'Evidencia recibida y validada, se confirma daño en el empaque.',                    'operador', '2026-09-08 11:20:00.000'),
(4, 'Reembolso aprobado. Se verá reflejado en 5 a 7 días hábiles.',                      'operador', '2026-09-12 18:30:00.000'),
(5, 'El repartidor presentó evidencia de entrega con firma y fotografía.',               'operador', '2026-09-12 15:00:00.000'),
(5, 'Reclamo rechazado: la entrega fue comprobada en el domicilio registrado.',          'operador', '2026-09-15 10:00:00.000');
