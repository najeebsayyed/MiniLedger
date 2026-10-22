import { z } from 'zod';

export const e164Regex = /^\+[1-9]\d{7,14}$/;
export const otpRegex = /^\d{6}$/;

export const requestOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(e164Regex, 'Enter a valid phone number in E.164 format (e.g. +919876543210)'),
});

export type RequestOtpRequest = z.infer<typeof requestOtpSchema>;

export const requestOtpResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    expiresInSeconds: z.number(),
    resendAfterSeconds: z.number(),
  }),
});

export type RequestOtpResponse = z.infer<typeof requestOtpResponseSchema>;

export const verifyOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(e164Regex, 'Enter a valid phone number in E.164 format'),
  otp: z
    .string()
    .trim()
    .regex(otpRegex, 'Enter the 6-digit code'),
});

export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;

export const userDtoSchema = z.object({
  id: z.string().uuid(),
  phoneNumber: z.string(),
  createdAt: z.string(),
});

export type UserDto = z.infer<typeof userDtoSchema>;

export const verifyOtpResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    tokenType: z.literal('Bearer'),
    expiresInSeconds: z.number(),
    user: userDtoSchema,
  }),
});

export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;

export const meResponseSchema = z.object({
  data: userDtoSchema,
});

export type MeResponse = z.infer<typeof meResponseSchema>;
