export interface RegisterPayload {
    name: string,
    role: string,
    email: string,
    password: string
}

export interface LoginPayload {
    email: string;
    password: string;
    status: boolean;
}