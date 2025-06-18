import { DocumentController } from '../modules/document/document.controller';
import { DocumentModel, VectorModel } from '../modules/document/document.model';

jest.mock('../modules/document/document.model');

describe('DocumentController', () => {
    let controller: DocumentController;
    let req: any;
    let res: any;
    let mockDocumentService: any;

    beforeEach(() => {
        mockDocumentService = {
            getAllDocuments: jest.fn(),
            deleteDocument: jest.fn(),
        };
        controller = new DocumentController(mockDocumentService);
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
            mockDocumentService.getAllDocuments.mockResolvedValue(docs);
            await controller.getAllDocument(req, res);
            expect(res.json).toHaveBeenCalledWith(docs);
        });

        it('should return empty array if no documents found', async () => {
            mockDocumentService.getAllDocuments.mockResolvedValue([]);
            await controller.getAllDocument(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    describe('deleteDocument', () => {
        it('should delete a document and its vectors', async () => {
            req.params = { id: 'docid123' };
            const result = { success: true, message: 'Delete file successfully' };
            mockDocumentService.deleteDocument.mockResolvedValue(result);
            await controller.deleteDocument(req, res);
            expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith('docid123');
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it('should handle errors', async () => {
            req.params = { id: 'docid123' };
            const error = new Error('DB error');
            mockDocumentService.deleteDocument.mockRejectedValue(error);
            await controller.deleteDocument(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Server error');
        });
    });
});
