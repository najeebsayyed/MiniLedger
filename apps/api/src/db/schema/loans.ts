import { pgTable, uuid, varchar, numeric, date, timestamp, text, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const loans = pgTable(
  'loans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    friendName: varchar('friend_name', { length: 80 }).notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    dueDate: date('due_date').notNull(),
    status: text('status', { enum: ['ACTIVE', 'REPAID'] }).notNull().default('ACTIVE'),
    repaidAt: timestamp('repaid_at', { withTimezone: true }),
    receiptUrl: text('receipt_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('loans_owner_status_due_date_idx').on(table.ownerId, table.status, table.dueDate),
    index('loans_owner_created_idx').on(table.ownerId, table.createdAt),
    index('loans_owner_friend_name_idx').on(table.ownerId, table.friendName),
  ]
);

export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
