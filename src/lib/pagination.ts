export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export const buildQueryString = (params: Record<string, unknown>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.append(key, String(value));
  });
  return query.toString();
};

export const applyQueryParams = (url: string, params: Record<string, unknown>) => {
  const queryString = buildQueryString(params);
  if (!queryString) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
};

export const getPaginationParams = (searchParams: URLSearchParams): PaginationParams => {
  const page = Number(searchParams.get("page")) || undefined;
  const limit = Number(searchParams.get("limit")) || undefined;
  const filters: PaginationParams = {};
  searchParams.forEach((value, key) => {
    if (key === "page" || key === "limit") return;
    filters[key] = value;
  });
  return { page, limit, ...filters };
};

export const buildPaginationMeta = (meta?: { page?: number; limit?: number; total?: number }) => {
  if (!meta) return undefined;
  const page = meta.page ?? 1;
  const limit = meta.limit ?? 0;
  const total = meta.total ?? 0;
  return {
    page,
    limit,
    total,
    totalPages: limit > 0 ? Math.ceil(total / limit) : undefined,
  };
};
