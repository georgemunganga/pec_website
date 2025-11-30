import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/product';
import { productsAPI, ordersAPI, userAPI } from '@/services/api';
import { queryKeys } from './queryKeys';

const extractProducts = (payload: any): Product[] => {
  if (!payload) return [];
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const normalizeOrders = (payload: any) => {
  const source =
    payload?.data?.orders ||
    payload?.orders ||
    payload?.data ||
    payload?.items ||
    (Array.isArray(payload) ? payload : []);

  if (!Array.isArray(source)) return [];

  return source.map((order) => ({
    id: String(order.id ?? order.orderNumber ?? ''),
    status: order.status || 'pending',
    total: order.total ?? order.summary?.total ?? 0,
    itemCount: order.itemCount ?? order.items?.length ?? 0,
    createdAt: order.createdAt || order.date || order.placedAt,
    estimatedDelivery: order.estimatedDelivery,
    trackingNumber: order.tracking?.number || order.trackingNumber,
    items: order.items || [],
  }));
};

const normalizeOrderDetail = (payload: any) => {
  const data = payload?.data || payload;
  if (!data) return null;
  return {
    id: data.id || data.orderNumber || '',
    status: data.status || 'pending',
    items: (data.items || []).map((item: any) => ({
      productId: item.productId ?? item.id,
      name: item.name || 'Product',
      quantity: item.quantity ?? 1,
      price: item.price ?? item.total ?? 0,
      image: item.image || item.product?.images?.[0],
    })),
    shippingAddress: data.shippingAddress || {},
    summary: {
      subtotal: data.summary?.subtotal ?? data.subtotal ?? 0,
      shipping: data.summary?.shipping ?? data.shipping ?? 0,
      tax: data.summary?.tax ?? data.tax ?? 0,
      discount: data.summary?.discount ?? data.discount ?? 0,
      total: data.summary?.total ?? data.total ?? 0,
    },
    trackingNumber: data.tracking?.number || data.trackingNumber,
    createdAt: data.createdAt || data.date,
  };
};

export const useFeaturedProductsQuery = () => {
  return useQuery({
    queryKey: queryKeys.products({ segment: 'featured', limit: 4, sort: 'popular' }),
    queryFn: () => productsAPI.getAll({ limit: 4, sort: 'popular' }),
    select: extractProducts,
  });
};

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: async () => {
      const profile = await userAPI.getProfile();
      return profile?.data || profile;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrdersQuery = (params?: { status?: string }) => {
  const queryParams = { page: 1, status: params?.status };
  return useQuery({
    queryKey: queryKeys.orders(queryParams),
    queryFn: () => ordersAPI.getOrders(queryParams.page, queryParams.status),
    select: normalizeOrders,
  });
};

export const useOrderDetailQuery = (orderId?: string) => {
  return useQuery({
    queryKey: orderId ? queryKeys.order(orderId) : ['order'],
    queryFn: () => ordersAPI.getOrderDetails(orderId as string),
    select: normalizeOrderDetail,
    enabled: !!orderId,
  });
};
