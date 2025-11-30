type KeyArg = Record<string, unknown> | undefined;

export const queryKeys = {
  products: (params?: KeyArg) => ['products', params] as const,
  product: (id: string | number) => ['product', id] as const,
  categories: () => ['categories'] as const,
  cart: () => ['cart'] as const,
  user: () => ['user'] as const,
  orders: (params?: KeyArg) => ['orders', params] as const,
  order: (id: string | number) => ['order', id] as const,
  wishlist: () => ['wishlist'] as const,
  addresses: () => ['addresses'] as const,
};
