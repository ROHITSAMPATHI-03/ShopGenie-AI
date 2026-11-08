/**
 * Currency and unit formatters for ShopGenie AI
 */

export function formatInr(rupees: number): string {
  if (typeof rupees !== 'number' || isNaN(rupees)) return '₹0';
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`;
}

export function formatInrFromPaise(paise: number): string {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0';
  return formatInr(paise / 100);
}

export function formatUsd(centsOrString: number | string): string {
  if (typeof centsOrString === 'string') {
    const num = parseFloat(centsOrString);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  }
  if (typeof centsOrString === 'number') {
    return `$${(centsOrString / 100).toFixed(2)}`;
  }
  return '$0.00';
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

