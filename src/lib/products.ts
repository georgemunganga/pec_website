import type { Product } from "@/types/product";
import { API_CONFIG } from "@/api/config";

const resolveApiOrigin = () => {
  try {
    const url = new URL(API_CONFIG.baseUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
};

const API_ORIGIN = resolveApiOrigin();

const normalizeImageUrl = (value?: string | null): string => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const isAbsolute = /^https?:\/\//i.test(trimmed);

  if (isAbsolute) {
    let parsed: URL | null = null;
    try {
      parsed = new URL(trimmed);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[normalizeImageUrl] Failed to parse image URL:", trimmed, error);
      }
      return trimmed;
    }

    if (
      parsed &&
      API_ORIGIN &&
      (parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "https://admin.pureessenceapothecary.com/" ||
        parsed.hostname === "::1")
    ) {
      if (import.meta.env.DEV) {
        console.info("[normalizeImageUrl] Rewriting local image URL:", {
          original: trimmed,
          resolved: `${API_ORIGIN}${parsed.pathname}${parsed.search ?? ""}`,
        });
      }
      return `${API_ORIGIN}${parsed.pathname}${parsed.search ?? ""}`;
    }
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    try {
      const origin = new URL(API_ORIGIN || "https://admin.pureessenceapothecary.com");
      return `${origin.protocol}${trimmed}`;
    } catch {
      return `https:${trimmed}`;
    }
  }

  if (API_ORIGIN) {
    return `${API_ORIGIN}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  }

  return trimmed;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const mapApiProduct = (payload: any): Product => {
  if (!payload || typeof payload !== "object") {
    return {
      id: "",
      name: "Product",
      category: "Unknown",
      price: 0,
      rating: 0,
      reviewCount: 0,
      image: "",
      description: "",
      inStock: true,
    };
  }

  const categoryName =
    typeof payload.category === "string"
      ? payload.category
      : payload.category?.name ?? "Product";

  const brandName =
    typeof payload.brand === "string"
      ? payload.brand
      : payload.brand?.name;

  const priceObject = payload.price;
  const priceValue =
    toNumber(priceObject?.sale_price) ??
    toNumber(priceObject?.amount) ??
    toNumber(priceObject?.price) ??
    toNumber(payload.sale_price) ??
    toNumber(payload.price) ??
    0;

  const originalValue =
    toNumber(priceObject?.original_price) ??
    toNumber(priceObject?.cost) ??
    toNumber(payload.original_price) ??
    undefined;

  const stockValue =
    typeof payload.stock === "number"
      ? payload.stock
      : typeof payload.stock?.available === "number"
      ? payload.stock.available
      : undefined;

  const inStock =
    typeof payload.stock?.in_stock === "boolean"
      ? payload.stock.in_stock
      : stockValue !== undefined
      ? stockValue > 0
      : true;

  const imagesArray = Array.isArray(payload.images)
    ? payload.images
    : Array.isArray(payload.gallery_images)
    ? payload.gallery_images.map((img: any) => img?.url).filter(Boolean)
    : [];

  const normalizedImages = imagesArray.map((img: string) => normalizeImageUrl(img));

  const primaryImage = normalizeImageUrl(
    payload.main_image || payload.image || normalizedImages[0] || ""
  );

  const ratingAverage =
    toNumber(payload.rating?.average) ??
    toNumber(payload.rating) ??
    0;

  const ratingCount =
    toNumber(payload.rating?.count) ??
    toNumber(payload.reviewCount) ??
    0;

  return {
    id: payload.id ?? payload.code ?? payload.slug ?? "",
    name: payload.name ?? "Product",
    category: categoryName,
    price: priceValue,
    originalPrice: originalValue,
    rating: ratingAverage || 0,
    reviewCount: ratingCount || 0,
    image: primaryImage,
    images: normalizedImages,
    description: payload.description ?? "",
    features: payload.features,
    inStock,
    badge: payload.badge,
    brand: brandName,
    skinType: Array.isArray(payload.skinType) ? payload.skinType : undefined,
    stock: stockValue,
  };
};
