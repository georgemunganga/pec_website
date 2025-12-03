const FALLBACK_BASE_URL = 'https://api.pureessenceapothecary.com/v1';

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveBaseUrl = () => {
  const devUrl = import.meta.env.VITE_API_BASE_URL_LOCAL?.trim();
  const prodUrl = import.meta.env.VITE_API_BASE_URL_PROD?.trim();
  const legacyUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const selected = import.meta.env.DEV ? devUrl ?? legacyUrl : prodUrl ?? legacyUrl;
  return (selected || FALLBACK_BASE_URL).replace(/\/$/, '');
};

export const API_CONFIG = {
  baseUrl: resolveBaseUrl(),
  timeoutMs: parseNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
  defaultRetries: parseNumber(import.meta.env.VITE_API_RETRIES, 1),
  slowRequestMs: parseNumber(import.meta.env.VITE_API_SLOW_REQUEST_MS, 2000),
  logLevel: import.meta.env.DEV ? 'debug' : 'warn',
};

export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
