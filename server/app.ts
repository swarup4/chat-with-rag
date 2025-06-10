import express, { json } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import documentRoutes from './modules/document/document.routes';
// import ingestionRoutes from './modules/ingestion/ingestion.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
app.use(cors());
app.use(json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
// app.use('/api/ingestion', ingestionRoutes);

app.use(errorHandler);

export default app;
