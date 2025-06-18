import { Request, Response } from 'express';
import { UserService } from './user.service';
import { IUserService } from './user.types';

export class UserController {
    private userService: IUserService;

    constructor(userService: IUserService) {
        this.userService = userService;
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const user = await this.userService.getUserById(req.params.id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            });
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);
            res.status(200).json(user);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const user = await this.userService.deleteUser(req.params.id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
                user: user,
            });
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
}
