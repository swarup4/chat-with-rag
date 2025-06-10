import { Router } from 'express';
import { AuthController } from './auth.controller';

class AuthRoutes {
    public router = Router();
    private controller = new AuthController();

    constructor() {
        this.router.post('/register', this.controller.register);
        this.router.post('/login', this.controller.login);
    }
}

export default new AuthRoutes().router;
