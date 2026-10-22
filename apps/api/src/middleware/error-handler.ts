import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details,
      },
    });
  }

  if (
    err instanceof ZodError ||
    (typeof err === 'object' && err !== null && (err as any).name === 'ZodError')
  ) {
    const zodErr = err as any;
    const issues = zodErr.issues || zodErr.errors || [];
    const formattedErrors = issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : '',
      message: e.message,
    }));
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: formattedErrors[0]?.message || 'Validation failed',
        requestId,
        details: formattedErrors,
      },
    });
  }

  console.error(`[Error] Request ID ${requestId}:`, err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal server error occurred.',
      requestId,
    },
  });
}
