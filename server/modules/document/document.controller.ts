import { Request, Response } from 'express';
import Document from './document.model';
export class DocumentController {
    async getAllDocument(req: Request, res: Response) {
        try {
            const document = await Document.find({});
            if (!document) {
                res.status(404).json({ message: 'Document not found' });
            }
            res.json(document);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
}
