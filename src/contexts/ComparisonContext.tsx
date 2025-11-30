import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Product } from '@/types/product';
import { toast } from 'sonner';
import { comparisonAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface ComparisonContextType {
  comparisonList: Product[];
  addToComparison: (product: Product) => Promise<void>;
  removeFromComparison: (productId: string | number) => Promise<void>;
  clearComparison: () => Promise<void>;
  isInComparison: (productId: string | number) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARISON_ITEMS = 4;
const LOCAL_COMPARISON_KEY = 'pec_comparison';

const readLocalComparison = (): Product[] => {
  try {
    const saved = localStorage.getItem(LOCAL_COMPARISON_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const persistLocalComparison = (items: Product[]) => {
  try {
    localStorage.setItem(LOCAL_COMPARISON_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
};

const normalizeComparison = (payload: any): Product[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
};

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [comparisonList, setComparisonList] = useState<Product[]>(() => readLocalComparison());

  const overwriteComparison = (items: Product[]) => {
    setComparisonList(items);
    persistLocalComparison(items);
  };

  const refreshFromServer = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await comparisonAPI.getComparison();
      overwriteComparison(normalizeComparison(response));
    } catch {
      // ignore sync failures
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshFromServer();
    } else {
      setComparisonList(readLocalComparison());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addToComparison = async (product: Product) => {
    const exists = comparisonList.some((item) => String(item.id) === String(product.id));
    if (exists) {
      toast.info('Product is already in comparison list');
      return;
    }

    if (comparisonList.length >= MAX_COMPARISON_ITEMS) {
      toast.error(`You can compare up to ${MAX_COMPARISON_ITEMS} products at a time`);
      return;
    }

    overwriteComparison([...comparisonList, product]);
    toast.success('Added to comparison');

    if (isAuthenticated) {
      try {
        await comparisonAPI.addToComparison(Number(product.id));
        await refreshFromServer();
      } catch {
        toast.error('Failed to sync comparison list');
        await refreshFromServer();
      }
    }
  };

  const removeFromComparison = async (productId: string | number) => {
    const filtered = comparisonList.filter((product) => String(product.id) !== String(productId));
    overwriteComparison(filtered);
    toast.success('Removed from comparison');

    if (isAuthenticated) {
      try {
        await comparisonAPI.removeFromComparison(Number(productId));
        await refreshFromServer();
      } catch {
        await refreshFromServer();
      }
    }
  };

  const clearComparison = async () => {
    overwriteComparison([]);
    toast.success('Comparison list cleared');

    if (isAuthenticated) {
      try {
        await comparisonAPI.clearComparison();
        await refreshFromServer();
      } catch {
        await refreshFromServer();
      }
    }
  };

  const isInComparison = (productId: string | number) => {
    return comparisonList.some((product) => String(product.id) === String(productId));
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
