import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

/** El YAML vive en backend/docs; la ruta relativa es válida tanto desde src/ como desde dist/. */
const OPENAPI_PATH = path.resolve(__dirname, '../docs/openapi.yaml');

export const createDocsRouter = (): Router => {
  const spec = parse(readFileSync(OPENAPI_PATH, 'utf8'));
  const router = Router();
  router.get('/openapi.json', (_req, res) => {
    res.json(spec);
  });
  router.use('/', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'API de Reclamos' }));
  return router;
};
