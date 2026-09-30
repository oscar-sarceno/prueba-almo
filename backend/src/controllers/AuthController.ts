import { RequestHandler } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login: RequestHandler = (req, res, next) => {
    try {
      res.json(this.auth.login(req.body));
    } catch (err) {
      next(err);
    }
  };
}
