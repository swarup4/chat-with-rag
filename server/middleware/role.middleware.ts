import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    // Role-based authorization logic placeholder
    next();
};
