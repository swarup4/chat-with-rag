import { Request, Response } from 'express';
import User from './user.model';

export class UserController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const user = await User.find({});
            if (!user) {
                res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
            }
            res.json({
                id: user?._id,
                email: user?.email,
                name: user?.name,
                role: user?.role
            });
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
}
