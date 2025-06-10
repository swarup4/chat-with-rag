import { Router } from 'express';
import { UserController } from './user.controller';

class UserRoutes {
  public router = Router();
  private controller = new UserController();

  constructor() {
    this.router.get('/', this.controller.getUsers.bind(this.controller));
    // Add more user routes here as needed
  }
}

export default new UserRoutes().router;
