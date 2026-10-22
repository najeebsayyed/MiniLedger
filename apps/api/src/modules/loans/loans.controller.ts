import { Request, Response, NextFunction } from 'express';
import { createLoanSchema, loanFilterQuerySchema } from '@miniledger/contracts';
import * as loansService from './loans.service.js';
import { saveBase64Receipt, getSafeReceiptPath } from '../../lib/storage.js';
import { AppError } from '../../middleware/error-handler.js';
import path from 'path';

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

/**
 * Uploads a receipt standalone (via multipart/form-data or JSON base64)
 * Returns the generated receiptUrl for loan association.
 */
export async function handleUploadReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    let filename: string;
    let size: number;
    let mimetype: string;

    if (req.file) {
      // Multipart upload via Multer
      filename = req.file.filename;
      size = req.file.size;
      mimetype = req.file.mimetype;
    } else if (req.body.receiptBase64) {
      // JSON base64 upload
      const result = await saveBase64Receipt(req.body.receiptBase64);
      filename = result.filename;
      size = result.size;
      mimetype = result.mimetype;
    } else {
      throw new AppError(400, 'MISSING_FILE', 'No receipt image provided in request.');
    }

    const receiptUrl = `/api/v1/loans/receipts/${filename}`;

    return res.status(201).json({
      data: {
        receiptUrl,
        filename,
        size,
        mimetype,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Attaches a receipt to an existing loan
 */
export async function handleAttachReceiptToLoan(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const id = req.params.id;

    let receiptUrl: string;

    if (req.file) {
      receiptUrl = `/api/v1/loans/receipts/${req.file.filename}`;
    } else if (req.body.receiptBase64) {
      const result = await saveBase64Receipt(req.body.receiptBase64);
      receiptUrl = `/api/v1/loans/receipts/${result.filename}`;
    } else if (req.body.receiptUrl) {
      receiptUrl = req.body.receiptUrl;
    } else {
      throw new AppError(400, 'MISSING_FILE', 'No receipt image provided.');
    }

    const updatedLoan = await loansService.attachReceipt(id, ownerId, receiptUrl);
    return res.status(200).json({ data: updatedLoan });
  } catch (err) {
    next(err);
  }
}

/**
 * Removes a receipt from an existing loan
 */
export async function handleRemoveReceiptFromLoan(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const id = req.params.id;
    const updatedLoan = await loansService.removeReceipt(id, ownerId);
    return res.status(200).json({ data: updatedLoan });
  } catch (err) {
    next(err);
  }
}

/**
 * Securely serves an authenticated owner's loan receipt image
 */
export async function handleGetReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.id;
    const id = req.params.id;

    // Check loan exists and belongs to requesting owner
    const loan = await loansService.getLoanById(id, ownerId);
    if (!loan.receiptUrl) {
      throw new AppError(404, 'RECEIPT_NOT_FOUND', 'This loan does not have an attached receipt.');
    }

    const filename = path.basename(loan.receiptUrl);
    const safePath = getSafeReceiptPath(filename);

    if (!safePath) {
      throw new AppError(404, 'FILE_NOT_FOUND', 'Receipt file was not found on server.');
    }

    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.sendFile(safePath);
  } catch (err) {
    next(err);
  }
}

/**
 * Securely serves a receipt by filename directly if caller is authenticated
 */
export async function handleGetReceiptByFilename(req: Request, res: Response, next: NextFunction) {
  try {
    const filename = path.basename(req.params.filename);
    const safePath = getSafeReceiptPath(filename);

    if (!safePath) {
      throw new AppError(404, 'FILE_NOT_FOUND', 'Receipt file was not found.');
    }

    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.sendFile(safePath);
  } catch (err) {
    next(err);
  }
}
