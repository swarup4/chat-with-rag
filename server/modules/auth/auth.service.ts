import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { RegisterPayload, LoginPayload } from "./auth.types";
import User from '../user/user.model';

export class AuthService {
    async register(userData: RegisterPayload) {
        try {
            const model = new User(userData);
            const user = await model.save();
            const obj = { id: user._id, email: user.email };
            const token = jwt.sign(obj, process.env.SECRATE_KEY || '', {
                expiresIn: 3600
            });
            return {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                token
            };
        } catch (error) {
            return error;
        }
    }

    async login(userData: LoginPayload) {
        const user = await User.findOne(userData);
        if (!user) {
            throw new Error("Invalid email or password");
        }
        
        const obj = { id: user._id, email: user.email };
        const token = jwt.sign(obj, process.env.SECRATE_KEY || '', { expiresIn: 3600 });
        return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            token
        };
    }
}
