import { Router } from 'express';
import { DocumentController } from './document.controller';

class DocumentRoutes {
    public router = Router();
    private controller = new DocumentController();

    constructor() {
        this.router.get('/', this.controller.getAllDocument);
        this.router.delete('/deleteDocument/:id', this.controller.deleteDocument);
    }
}

export default new DocumentRoutes().router;
