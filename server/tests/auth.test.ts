import request from 'supertest';
import app from '../app';

const userPayload = {
    name: 'Test User',
    email: 'testuser1@example.com',
    password: 'Test@1234',
    role: 'user'
};

describe('Auth Module', () => {
    it('should register a user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(userPayload);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            email: userPayload.email,
            name: userPayload.name,
            role: userPayload.role
        });
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('token');
    });

    it('should login a user', async () => {
        await request(app).post('/api/auth/register').send(userPayload);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: userPayload.email, password: userPayload.password });

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(userPayload.email);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('token');
    });
});