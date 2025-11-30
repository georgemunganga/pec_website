import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/types/product";
import { cartAPI, type ShippingDetailsPayload, type CartResponse } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/store/queryKeys";
import { calculateCartTotals } from "@/lib/format";

interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  couponCode?: string;
}

type ShippingDetails = ShippingDetailsPayload;

interface CartContextType {
  cart: CartItem[];
  summary: CartSummary;
  shippingDetails: ShippingDetails;
  isSyncing: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string | number) => Promise<void>;
  updateQuantity: (itemId: string | number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
  saveShippingDetails: (details: ShippingDetails) => Promise<void>;
  quoteCart: (details?: ShippingDetails) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_KEY = "pec_guest_cart";
const LOCAL_SHIPPING_KEY = "pec_shipping_details";

const DEFAULT_SUMMARY: CartSummary = {
  subtotal: 0,
  shipping: 0,
  tax: 0,
  discount: 0,
  total: 0,
  currency: "ZMW",
};

const DEFAULT_SHIPPING_DETAILS: ShippingDetails = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Zambia",
  deliveryOption: "standard",
};

const readGuestCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(LOCAL_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const persistGuestCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage failures
  }
};

const readStoredShipping = (): ShippingDetails => {
  try {
    const saved = localStorage.getItem(LOCAL_SHIPPING_KEY);
    return saved ? { ...DEFAULT_SHIPPING_DETAILS, ...JSON.parse(saved) } : DEFAULT_SHIPPING_DETAILS;
  } catch {
    return DEFAULT_SHIPPING_DETAILS;
  }
};

const persistShippingDetails = (details: ShippingDetails) => {
  try {
    localStorage.setItem(LOCAL_SHIPPING_KEY, JSON.stringify(details));
  } catch {
    // Ignore storage failures
  }
};

type CartItemPayload = CartItem & { id?: number };

const mapResponseItems = (items: CartItemPayload[] = []): CartItem[] =>
  items.map(item => ({
    id: item.id ?? item.product.id,
    product: item.product,
    quantity: item.quantity,
  }));

const cloneItems = (items: CartItem[]): CartItem[] => items.map(item => ({ ...item }));

