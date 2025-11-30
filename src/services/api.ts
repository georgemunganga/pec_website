/**
 * API Service Layer for Pure Essence Apothecary
 *
 * All endpoint helpers delegate to the shared request client located in src/api.
 * See API_DOCS.md for contract details.
 */

import type { Product } from "@/types/product";
import { applyQueryParams } from "@/lib/pagination";
import { API_CONFIG } from "../api/config";
import { request, type ApiRequestOptions } from "../api/client";
import { json } from "@/lib/security";

export interface CartItemPayload {
  id?: number;
  product: Product;
  quantity: number;
}

export interface CartResponse {
  items?: CartItemPayload[];
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  discount?: number;
  discountAmount?: number;
  discountPercent?: number;
  currency?: string;
  couponCode?: string;
}

export interface ShippingDetailsPayload {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  deliveryOption?: string;
}

const getAuthToken = () => localStorage.getItem("auth_token");

const apiCall = <T>(endpoint: string, options: ApiRequestOptions = {}) => {
  return request<T>(endpoint, options);
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: json(userData),
    });
    
    // Store token
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: json(credentials),
    });
    
    // Store token
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },

  requestOTP: async (identifier: string, method: 'email' | 'phone') => {
    return apiCall('/auth/request-otp', {
      method: 'POST',
      body: json({ identifier, method }),
    });
  },

  verifyOTP: async (identifier: string, otp: string) => {
    const data = await apiCall('/auth/verify-otp', {
      method: 'POST',
      body: json({ identifier, otp }),
    });
    
    // Store token
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    return data;
  },

  forgotPassword: async (email: string) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: json({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: json({ token, password }),
    });
  },
};

// ============================================================================
// PRODUCTS
// ============================================================================

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  brands?: string[];
  skinType?: string;
  skinTypes?: string[];
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
}

export interface ProductFilterFacets {
  categories?: string[];
  brands?: string[];
  skinTypes?: string[];
  tags?: string[];
}

