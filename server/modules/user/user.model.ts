import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    status: boolean;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: Boolean, default: true }
}, { versionKey: false });

export default mongoose.model<IUser>('User', UserSchema);
