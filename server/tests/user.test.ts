import { UserController } from '../modules/user/user.controller';
import User from '../modules/user/user.model';

jest.mock('../modules/user/user.model');

describe('UserController', () => {
    let controller: UserController;
    let req: any;
    let res: any;

    beforeEach(() => {
        controller = new UserController();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const users = [{ _id: '1', name: 'User1', email: 'u1@mail.com', role: 'admin' }];
            (User.find as jest.Mock).mockResolvedValue(users);
            await controller.getAllUsers(req, res);
            expect(res.json).toHaveBeenCalledWith(users);
        });

        it('should return 404 if no users found', async () => {
            (User.find as jest.Mock).mockResolvedValue(null);
            await controller.getAllUsers(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('getUsers', () => {
        it('should return a user by id', async () => {
            req.params = { id: '1' };
            const user = { _id: '1', name: 'User1', email: 'u1@mail.com', role: 'admin' };
            (User.findById as jest.Mock).mockResolvedValue(user);
            await controller.getUsers(req, res);
            expect(res.json).toHaveBeenCalledWith({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            });
        });

        it('should return 404 if user not found', async () => {
            req.params = { id: '1' };
            (User.findById as jest.Mock).mockResolvedValue(null);
            await controller.getUsers(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });
});
