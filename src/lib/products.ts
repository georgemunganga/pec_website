import type { Product } from "@/types/product";

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

  const primaryImage =
    payload.main_image ||
    payload.image ||
    imagesArray[0] ||
    "";

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
    images: imagesArray,
    description: payload.description ?? "",
    features: payload.features,
    inStock,
    badge: payload.badge,
    brand: brandName,
    skinType: Array.isArray(payload.skinType) ? payload.skinType : undefined,
    stock: stockValue,
  };
};
