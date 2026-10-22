/**
 * Normalizes an amount into a two-decimal formatted string representation (e.g. "1250.00").
 */
export function toDecimalString(val: string | number | null | undefined): string {
  if (val === null || val === undefined) {
    return '0.00';
  }
  const str = String(val).trim();
  if (str === '') {
    return '0.00';
  }

  // Parse integer and fraction parts safely
  const parts = str.split('.');
  const integerPart = parts[0] || '0';
  const fractionPart = (parts[1] || '').padEnd(2, '0').slice(0, 2);

  return `${integerPart}.${fractionPart}`;
}
