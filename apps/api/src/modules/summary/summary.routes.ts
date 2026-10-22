import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { handleGetSummary } from './summary.controller.js';

export const summaryRouter = Router();

summaryRouter.get('/', authenticate, handleGetSummary);
