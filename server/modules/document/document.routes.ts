import { Router } from 'express';
import { DocumentController } from './document.controller';
import { authenticate } from '../auth/auth.middleware';

class DocumentRoutes {
    public router = Router();
    private controller = new DocumentController();

    constructor() {
        this.router.get('/', authenticate, this.controller.getAllDocument);
        this.router.delete('/deleteDocument/:id', authenticate, this.controller.deleteDocument);
    }
}

export default new DocumentRoutes().router;
