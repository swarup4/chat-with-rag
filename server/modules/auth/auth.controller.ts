import dotenv from 'dotenv';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../user/user.model';

dotenv.config();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
        const model = new User(req.body);
        const user = await model.save();
        const obj = { id: user._id, email: user.email };
        const token = jwt.sign(obj, process.env.SECRATE_KEY || '', {
            expiresIn: 3600
        });

        res.send({
            id: user._id,
            email: user.email,
            name: user.name,
            token: token
        });
    } catch (error) {
        res.send(error);
    }
    }

    async login(req: Request, res: Response) {
        try {
            const obj = {
                email: req.body.email,
                password: req.body.password,
                status: true
            }

            const user = await User.findOne(obj);
            if (user == null) {
                res.status(401).send("Username & password is not Valid")
            } else {
                const obj = { id: user._id, email: user.email };
                const token = jwt.sign(obj, process.env.SECRATE_KEY || '', {
                    expiresIn: 3600
                });

                res.json({
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    token: token
                });
            }
        } catch (error) {
            res.send(error);
        }
    }

    async logout(req: Request, res: Response) {
        // TODO: Implement logout logic
        res.send('Logout endpoint');
    }
}
