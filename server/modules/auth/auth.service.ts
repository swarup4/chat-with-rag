import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { RegisterPayload, LoginPayload } from "./auth.types";
import User from '../user/user.model';

export class AuthService {
    async register(userData: RegisterPayload): Promise<any>  {
        try {
            const model = new User(userData);
            const user = await model.save();
            const obj = { id: user._id, email: user.email };
            const token = jwt.sign(obj, process.env.SECRATE_KEY || '', {
                expiresIn: 3600
            });
            return { user, token };
        } catch (error) {
            throw error;
        }
    }

    async login(userData: LoginPayload): Promise<any> {
        const user = await User.findOne(userData);
        if (!user) {
            throw new Error("Invalid email or password");
        }
        
        const obj = { id: user._id, email: user.email };
        const token = jwt.sign(obj, process.env.SECRATE_KEY || '', { expiresIn: 3600 });
        return { user, token };
    }
}
