import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { IAuthService } from './auth.types';

dotenv.config();

export class AuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    async register(req: Request, res: Response) {
        try {
            const result = await this.authService.register(req.body);
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
            
            const result = await this.authService.login(obj);
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
