export type UserRole = 'admin' | 'user';

export interface IUserService {
    getAllUsers(): Promise<any[]>;
    getUserById(id: string): Promise<any>;
    deleteUser(id: string): Promise<any>;
    updateUser(id: string, user: any): Promise<any>;
}