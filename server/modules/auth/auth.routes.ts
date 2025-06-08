import { Router } from 'express';
import { AuthController } from './auth.controller';

class AuthRoutes {
  public router = Router();
  private controller = new AuthController();

  constructor() {
    this.router.post('/register', this.controller.register.bind(this.controller));
    this.router.post('/login', this.controller.login.bind(this.controller));
    this.router.post('/logout', this.controller.logout.bind(this.controller));
    // Add more auth routes here as needed
  }
}

export default new AuthRoutes().router;
