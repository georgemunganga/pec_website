const TAGS_REGEX = /<[^>]*>?/g;
const SCRIPT_REGEX = /javascript:/gi;

export const sanitizeString = (value: string) => {
  if (typeof value !== "string") return value;
  return value.replace(TAGS_REGEX, "").replace(SCRIPT_REGEX, "").trim();
};

export const sanitizePayload = <T>(payload: T): T => {
  if (payload === null || payload === undefined) {
    return payload;
  }

  if (typeof payload === "string") {
    return sanitizeString(payload) as T;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (typeof payload === "object") {
    const clone: Record<string, unknown> = {};
    Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
      clone[key] = sanitizePayload(value);
    });
    return clone as T;
  }

  return payload;
};

export const json = (payload: unknown) => JSON.stringify(sanitizePayload(payload));

export const isSafeRedirect = (url: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
};
