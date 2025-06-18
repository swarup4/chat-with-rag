import { Router } from 'express';
import { DocumentController } from './document.controller';
import { authenticate } from '../auth/auth.middleware';
import { DocumentService } from './document.service';

class DocumentRoutes {
    public router = Router();
    private documentService = new DocumentService();
    private documentController = new DocumentController(this.documentService);

    constructor() {
        this.router.get('/', authenticate, this.documentController.getAllDocument.bind(this.documentController));
        this.router.delete('/deleteDocument/:id', authenticate, this.documentController.deleteDocument.bind(this.documentController));
    }
}

export default new DocumentRoutes().router;
