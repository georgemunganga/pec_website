import { API_CONFIG, DEFAULT_HEADERS } from "./config";
import { emitSlowNetworkEvent } from "@/lib/network-events";
import { captureError, reportApiMetric } from "@/monitoring";

type QueryParamValue = string | number | boolean | undefined | null;

type QueryParams = Record<string, QueryParamValue>;

export interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
  retry?: number;
  query?: QueryParams;
  logLabel?: string;
}

export interface ApiErrorPayload {
  code?: string;
  message: string;
  details?: unknown;
  status: number;
}

export class ApiError extends Error {
  public readonly code?: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.status = payload.status;
    this.details = payload.details;
  }
}

const getAuthToken = () => localStorage.getItem("auth_token");

const buildUrl = (endpoint: string, query?: QueryParams) => {
  let target = endpoint;

  const isAbsolute = /^https?:\/\//i.test(endpoint);
  if (!isAbsolute) {
    const base = API_CONFIG.baseUrl;
    if (base) {
      const needsSlash = !endpoint.startsWith("/") && !base.endsWith("/");
      target = `${base}${needsSlash ? "/" : ""}${endpoint}`;
    } else if (typeof window !== "undefined") {
      const prefix = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      target = `${window.location.origin}${prefix}`;
    } else {
      throw new Error(`Cannot construct request URL for endpoint "${endpoint}"`);
    }
  }

  const url = new URL(target);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, String(value));
    });
  }
  return url;
};

const withTimeout = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
};

const LOG_LEVELS = {
  debug: 0,
  warn: 1,
  error: 2,
} as const;

const log = (level: "debug" | "warn" | "error", ...args: unknown[]) => {
  const current = LOG_LEVELS[API_CONFIG.logLevel as keyof typeof LOG_LEVELS] ?? 1;
  if (LOG_LEVELS[level] >= current) {
    // eslint-disable-next-line no-console
    console[level]("[api]", ...args);
  }
};

const parseJson = (text: string) => {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export async function request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = true, retry = API_CONFIG.defaultRetries, query, logLabel, ...init } = options;
  const url = buildUrl(endpoint, query);
  const headers = new Headers(DEFAULT_HEADERS);
  const method = (init.method || "GET").toUpperCase();

  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }

  if (auth) {
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const { signal, clear } = withTimeout(API_CONFIG.timeoutMs);

  const start = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();

  try {
    log("debug", logLabel ?? `${method} ${url}`);
    const response = await fetch(url, { ...init, headers, signal });
    const duration = (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()) - start;
    const text = await response.text();
    const parsed = parseJson(text);

    if (duration > API_CONFIG.slowRequestMs) {
      emitSlowNetworkEvent({ url: url.pathname, duration, method, status: response.status });
    }

    reportApiMetric({
      url: url.pathname,
      method,
      duration,
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorPayload: ApiErrorPayload = {
        status: response.status,
        message: parsed?.error?.message || parsed?.message || response.statusText,
        code: parsed?.error?.code || parsed?.code,
        details: parsed?.error?.details || parsed?.details,
      };
      log("warn", "API error", url.toString(), errorPayload);
      const apiError = new ApiError(errorPayload);
      if (response.status >= 500) {
        captureError(apiError, { url: url.pathname, method });
      }
      throw apiError;
    }

    const payload = parsed?.data ?? parsed ?? ({} as T);
    return payload as T;
  } catch (error) {
    const duration = (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()) - start;
    reportApiMetric({
      url: url.pathname,
      method,
      duration,
      status: 0,
      ok: false,
    });
    if (error instanceof Error) {
      captureError(error, { url: url.pathname, method });
    }
    if (error instanceof DOMException && error.name === "AbortError" && retry > 0) {
      log("warn", "Request timed out, retrying", url.toString());
      return request<T>(endpoint, { ...options, retry: retry - 1 });
    }
    throw error;
  } finally {
    clear();
  }
}
