import mongoose, { Schema, Document } from 'mongoose';

export interface IIngestion extends Document {
    status: string;
    startedAt: Date;
    finishedAt?: Date;
}

const IngestionSchema = new Schema<IIngestion>({
    status: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
});

export default mongoose.model<IIngestion>('Ingestion', IngestionSchema);
