import { createContext, useContext, ReactNode } from 'react';
import { formatCurrency } from '@/lib/format';

interface CurrencyContextType {
  formatPrice: (amount: number) => string;
  currencySymbol: string;
  currencyCode: string;
  currencyName: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const currencySymbol = 'K';
  const currencyCode = 'ZMW';
  const currencyName = 'Zambian Kwacha';

  const formatPrice = (amount: number): string => {
    return formatCurrency(amount, { currency: currencyCode });
  };

  const value = {
    formatPrice,
    currencySymbol,
    currencyCode,
    currencyName,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
