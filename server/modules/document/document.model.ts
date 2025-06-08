import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocument extends Document {
    title: string;
    content: string;
    owner: Types.ObjectId; // Use ObjectId type for references
}

const DocumentSchema = new Schema<IDocument>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
