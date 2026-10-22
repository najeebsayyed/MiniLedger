import { z } from 'zod';

export const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
export const decimalAmountRegex = /^(?!0(\.00?)?$)\d+(\.\d{1,2})?$/;

export const loanStatusSchema = z.enum(['ACTIVE', 'REPAID']);
export type LoanStatus = z.infer<typeof loanStatusSchema>;

export const createLoanSchema = z.object({
  friendName: z
    .string()
    .trim()
    .min(1, 'Add your friend’s name.')
    .max(80, 'Name must be 80 characters or fewer.'),
  amount: z
    .string()
    .trim()
    .regex(decimalAmountRegex, 'Enter an amount greater than ₹0 with up to two decimals.')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && num <= 9999999999.99;
    }, 'Enter a valid amount greater than ₹0.'),
  dueDate: z
    .string()
    .trim()
    .regex(dateOnlyRegex, 'Choose a valid due date (YYYY-MM-DD).')
    .refine((val) => {
      const date = new Date(val + 'T00:00:00Z');
      return !isNaN(date.getTime());
    }, 'Choose a valid calendar date.'),
});

export type CreateLoanRequest = z.infer<typeof createLoanSchema>;

export const loanDtoSchema = z.object({
  id: z.string().uuid(),
  friendName: z.string(),
  amount: z.string(),
  currency: z.literal('INR'),
  dueDate: z.string(),
  status: loanStatusSchema,
  isOverdue: z.boolean(),
  repaidAt: z.string().nullable(),
  receiptUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type LoanDto = z.infer<typeof loanDtoSchema>;

export const loanFilterStatusSchema = z.enum(['all', 'outstanding', 'overdue', 'repaid']);
export type LoanFilterStatus = z.infer<typeof loanFilterStatusSchema>;

export const loanSortSchema = z.enum(['smart', 'dueDateAsc', 'newest']);
export type LoanSort = z.infer<typeof loanSortSchema>;

export const loanFilterQuerySchema = z.object({
  status: loanFilterStatusSchema.default('all').optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).default(20).optional(),
  sort: loanSortSchema.default('smart').optional(),
});

export type LoanFilterQuery = z.infer<typeof loanFilterQuerySchema>;

export const paginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export const loansListResponseSchema = z.object({
  data: z.array(loanDtoSchema),
  meta: paginationMetaSchema,
});

export type LoansListResponse = z.infer<typeof loansListResponseSchema>;

export const loanDetailResponseSchema = z.object({
  data: loanDtoSchema,
});

export type LoanDetailResponse = z.infer<typeof loanDetailResponseSchema>;
