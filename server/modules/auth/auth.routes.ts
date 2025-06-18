import { Router } from 'express';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

class AuthRoutes {
    public router = Router();
    private authService = new AuthService();
    private authController = new AuthController(this.authService);

    constructor() {
        this.router.post('/register', this.authController.register.bind(this.authController));
        this.router.post('/login', this.authController.login.bind(this.authController));
    }
}

export default new AuthRoutes().router;
