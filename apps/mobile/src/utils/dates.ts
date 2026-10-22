export function formatFriendlyDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00Z');
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDisplayDate(dateString: string): string {
  return formatFullDate(dateString);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatRelativeDueDate(
  dueDateString: string,
  status: 'ACTIVE' | 'REPAID',
  isOverdue = false
): string {
  if (status === 'REPAID') {
    return 'Settled in full';
  }

  const todayStr = getTodayDateString();
  if (dueDateString === todayStr) {
    return 'Due today';
  }

  if (isOverdue) {
    return `Overdue since ${formatFriendlyDate(dueDateString)}`;
  }

  return `Due on ${formatFriendlyDate(dueDateString)}`;
}
