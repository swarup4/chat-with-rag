import { Router } from 'express';
import { DocumentController } from './document.controller';

const router = Router();
const controller = new DocumentController();

router.post('/', controller.createDocument.bind(controller));

export default router;
