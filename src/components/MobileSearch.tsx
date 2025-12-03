import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { productsAPI } from '@/services/api';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/contexts/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { announceToScreenReader, trapFocus } from '@/lib/accessibility';
import { slugify } from '@/lib/format';
import { mapApiProduct } from '@/lib/products';
import type { Product } from '@/types/product';

interface MobileSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useCurrency();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await productsAPI.search(query, 10);
        const payload = data.products || data.items || data.data || [];
        const normalized = Array.isArray(payload) ? payload.map(mapApiProduct) : [];
        setResults(normalized);
        announceToScreenReader(`${normalized.length} results for ${query}`);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        announceToScreenReader('No search results found', 'assertive');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleProductClick = (id: string | number) => {
    setLocation(`/product/${id}`);
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleViewAll = () => {
    setLocation(`/shop?search=${encodeURIComponent(query)}`);
    setQuery('');
    setResults([]);
    onClose();
  };

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const release = trapFocus(containerRef.current);
    return () => {
      release();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Search Modal */}
          <motion.div
            ref={containerRef}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 bg-background z-50 shadow-xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-4 rounded-full border-border/50 focus-visible:ring-primary"
                  autoFocus
                  aria-label="Search products"
                />
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-secondary/50 flex items-center justify-center transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Searching...
                </div>
              ) : query.length > 0 && results.length > 0 ? (
                <div>
                  {results.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-accent transition-colors text-left border-b border-border last:border-0"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0" id={`mobile-search-${slugify(product.name)}-${product.id}`}>
                        <p className="font-medium text-base truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatPrice(product.price)}
                      </p>
                    </button>
                  ))}
                  <button
                    onClick={handleViewAll}
                    className="w-full p-4 text-center font-medium text-primary hover:bg-accent transition-colors"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              ) : query.length > 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No products found for "{query}"</p>
                  <p className="text-sm mt-2">Try different keywords</p>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Search for products</p>
                  <p className="text-sm mt-2">Enter at least 2 characters to search</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