export const productsAPI = {
  getAll: async (filters: ProductFilters = {}) => {
    const query: Record<string, string | number> = {};

    if (filters.page) query.page = filters.page;
    if (filters.limit) query.limit = filters.limit;
    if (filters.search) query.search = filters.search;
    if (filters.minPrice !== undefined) query.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) query.maxPrice = filters.maxPrice;
    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brand = filters.brand;
    if (filters.skinType) query.skinType = filters.skinType;
    if (filters.sort) query.sort = filters.sort;
    if (filters.categories?.length) query.categories = filters.categories.join(',');
    if (filters.brands?.length) query.brands = filters.brands.join(',');
    if (filters.skinTypes?.length) query.skinTypes = filters.skinTypes.join(',');

    const endpoint = applyQueryParams("/products", query);
    return apiCall<{ items?: Product[]; products?: Product[]; data?: Product[]; meta?: { total?: number } }>(endpoint);
  },

  getById: async (id: number) => {
    return apiCall(`/products/${id}`);
  },

  getBySlug: async (slug: string) => {
    return apiCall(`/products/slug/${slug}`);
  },

  getRelated: async (id: number, limit: number = 4) => {
    return apiCall(applyQueryParams(`/products/${id}/related`, { limit }));
  },

  search: async (query: string, limit: number = 10) => {
    return apiCall(applyQueryParams("/search", { q: query, limit }));
  },

  getReviews: async (productId: string) => {
    return apiCall(`/products/${productId}/reviews`);
  },

  addReview: async (productId: string, review: { rating: number; comment: string }) => {
    return apiCall(`/products/${productId}/reviews`, {
      method: 'POST',
      body: json(review),
    });
  },

  updateReview: async (productId: string, reviewId: number, review: { rating: number; comment: string }) => {
    return apiCall(`/products/${productId}/reviews/${reviewId}`, {
      method: 'PUT',
      body: json(review),
    });
  },

  deleteReview: async (productId: string, reviewId: number) => {
    return apiCall(`/products/${productId}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  markReviewHelpful: async (reviewId: number) => {
    return apiCall(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  },

  getFilters: async () => {
    return apiCall<ProductFilterFacets>('/products/filters');
  },
};

// ============================================================================
// REVIEWS
// ============================================================================

export const reviewsAPI = {
  getProductReviews: async (productId: number, page: number = 1, rating?: number) => {
    return apiCall(
      applyQueryParams(`/products/${productId}/reviews`, {
        page,
        limit: 10,
        rating,
      }),
    );
  },

  submitReview: async (productId: number, review: {
    rating: number;
    title: string;
    comment: string;
  }) => {
    return apiCall(`/products/${productId}/reviews`, {
      method: 'POST',
      body: json(review),
    });
  },

  markHelpful: async (reviewId: number) => {
    return apiCall(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  },
};

// ============================================================================
// WISHLIST
// ============================================================================

export const wishlistAPI = {
  getWishlist: async () => {
    return apiCall('/wishlist');
  },

  addToWishlist: async (productId: number) => {
    return apiCall('/wishlist', {
      method: 'POST',
      body: json({ productId }),
    });
  },

  removeFromWishlist: async (productId: number) => {
    return apiCall(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CART
// ============================================================================

export const cartAPI = {
  getCart: async () => {
    return apiCall<CartResponse>('/cart');
  },

  quoteCart: async (payload: { shipping: ShippingDetailsPayload; deliveryOption?: string }) => {
    return apiCall<CartResponse>('/cart/quote', {
      method: 'POST',
      body: json(payload),
    });
  },

  saveShippingDetails: async (payload: ShippingDetailsPayload) => {
    return apiCall<CartResponse>('/cart/shipping', {
      method: 'POST',
      body: json(payload),
    });
  },

  addToCart: async (productId: number, quantity: number = 1, variant?: string) => {
    return apiCall<CartResponse>('/cart', {
      method: 'POST',
      body: json({ productId, quantity, variant }),
    });
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    return apiCall<CartResponse>(`/cart/${itemId}`, {
      method: 'PUT',
      body: json({ quantity }),
    });
  },

  removeFromCart: async (itemId: number) => {
    return apiCall<CartResponse>(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  },

  applyCoupon: async (code: string) => {
    return apiCall<CartResponse>('/cart/coupon', {
      method: 'POST',
      body: json({ code }),
    });
  },

  removeCoupon: async () => {
    return apiCall<CartResponse>('/cart/coupon', {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return apiCall<CartResponse>('/cart/clear', {
      method: 'POST',
    });
  },
};

// ============================================================================
// ORDERS
// ============================================================================

export const ordersAPI = {
  createOrder: async (orderData: {
    paymentMethod: string;
    shippingAddressId?: number;
    billingAddressId?: number;
    couponCode?: string;
    giftMessage?: string;
    giftWrap?: boolean;
    contact?: { name: string; email: string; phone: string };
    shippingDetails?: ShippingDetailsPayload;
    deliveryOption?: string;
    paymentToken?: string;
    notes?: string;
  }) => {
    return apiCall('/orders', {
      method: 'POST',
      body: json(orderData),
    });
  },

  getOrders: async (page: number = 1, status?: string) => {
    return apiCall(
      applyQueryParams("/orders", {
        page,
        limit: 10,
        status,
      }),
    );
  },

  getOrderDetails: async (orderId: string) => {
    return apiCall(`/orders/${orderId}`);
  },

  trackOrder: async (orderId: string) => {
    return apiCall(`/orders/${orderId}/tracking`);
  },

  downloadInvoice: async (orderId: string) => {
    const token = getAuthToken();
    window.open(`${API_CONFIG.baseUrl}/orders/${orderId}/invoice?token=${token}`, '_blank');
  },

  cancelOrder: async (orderId: string, reason: string) => {
    return apiCall(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: json({ reason }),
    });
  },

  reorder: async (orderId: string) => {
    return apiCall(`/orders/${orderId}/reorder`, {
      method: 'POST',
    });
  },
};

// ============================================================================
// ADDRESSES
// ============================================================================

export const addressesAPI = {
  getAddresses: async () => {
    return apiCall('/addresses');
  },

  addAddress: async (address: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    phone: string;
    isDefault?: boolean;
  }) => {
    return apiCall('/addresses', {
      method: 'POST',
      body: json(address),
    });
  },

  updateAddress: async (id: number, address: any) => {
    return apiCall(`/addresses/${id}`, {
      method: 'PUT',
      body: json(address),
    });
  },

  deleteAddress: async (id: number) => {
    return apiCall(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  setDefaultAddress: async (id: number) => {
    return apiCall(`/addresses/${id}/set-default`, {
      method: 'POST',
    });
  },
};

// ============================================================================
// USER PROFILE
// ============================================================================

export const profileAPI = {
  updateProfile: async (data: { name?: string; phone?: string }) => {
    return apiCall('/profile', {
      method: 'PUT',
      body: json(data),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall('/profile/change-password', {
      method: 'POST',
      body: json({ currentPassword, newPassword }),
    });
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = getAuthToken();
    const response = await fetch(`${API_CONFIG.baseUrl}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    return data.data;
  },
};

