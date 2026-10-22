import { env } from '../config/env.js';

/**
 * Returns the current calendar date in YYYY-MM-DD format for the configured business timezone.
 */
export function getBusinessDate(timezone: string = env.APP_TIMEZONE): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Determines whether an active loan is overdue.
 * Rule: status must be ACTIVE, and dueDate < businessDate.
 * If status is REPAID, or dueDate >= businessDate, it is NOT overdue.
 */
export function isLoanOverdue(
  dueDate: string,
  status: string,
  businessDate: string = getBusinessDate()
): boolean {
  if (status !== 'ACTIVE') {
    return false;
  }
  // YYYY-MM-DD lexicographical comparison is strictly equivalent to calendar date comparison
  return dueDate < businessDate;
}
