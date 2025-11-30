import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '@/types/product';
import { wishlistAPI } from '@/services/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/store/queryKeys';

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  loadWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      // Load from localStorage first
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setWishlist(JSON.parse(saved));
        queryClient.setQueryData(queryKeys.wishlist(), JSON.parse(saved));
      }

      // Try to sync with API in background (don't block UI)
      try {
        const data = await wishlistAPI.getWishlist();
        if (data.items && Array.isArray(data.items)) {
          setWishlist(data.items);
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(data.items));
          queryClient.setQueryData(queryKeys.wishlist(), data.items);
        }
      } catch (apiError) {
        // Silently fail - API not available yet, use localStorage
        console.log('Wishlist API not available, using local storage');
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    const inWishlist = isInWishlist(product.id);
    const newWishlist = inWishlist
      ? wishlist.filter(item => item.id !== product.id)
      : [...wishlist, product];

    // Update state and localStorage immediately
    setWishlist(newWishlist);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist));
    queryClient.setQueryData(queryKeys.wishlist(), newWishlist);

    // Show toast
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');

    // Try to sync with API in background
    try {
      if (inWishlist) {
        await wishlistAPI.removeFromWishlist(Number(product.id));
      } else {
        await wishlistAPI.addToWishlist(Number(product.id));
      }
    } catch (error) {
      // Silently fail - API not available yet
      console.log('Wishlist API sync failed, changes saved locally');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
