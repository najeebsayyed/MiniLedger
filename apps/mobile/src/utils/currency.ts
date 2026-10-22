export function formatInr(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '₹0';
  }
  const numericVal = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericVal)) {
    return '₹0';
  }

  // Format with en-IN locale
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: numericVal % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numericVal);
}

export const formatCurrency = formatInr;
