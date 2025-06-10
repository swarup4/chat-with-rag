import { Request, Response } from 'express';
import { DocumentModel, VectorModel } from './document.model';
export class DocumentController {
    async getAllDocument(req: Request, res: Response) {
        try {
            const document = await DocumentModel.find({});
            if (!document) {
                res.status(404).json({ message: 'Document not found' });
            }
            res.json(document);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }

    async deleteDocument(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const doc = await DocumentModel.findOneAndDelete({ _id: id });
            const vector = await VectorModel.deleteMany({ documentId: id });

            res.json({
                success: true,
                message: "Delete file successfully",
            });
        } catch (error) {
            res.send(error);
        }
    }
}
