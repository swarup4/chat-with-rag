import request from 'supertest';
import app from '../app'; // Adjust the path if needed

describe('Auth Module', () => {
    it('should register a user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'testuser1@example.com',
                password: 'Test@1234',
                role: 'viewer'
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', 'testuser1@example.com');
        expect(res.body).toHaveProperty('name', 'Test User');
        expect(res.body).toHaveProperty('role', 'viewer');
        expect(res.body).toHaveProperty('token');
    });

    it('should login a user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testuser1@example.com',
                password: 'Test@1234'
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', 'testuser1@example.com');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('role');
        expect(res.body).toHaveProperty('token');
    });
});
