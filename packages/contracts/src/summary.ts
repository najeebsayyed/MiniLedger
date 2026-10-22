import { z } from 'zod';

export const summaryDtoSchema = z.object({
  currency: z.literal('INR'),
  totalLent: z.string(),
  totalRepaid: z.string(),
  outstandingAmount: z.string(),
  overdueAmount: z.string(),
  activeLoansCount: z.number(),
  repaidLoansCount: z.number(),
  overdueLoansCount: z.number(),
});

export type SummaryDto = z.infer<typeof summaryDtoSchema>;

export const summaryResponseSchema = z.object({
  data: summaryDtoSchema,
});

export type SummaryResponse = z.infer<typeof summaryResponseSchema>;
