import { DocumentModel, VectorModel } from './document.model';

export class DocumentService {
    async getAllDocuments(): Promise<any> {
        const documents = await DocumentModel.find({});
        return documents;
    }

    async deleteDocument(id: string): Promise<any> {
        await DocumentModel.findOneAndDelete({ _id: id });
        await VectorModel.deleteMany({ documentId: id });
        return {
            success: true,
            message: "Delete file successfully"
        };
    }
}
