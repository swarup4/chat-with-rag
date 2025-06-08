import { Router } from 'express';
import { DocumentController } from './document.controller.js';

class DocumentRoutes {
  public router = Router();
  private controller = new DocumentController();

  constructor() {
    this.router.post('/', this.controller.createDocument.bind(this.controller));
    // Add more document routes here as needed
  }
}

export default new DocumentRoutes().router;