const deriveSummary = (items: CartItem[], meta?: CartResponse): CartSummary => {
  const totals = calculateCartTotals(items, {
    shipping: typeof meta?.shipping === "number" ? meta.shipping : 0,
    taxRate: meta?.tax ? meta.tax / (meta.subtotal || 1) : 0,
    discount:
      typeof meta?.discountAmount === "number"
        ? meta.discountAmount
        : typeof meta?.discount === "number"
        ? meta.discount
        : 0,
  });

  return {
    subtotal: typeof meta?.subtotal === "number" ? meta.subtotal : totals.subtotal,
    shipping: totals.shipping,
    tax: typeof meta?.tax === "number" ? meta.tax : totals.tax,
    discount: totals.discount,
    total: typeof meta?.total === "number" ? meta.total : totals.total,
    currency: meta?.currency ?? DEFAULT_SUMMARY.currency,
    couponCode: meta?.couponCode,
  };
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => readGuestCart());
  const [summary, setSummary] = useState<CartSummary>(() => deriveSummary(readGuestCart()));
  const [shippingDetails, setShippingDetailsState] = useState<ShippingDetails>(() => readStoredShipping());
  const [isSyncing, setIsSyncing] = useState(false);
  const cartSnapshot = useRef<CartItem[]>(cart);
  const queryClient = useQueryClient();

  useEffect(() => {
    cartSnapshot.current = cart;
  }, [cart]);

  const applyCartState = (items: CartItem[], meta?: CartResponse) => {
    const derived = deriveSummary(items, meta);
    setSummary(derived);
    queryClient.setQueryData(queryKeys.cart(), { items, summary: derived });
  };

  const syncLocal = (updater: CartItem[] | ((prev: CartItem[]) => CartItem[]), meta?: CartResponse) => {
    setCart(prev => {
      const next = typeof updater === "function" ? (updater as (prev: CartItem[]) => CartItem[])(prev) : updater;
      persistGuestCart(next);
      applyCartState(next, meta);
      return next;
    });
  };

  const handleServerResponse = (response?: CartResponse) => {
    if (response?.items) {
      syncLocal(mapResponseItems(response.items), response);
    } else if (response) {
      applyCartState(cartSnapshot.current, response);
    }
  };

  const hydrateFromServer = async () => {
    if (!isAuthenticated) return;
    setIsSyncing(true);
    try {
      const response = await cartAPI.getCart();
      handleServerResponse(response);
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const mergeGuestCart = async () => {
    if (!isAuthenticated) return;
    const guestItems = readGuestCart();
    if (!guestItems.length) return;
    try {
      for (const item of guestItems) {
        await cartAPI.addToCart(Number(item.product.id), item.quantity);
      }
      persistGuestCart([]);
    } catch (error) {
      console.error("Failed to merge guest cart", error);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (isAuthenticated) {
        await mergeGuestCart();
        await hydrateFromServer();
      } else {
        const localCart = readGuestCart();
        setCart(localCart);
        setSummary(deriveSummary(localCart));
      }
    };
    void bootstrap();
  }, [isAuthenticated]);

  const saveShippingDetails = async (details: ShippingDetails) => {
    setShippingDetailsState(details);
    persistShippingDetails(details);
    if (!isAuthenticated) return;
    try {
      const response = await cartAPI.saveShippingDetails(details);
      handleServerResponse(response);
    } catch (error) {
      console.error("Failed to save shipping details", error);
    }
  };

  const quoteCart = async (details?: ShippingDetails) => {
    if (!isAuthenticated) return;
    const payload = details ?? shippingDetails;
    if (!payload.fullName || !payload.line1 || !payload.city) return;
    setIsSyncing(true);
    try {
      const response = await cartAPI.quoteCart({ shipping: payload, deliveryOption: payload.deliveryOption });
      handleServerResponse(response);
    } catch (error) {
      console.error("Failed to quote cart", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!product.id || quantity <= 0) return;

    if (!isAuthenticated) {
      syncLocal(prev => {
        const existing = prev.find(item => String(item.product.id) === String(product.id));
        if (existing) {
          return prev.map(item =>
            String(item.product.id) === String(product.id) ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        return [...prev, { product, quantity }];
      });
      return;
    }

    const fallback = cloneItems(cartSnapshot.current);
    syncLocal(prev => {
      const existing = prev.find(item => String(item.product.id) === String(product.id));
      if (existing) {
        return prev.map(item =>
          String(item.product.id) === String(product.id) ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...prev, { product, quantity }];
    });

    setIsSyncing(true);
    try {
      const response = await cartAPI.addToCart(Number(product.id), quantity);
      handleServerResponse(response);
    } catch (error) {
      console.error("Failed to add to cart", error);
      syncLocal(cloneItems(fallback));
    } finally {
      setIsSyncing(false);
    }
  };

  const removeFromCart = async (itemId: string | number) => {
    if (!isAuthenticated) {
      syncLocal(prev => prev.filter(item => String(item.product.id) !== String(itemId)));
      return;
    }

    const fallback = cloneItems(cartSnapshot.current);
    syncLocal(prev => prev.filter(item => String(item.product.id) !== String(itemId)));

    setIsSyncing(true);
    try {
      const serverItemId =
        cartSnapshot.current.find(item => String(item.product.id) === String(itemId))?.id ?? Number(itemId);
      const response = await cartAPI.removeFromCart(Number(serverItemId));
      handleServerResponse(response);
    } catch (error) {
      console.error("Failed to remove item from cart", error);
      syncLocal(cloneItems(fallback));
    } finally {
      setIsSyncing(false);
    }
  };

  const updateQuantity = async (itemId: string | number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    if (!isAuthenticated) {
      syncLocal(prev =>
        prev.map(item => (String(item.product.id) === String(itemId) ? { ...item, quantity } : item)),
      );
      return;
    }

    const fallback = cloneItems(cartSnapshot.current);
    syncLocal(prev =>
      prev.map(item => (String(item.product.id) === String(itemId) ? { ...item, quantity } : item)),
    );

    setIsSyncing(true);
    try {
      const serverItemId =
        cartSnapshot.current.find(item => String(item.product.id) === String(itemId))?.id ?? Number(itemId);
      const response = await cartAPI.updateCartItem(Number(serverItemId), quantity);
      handleServerResponse(response);
    } catch (error) {
      console.error("Failed to update cart item", error);
      syncLocal(cloneItems(fallback));
    } finally {
      setIsSyncing(false);
    }
  };

  const clearCart = async () => {
    syncLocal([]);
    if (!isAuthenticated) return;

    setIsSyncing(true);
    try {
      const response = await cartAPI.clearCart();
      handleServerResponse(response);
    } catch (error) {
      console.error("Failed to clear cart", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getCartTotal = () => summary.total;
  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      const localCart = readGuestCart();
      setCart(localCart);
      setSummary(deriveSummary(localCart));
      return;
    }
    await hydrateFromServer();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        summary,
        shippingDetails,
        isSyncing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        getCartTotal,
        getCartCount,
        saveShippingDetails,
        quoteCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
