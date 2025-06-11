import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

dotenv.config();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const authService = new AuthService();
            const result = await authService.register(req.body);
            const { user, token } = result;
            res.status(200).json({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                token
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Registration failed' });
        }
    }

    async login(req: Request, res: Response) {
        try {
            let obj = {
                ...req.body,
                status: true
            }
            
            const authService = new AuthService();
            const result = await authService.login(obj);
            const { user, token } = result;
            
            res.status(200).json({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                token
            });
        } catch (error) {
            res.status(401).send(error);
        }
    }
}
