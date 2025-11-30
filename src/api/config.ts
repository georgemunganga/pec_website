const FALLBACK_BASE_URL = 'https://api.pureessenceapothecary.com/v1';

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const API_CONFIG = {
  baseUrl: (import.meta.env.VITE_API_BASE_URL?.trim() || FALLBACK_BASE_URL).replace(/\/$/, ''),
  timeoutMs: parseNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
  defaultRetries: parseNumber(import.meta.env.VITE_API_RETRIES, 1),
  slowRequestMs: parseNumber(import.meta.env.VITE_API_SLOW_REQUEST_MS, 2000),
  logLevel: import.meta.env.DEV ? 'debug' : 'warn',
};

export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
