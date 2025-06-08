import { Request, Response } from 'express';

export class IngestionController {
    async triggerIngestion(req: Request, res: Response) {
        // TODO: Implement trigger ingestion logic
        res.send('Trigger ingestion endpoint');
    }
}
