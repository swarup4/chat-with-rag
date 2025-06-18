import { Request, Response } from 'express';
import { IDocumentService } from './document.types';

export class DocumentController {
    private documentService: IDocumentService;

    constructor(documentService: IDocumentService) {
        this.documentService = documentService;
    }

    async getAllDocument(req: Request, res: Response) {
        try {
            const documents = await this.documentService.getAllDocuments();
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    async deleteDocument(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const result = await this.documentService.deleteDocument(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
}
