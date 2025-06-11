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

        it('should return empty array if no users found', async () => {
            (User.find as jest.Mock).mockResolvedValue([]);
            await controller.getAllUsers(req, res);
            expect(res.json).toHaveBeenCalledWith([]);
            expect(res.status).not.toHaveBeenCalledWith(404);
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


    describe('deleteUser', () => {
        it('should soft delete a user (update status)', async () => {
            req.params = { id: 'user123' };
            const updatedUser = { _id: 'user123', name: 'User', status: 'inactive' };
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

            await controller.deleteUser(req, res);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user123',
                { status: false }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User deleted successfully',
                user: updatedUser,
            });
        });
    });
});
