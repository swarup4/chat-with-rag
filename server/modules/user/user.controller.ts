import { Request, Response } from 'express';
import { UserService } from './user.service';

export class UserController {
    
    async getAllUsers(req: Request, res: Response) {
        try {
            const userService = new UserService();
            const users = await userService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const userService = new UserService();
            const user = await userService.getUserById(req.params.id);
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

    async deleteUser(req: Request, res: Response) {
        try {
            const userService = new UserService();
            const user = await userService.deleteUser(req.params.id);
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
