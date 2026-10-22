import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  handleCreateLoan,
  handleGetLoans,
  handleGetLoanById,
  handleRepayLoan,
} from './loans.controller.js';

export const loansRouter = Router();

loansRouter.use(authenticate);

loansRouter.post('/', handleCreateLoan);
loansRouter.get('/', handleGetLoans);
loansRouter.get('/:id', handleGetLoanById);
loansRouter.patch('/:id/repay', handleRepayLoan);
