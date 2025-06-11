import { DocumentController } from '../modules/document/document.controller';
import { DocumentModel, VectorModel } from '../modules/document/document.model';

jest.mock('../modules/document/document.model');

describe('DocumentController', () => {
    let controller: DocumentController;
    let req: any;
    let res: any;

    beforeEach(() => {
        controller = new DocumentController();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('getAllDocument', () => {
        it('should return all documents', async () => {
            const docs = [{ _id: '1', name: 'Doc1' }];
            (DocumentModel.find as jest.Mock).mockResolvedValue(docs);
            await controller.getAllDocument(req, res);
            expect(res.json).toHaveBeenCalledWith(docs);
        });

        it('should return empty array if no documents found', async () => {
            (DocumentModel.find as jest.Mock).mockResolvedValue([]);
            await controller.getAllDocument(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    describe('deleteDocument', () => {
        it('should delete a document and its vectors', async () => {
            req.params = { id: 'docid123' };
            (DocumentModel.findOneAndDelete as jest.Mock).mockResolvedValue({ _id: 'docid123' });
            (VectorModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
            await controller.deleteDocument(req, res);
            expect(DocumentModel.findOneAndDelete).toHaveBeenCalledWith({ _id: 'docid123' });
            expect(VectorModel.deleteMany).toHaveBeenCalledWith({ documentId: 'docid123' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Delete file successfully',
            });
        });

        it('should handle errors', async () => {
            req.params = { id: 'docid123' };
            const error = new Error('DB error');
            (DocumentModel.findOneAndDelete as jest.Mock).mockRejectedValue(error);
            await controller.deleteDocument(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Server error');
        });
    });
});
