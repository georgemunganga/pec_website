import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '@/types/product';
import { recentlyViewedAPI } from '@/services/api';

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const MAX_RECENTLY_VIEWED = 10;
const STORAGE_KEY = 'pec_recently_viewed';

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error('Failed to save recently viewed products:', error);
    }
  }, [recentlyViewed]);

  useEffect(() => {
    let mounted = true;
    const loadRecentlyViewed = async () => {
      try {
        const response = await recentlyViewedAPI.getRecentlyViewed();
        if (!mounted) return;
        const payload = (response as any) || [];
        const items: Product[] =
          payload.items ||
          payload.products ||
          payload.data ||
          (Array.isArray(payload) ? payload : []);
        if (items.length) {
          setRecentlyViewed(items.slice(0, MAX_RECENTLY_VIEWED));
        }
      } catch (error) {
        console.warn('Failed to sync recently viewed history', error);
      }
    };
    loadRecentlyViewed();
    return () => {
      mounted = false;
    };
  }, []);

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      // Add to beginning
      const updated = [product, ...filtered];
      // Keep only MAX_RECENTLY_VIEWED items
      return updated.slice(0, MAX_RECENTLY_VIEWED);
    });
    const productId = Number(product.id);
    if (!Number.isNaN(productId)) {
      recentlyViewedAPI.trackView(productId).catch((error) => {
        console.warn('Failed to record recently viewed product', error);
      });
    }
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RecentlyViewedContext.Provider
      value={{ recentlyViewed, addToRecentlyViewed, clearRecentlyViewed }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