// ============================================================================
// RETURNS & REFUNDS
// ============================================================================

export const returnsAPI = {
  getReturns: async () => {
    return apiCall('/returns');
  },

  createReturn: async (returnData: {
    orderId: string;
    items: Array<{
      productId: number;
      quantity: number;
      reason: string;
    }>;
    description: string;
    images?: string[];
  }) => {
    return apiCall('/returns', {
      method: 'POST',
      body: json(returnData),
    });
  },
};

// ============================================================================
// SUPPORT
// ============================================================================

export const supportAPI = {
  getTickets: async () => {
    return apiCall('/support/tickets');
  },

  createTicket: async (ticket: {
    subject: string;
    category: string;
    priority: string;
    message: string;
    orderId?: string;
  }) => {
    return apiCall('/support/tickets', {
      method: 'POST',
      body: json(ticket),
    });
  },

  getTicketMessages: async (ticketId: number) => {
    return apiCall(`/support/tickets/${ticketId}/messages`);
  },

  replyToTicket: async (ticketId: number, message: string) => {
    return apiCall(`/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: json({ message }),
    });
  },
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notificationsAPI = {
  getNotifications: async (page: number = 1, unreadOnly: boolean = false) => {
    return apiCall(
      applyQueryParams("/notifications", {
        page,
        limit: 20,
        unreadOnly,
      }),
    );
  },

  markAsRead: async (notificationId: number) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  markAllAsRead: async () => {
    return apiCall('/notifications/read-all', {
      method: 'POST',
    });
  },
};

// ============================================================================
// RECENTLY VIEWED
// ============================================================================

export const recentlyViewedAPI = {
  getRecentlyViewed: async () => {
    return apiCall('/recently-viewed');
  },

  trackView: async (productId: number) => {
    return apiCall('/recently-viewed', {
      method: 'POST',
      body: json({ productId }),
    });
  },
};

// ============================================================================
// PRODUCT COMPARISON
// ============================================================================

export const comparisonAPI = {
  getComparison: async () => {
    return apiCall('/comparison');
  },

  addToComparison: async (productId: number) => {
    return apiCall('/comparison', {
      method: 'POST',
      body: json({ productId }),
    });
  },

  removeFromComparison: async (productId: number) => {
    return apiCall(`/comparison/${productId}`, {
      method: 'DELETE',
    });
  },

  clearComparison: async () => {
    return apiCall('/comparison/clear', {
      method: 'POST',
    });
  },
};

// ============================================================================
// LEGACY COMPATIBILITY (for existing code)
// ============================================================================

export const userAPI = {
  getProfile: () => authAPI.getCurrentUser(),
  updateProfile: (data: any) => profileAPI.updateProfile(data),
};
