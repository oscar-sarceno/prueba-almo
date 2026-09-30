import { loadEnv } from '../config/env';
import { AuthService } from '../services/AuthService';

const env = loadEnv();
const auth = new AuthService({
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  operadorUser: env.OPERADOR_USER,
  operadorPassword: env.OPERADOR_PASSWORD,
});

console.log(auth.emitirToken(env.OPERADOR_USER));
