export interface IDocumentService {
    getAllDocuments(): Promise<any>;
    deleteDocument(id: string): Promise<any>;
}