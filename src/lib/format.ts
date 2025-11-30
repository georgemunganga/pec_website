import type { CartItem } from "@/types/product";

interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatCurrency(
  amount: number,
  {
    currency = "ZMW",
    locale = "en-ZM",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  }: FormatCurrencyOptions = {},
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

interface FormatDateOptions {
  locale?: string;
  dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
  timeStyle?: Intl.DateTimeFormatOptions["timeStyle"];
}

export function formatDate(value: Date | string | number, options: FormatDateOptions = {}) {
  const date = value instanceof Date ? value : new Date(value);
  const formatter = new Intl.DateTimeFormat(options.locale ?? "en-ZM", {
    dateStyle: options.dateStyle ?? "medium",
    timeStyle: options.timeStyle,
  });
  return formatter.format(date);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CartTotalsOptions {
  shipping?: number;
  taxRate?: number;
  discount?: number;
}

export function calculateCartTotals(
  items: CartItem[],
  { shipping = 0, taxRate = 0, discount = 0 }: CartTotalsOptions = {},
) {
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const tax = taxRate > 0 ? subtotal * taxRate : 0;
  const computedDiscount = Math.max(discount, 0);
  const total = Math.max(subtotal - computedDiscount + shipping + tax, 0);

  return {
    subtotal,
    shipping,
    tax,
    discount: computedDiscount,
    total,
  };
}
