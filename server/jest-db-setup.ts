import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();               // make .env values available in tests
let mongo: MongoMemoryServer;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    process.env.SECRET_KEY = 'test-secret';   // JWT needs some key
    jest.setTimeout(20_000);                  // raise global timeout to 20 s
});

afterEach(async () => {
    // wipe all collections between tests
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
        for (const c of collections) await c.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
});