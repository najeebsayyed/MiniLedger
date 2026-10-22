import { Request, Response, NextFunction } from 'express';
import { createLoanSchema, loanFilterQuerySchema } from '@miniledger/contracts';
import * as loansService from './loans.service.js';

export async function handleCreateLoan(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const input = createLoanSchema.parse(req.body);
    const loan = await loansService.createLoan(ownerId, input);
    return res.status(201).json({ data: loan });
  } catch (err) {
    next(err);
  }
}

export async function handleGetLoans(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const query = loanFilterQuerySchema.parse(req.query);
    const result = await loansService.getLoans(ownerId, query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetLoanById(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const id = req.params.id;
    const loan = await loansService.getLoanById(id, ownerId);
    return res.status(200).json({ data: loan });
  } catch (err) {
    next(err);
  }
}

export async function handleRepayLoan(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const id = req.params.id;
    const updatedLoan = await loansService.markLoanAsRepaid(id, ownerId);
    return res.status(200).json({ data: updatedLoan });
  } catch (err) {
    next(err);
  }
}
