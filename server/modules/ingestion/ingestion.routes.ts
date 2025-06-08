import { Router } from 'express';
import { IngestionController } from './ingestion.controller';

const router = Router();
const controller = new IngestionController();

router.post('/trigger', controller.triggerIngestion.bind(controller));

export default router;
