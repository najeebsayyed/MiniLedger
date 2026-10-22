import { Request, Response, NextFunction } from 'express';
import * as summaryService from './summary.service.js';

export async function handleGetSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const summary = await summaryService.getSummary(ownerId);
    return res.status(200).json({ data: summary });
  } catch (err) {
    next(err);
  }
}
