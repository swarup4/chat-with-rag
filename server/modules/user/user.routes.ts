import { Router } from 'express';
import { UserController } from './user.controller';
import { UserService } from './user.service';

class UserRoutes {
    public router = Router();
    private userService = new UserService();
    private userController = new UserController(this.userService);

    constructor() {
        this.router.get('/', this.userController.getAllUsers.bind(this.userController));
        this.router.get('/getUser/:id', this.userController.getUsers.bind(this.userController));
        this.router.put('/updateUser/:id', this.userController.updateUser.bind(this.userController));
        this.router.delete('/deleteUser/:id', this.userController.deleteUser.bind(this.userController));
    }
}

export default new UserRoutes().router;
