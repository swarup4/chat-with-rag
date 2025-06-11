import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from './user.types';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
}, { versionKey: false, timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
