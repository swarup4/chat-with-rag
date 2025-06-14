import { Router } from 'express';
import { UserController } from './user.controller';

class UserRoutes {
    public router = Router();
    private controller = new UserController();

    constructor() {
        this.router.get('/', this.controller.getAllUsers);
        this.router.get('/getUser/:id', this.controller.getUsers);
        this.router.delete('/deleteUser/:id', this.controller.deleteUser);
    }
}

export default new UserRoutes().router;
