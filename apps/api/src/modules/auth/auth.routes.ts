import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleRequestOtp, handleVerifyOtp, handleGetMe, handleUpdateProfile } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const authRouter = Router();

// Rate limiter for request-otp: max 10 requests per 15 minutes per IP
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many OTP requests from this IP. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for verify-otp: max 20 requests per 15 minutes per IP
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many verification attempts from this IP. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/request-otp', otpRequestLimiter, handleRequestOtp);
authRouter.post('/verify-otp', otpVerifyLimiter, handleVerifyOtp);
authRouter.get('/me', authenticate, handleGetMe);
authRouter.patch('/profile', authenticate, handleUpdateProfile);
