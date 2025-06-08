import { Router } from 'express';
import { IngestionController } from './ingestion.controller.js';

class IngestionRoutes {
  public router = Router();
  private controller = new IngestionController();

  constructor() {
    this.router.post('/trigger', this.controller.triggerIngestion.bind(this.controller));
    // Add more ingestion routes here as needed
  }
}

export default new IngestionRoutes().router;
