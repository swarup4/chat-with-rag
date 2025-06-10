import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocument extends Document {
    _id: Types.ObjectId;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
    _id: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
}, {
    versionKey: false,
    timestamps: true
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
