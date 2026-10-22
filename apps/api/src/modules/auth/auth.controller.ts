import { Request, Response, NextFunction } from 'express';
import { requestOtpSchema, verifyOtpSchema, updateProfileSchema } from '@miniledger/contracts';
import * as authService from './auth.service.js';

export async function handleRequestOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber } = requestOtpSchema.parse(req.body);
    const result = await authService.requestOtp(phoneNumber);
    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function handleVerifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phoneNumber, otp } = verifyOtpSchema.parse(req.body);
    const result = await authService.verifyOtp(phoneNumber, otp);
    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required.',
          requestId: req.requestId,
        },
      });
    }

    return res.status(200).json({ data: req.user });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required.',
          requestId: req.requestId,
        },
      });
    }

    const payload = updateProfileSchema.parse(req.body);
    const updatedUser = await authService.updateProfile(req.user.id, payload);
    return res.status(200).json({ data: updatedUser });
  } catch (err) {
    next(err);
  }
}
