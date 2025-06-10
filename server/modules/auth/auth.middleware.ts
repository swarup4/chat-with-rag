import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).send({ auth: false, message: 'No token provided' });
    } else {
        jwt.verify(token, process.env.SECRATE_KEY as string, (err, decoded) => {
            if (err) {
                res.status(401).json({ auth: false, message: 'Failed to authenticate token', error: err });
            } else {
                next();
            }
        });
    }
};
