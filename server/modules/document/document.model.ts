import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocument extends Document {
    _id: Types.ObjectId;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IVector extends Document {
    _id: Types.ObjectId;
    documentId: string;
    chunk: string;
    embedding: number[];
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

const VectorSchema = new Schema<IVector>({
    _id: { type: Schema.Types.ObjectId },
    documentId: { type: String, required: true },
    chunk: { type: String },
    embedding: { type: [Number], default: [] }
}, {
    versionKey: false,
    timestamps: true
});

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
export const VectorModel = mongoose.model<IVector>('Vector', VectorSchema);
