import { useState, useEffect, useRef, useId, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { productsAPI } from '@/services/api';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import { announceToScreenReader } from '@/lib/accessibility';
import { slugify } from '@/lib/format';

interface SearchResult {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function SearchBar() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { formatPrice } = useCurrency();
  const listboxId = useId();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }

      setLoading(true);
      try {
        const data = await productsAPI.search(query, 5);
        const payload = data.products || [];
        setResults(payload);
        setIsOpen(true);
        setActiveIndex(payload.length ? 0 : -1);
        announceToScreenReader(`${payload.length} search result${payload.length === 1 ? "" : "s"} found`);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        setActiveIndex(-1);
        announceToScreenReader("No results found", "assertive");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleProductClick = (id: number) => {
    setLocation(`/product/${id}`);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const totalOptions = results.length + (query.length >= 2 ? 1 : 0);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && event.key !== 'Escape') return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (totalOptions === 0) return;
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= totalOptions ? 0 : next;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (totalOptions === 0) return;
      setActiveIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? totalOptions - 1 : next;
      });
    } else if (event.key === 'Enter') {
      if (activeIndex === -1) return;
      event.preventDefault();
      if (activeIndex < results.length) {
        handleProductClick(results[activeIndex].id);
      } else {
        setLocation(`/shop?search=${encodeURIComponent(query)}`);
        setIsOpen(false);
        setActiveIndex(-1);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const getOptionId = (index: number) => {
    const product = results[index];
    if (!product) return undefined;
    return `search-option-${slugify(product.name)}-${product.id}`;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 && activeIndex < results.length
              ? getOptionId(activeIndex)
              : activeIndex === results.length
              ? 'search-view-all'
              : undefined
          }
          className="h-12 pl-12 pr-12 rounded-full border-border/50 focus-visible:ring-primary text-base"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute top-full mt-2 w-full bg-background border border-border rounded-2xl shadow-lg overflow-hidden z-50"
          role="listbox"
          id={listboxId}
        >
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((product, index) => {
                const optionId = `search-option-${slugify(product.name)}-${product.id}`;
                return (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  id={optionId}
                  role="option"
                  aria-selected={activeIndex === index}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left",
                    activeIndex === index && "bg-accent"
                  )}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatPrice(product.price)}
                  </p>
                </button>
              )})}
              <button
                id="search-view-all"
                role="option"
                aria-selected={activeIndex === results.length}
                onClick={() => {
                  setLocation(`/shop?search=${encodeURIComponent(query)}`);
                  setIsOpen(false);
                  setActiveIndex(-1);
                }}
                className={cn(
                  "w-full p-3 text-center text-sm text-primary hover:bg-accent transition-colors border-t",
                  activeIndex === results.length && "bg-accent"
                )}
              >
                View all results for "{query}"
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
