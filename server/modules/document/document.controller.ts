import { Request, Response } from 'express';
import { DocumentService } from './document.service';

export class DocumentController {
    async getAllDocument(req: Request, res: Response) {
        try {
            const documentService = new DocumentService();
            const documents = await documentService.getAllDocuments();
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    async deleteDocument(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const documentService = new DocumentService();
            const result = await documentService.deleteDocument(id);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
}
