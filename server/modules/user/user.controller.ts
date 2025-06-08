import { Request, Response } from 'express';

export class UserController {
    async getUsers(req: Request, res: Response) {
        // TODO: Implement get users logic
        res.send('Get users endpoint');
    }
}
