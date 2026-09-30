import { createApp } from './app';
import { loadEnv } from './config/env';

const env = loadEnv();
const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API de reclamos escuchando en http://localhost:${env.PORT}`);
});
