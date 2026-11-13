/**
 * Utility functions for Indian Rupee currency and date formatting.
 * Strictly adheres to Indian numbering system (lakhs, crores).
 */

/**
 * Format number into Indian Rupees (₹ INR)
 * e.g. 150000 -> ₹1,50,000
 *      25000 -> ₹25,000
 *      550000 -> ₹5,50,000
 *      1000000 -> ₹10,00,000
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2
});

/**
 * Format number into Indian Rupees (₹ INR) using Intl.NumberFormat
 * e.g. 1000 -> ₹1,000.00
 *      25000 -> ₹25,000.00
 *      150000 -> ₹1,50,000.00
 *      1000000 -> ₹10,00,000.00
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return inrFormatter.format(0);
  }
  return inrFormatter.format(Number(amount));
}

/**
 * Format ISO date string into readable Indian standard format
 */
export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return String(isoString);
  }
}

/**
 * Mask account number for secure display
 * e.g. "SB5012349876" -> "SB•••••9876"
 */
export function maskAccountNumber(acc) {
  if (!acc || typeof acc !== 'string') return 'N/A';
  if (acc.length <= 6) return acc;
  const prefix = acc.substring(0, 2);
  const suffix = acc.substring(acc.length - 4);
  return `${prefix}••••${suffix}`;
}
