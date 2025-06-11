import User from './user.model';

export class UserService {
    async getAllUsers(): Promise<any[]> {
        return await User.find({});
    }

    async getUserById(id: string): Promise<any> {
        const user = await User.findById(id);
        return user;
    }

    async deleteUser(id: string): Promise<any> {
        const user = await User.findByIdAndUpdate(id, { status: false });
        return user;
    }
    
}