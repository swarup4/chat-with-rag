import { UserRole } from '../user/user.types';

export interface RegisterPayload {
    name: string,
    role: UserRole,
    email: string,
    password: string
}

export interface LoginPayload {
    email: string;
    password: string;
    status: boolean;
}