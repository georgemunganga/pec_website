/**
 * Format price in Zambian Kwacha
 */
export function formatPrice(amount: number): string {
  return `K${amount.toFixed(2)}`;
}

/**
 * Currency symbol for Zambian Kwacha
 */
export const CURRENCY_SYMBOL = 'K';

/**
 * Currency code
 */
export const CURRENCY_CODE = 'ZMW';
