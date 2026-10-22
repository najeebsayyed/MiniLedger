import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { receiptUpload } from '../../lib/storage.js';
import {
  handleCreateLoan,
  handleGetLoans,
  handleGetLoanById,
  handleRepayLoan,
  handleUploadReceipt,
  handleGetReceipt,
  handleGetReceiptByFilename,
  handleAttachReceiptToLoan,
  handleRemoveReceiptFromLoan,
} from './loans.controller.js';

export const loansRouter = Router();

loansRouter.use(authenticate);

// Receipt endpoints (placed before /:id parameterized routes to avoid conflicts)
loansRouter.post('/upload-receipt', receiptUpload.single('receipt'), handleUploadReceipt);
loansRouter.get('/receipts/:filename', handleGetReceiptByFilename);

// Core loan routes
loansRouter.post('/', handleCreateLoan);
loansRouter.get('/', handleGetLoans);
loansRouter.get('/:id', handleGetLoanById);
loansRouter.patch('/:id/repay', handleRepayLoan);

// Loan-specific receipt operations
loansRouter.get('/:id/receipt', handleGetReceipt);
loansRouter.post('/:id/receipt', receiptUpload.single('receipt'), handleAttachReceiptToLoan);
loansRouter.delete('/:id/receipt', handleRemoveReceiptFromLoan);
