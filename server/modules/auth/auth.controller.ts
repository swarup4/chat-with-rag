import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

dotenv.config();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const authService = new AuthService();
            const result = await authService.register(req.body);
            res.json(result);
        } catch (error) {
            res.send(error);
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
            res.json(result);
        } catch (error) {
            res.send(error);
        }
    }
}
