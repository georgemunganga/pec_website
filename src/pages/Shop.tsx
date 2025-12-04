import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { ProductFilters } from '@/components/ProductFilters';
import type { FilterOptions } from '@/components/ProductFilters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { productsAPI, type ProductFilters as ApiProductFilters } from '@/services/api';
import type { Product } from '@/types/product';
import { buildPaginationMeta, getPaginationParams } from '@/lib/pagination';
import { mapApiProduct } from '@/lib/products';

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'popular';

const STORAGE_KEY = 'pec_shop_filters';
const FILTER_CACHE_KEY = 'pec_product_filters_v2'; // v2: transformed to strings
const PRODUCTS_PER_PAGE = 12;

const sortMap: Record<SortOption, ApiProductFilters['sort']> = {
  featured: undefined,
  'price-low': 'price_asc',
  'price-high': 'price_desc',
  newest: 'newest',
  popular: 'popular',
};

export default function Shop() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialQueryParams = searchParams ? getPaginationParams(searchParams) : {};
  const searchQuery = searchParams?.get('search') ?? '';
  const initialPage = (initialQueryParams.page as number | undefined) ?? 1;

  const [filters, setFilters] = useState<FilterOptions>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
    return {
      priceRange: [0, 200],
      categories: [],
      brands: [],
      skinTypes: [],
    };
  });

  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableSkinTypes, setAvailableSkinTypes] = useState<string[]>([]);
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [filtersError, setFiltersError] = useState<string | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(FILTER_CACHE_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached);

      // Transform cached data to ensure we only have strings
      if (parsed.categories?.length) {
        const categoryNames = parsed.categories.map((cat: any) =>
          typeof cat === 'string' ? cat : cat.name
        );
        setAvailableCategories(categoryNames);
      }

      if (parsed.brands?.length) {
        const brandNames = parsed.brands.map((brand: any) =>
          typeof brand === 'string' ? brand : brand.name
        );
        setAvailableBrands(brandNames);
      }

      if (parsed.skinTypes?.length) setAvailableSkinTypes(parsed.skinTypes);

      if (
        parsed.categories?.length ||
        parsed.brands?.length ||
        parsed.skinTypes?.length
      ) {
        setFiltersHydrated(true);
      }
    } catch (err) {
      console.warn('Failed to load cached filters', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadFilters = async () => {
      setIsLoadingFilters(true);
      setFiltersError(null);
      try {
        const response = await productsAPI.getFilters();
        if (!mounted) return;

        // Extract the data from the response envelope
        const filters = response.data || response;

        // Transform categories and brands from objects to string arrays
        if (filters.categories?.length) {
          const categoryNames = filters.categories.map((cat: any) =>
            typeof cat === 'string' ? cat : cat.name
          );
          setAvailableCategories(categoryNames);
        }

        if (filters.brands?.length) {
          const brandNames = filters.brands.map((brand: any) =>
            typeof brand === 'string' ? brand : brand.name
          );
          setAvailableBrands(brandNames);
        }

        if (filters.skinTypes?.length) setAvailableSkinTypes(filters.skinTypes);

        if (
          filters.categories?.length ||
          filters.brands?.length ||
          filters.skinTypes?.length
        ) {
          setFiltersHydrated(true);
          try {
            // Cache the transformed data
            sessionStorage.setItem(FILTER_CACHE_KEY, JSON.stringify({
              categories: filters.categories?.map((cat: any) =>
                typeof cat === 'string' ? cat : cat.name
              ),
              brands: filters.brands?.map((brand: any) =>
                typeof brand === 'string' ? brand : brand.name
              ),
              skinTypes: filters.skinTypes,
            }));
          } catch (err) {
            console.warn('Failed to cache filters', err);
          }
        }
      } catch (err) {
        if (!mounted) return;
        setFiltersError(err instanceof Error ? err.message : 'Failed to load filters');
      } finally {
        if (mounted) setIsLoadingFilters(false);
      }
    };
    loadFilters();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  }, [filters]);

  const buildApiFilters = useCallback(
    (pageOverride?: number): ApiProductFilters => ({
      limit: PRODUCTS_PER_PAGE,
      page: pageOverride ?? initialPage,
      search: searchQuery || undefined,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      categories: filters.categories,
      brands: filters.brands,
      skinTypes: filters.skinTypes,
      sort: sortMap[sortBy],
    }),
    [filters, sortBy, searchQuery, initialPage]
  );

  const fetchProducts = useCallback(
    async ({ page: targetPage = 1, append = false }: { page?: number; append?: boolean } = {}) => {
      const apiFilters = buildApiFilters(targetPage);
      const perPage = apiFilters.limit ?? PRODUCTS_PER_PAGE;
      append ? setIsLoadingMore(true) : setIsLoading(true);
      setError(null);

      try {
        const response = await productsAPI.getAll(apiFilters);
        const payload = (response as any) || [];
        const rawItems: Product[] =
          payload.items ||
          payload.products ||
          payload.data ||
          (Array.isArray(payload) ? payload : []);

        const normalizedItems = rawItems.map(mapApiProduct);

        setProductsData((prev) => (append ? [...prev, ...normalizedItems] : normalizedItems));

        const metaSource = payload.meta?.pagination || payload.meta || undefined;
        const totalFromMeta =
          payload.meta?.total ??
          payload.meta?.pagination?.total ??
          payload.total ??
          metaSource?.total;
        const effectiveTotal =
          typeof totalFromMeta === 'number'
            ? totalFromMeta
            : append
            ? productsData.length + items.length
            : items.length;
        setTotalProducts(effectiveTotal);

        const paginationMeta = buildPaginationMeta(
          metaSource
            ? {
                page: (metaSource as any).currentPage ?? metaSource.page ?? targetPage,
                limit: (metaSource as any).perPage ?? metaSource.limit ?? perPage,
                total: metaSource.total ?? effectiveTotal,
              }
            : {
                page: targetPage,
                limit: perPage,
                total: effectiveTotal,
              }
        );
        const currentPage = paginationMeta?.page ?? targetPage;
        const totalPages = paginationMeta?.totalPages;
        const nextHasMore =
          totalPages !== undefined ? currentPage < totalPages : items.length === perPage;
        setHasMore(nextHasMore);
        setPage(currentPage);

        if (!filtersHydrated) {
          const derivedCategories = Array.from(
            new Set(normalizedItems.map((p) => p.category).filter(Boolean))
          );
          const derivedBrands = Array.from(
            new Set(normalizedItems.map((p) => p.brand).filter(Boolean))
          ) as string[];
          const derivedSkinTypes = Array.from(
            new Set(
              normalizedItems.flatMap((p) =>
                Array.isArray(p.skinType) ? p.skinType : p.skinType ? [p.skinType] : []
              )
            )
          );

          if (derivedCategories.length && availableCategories.length === 0) {
            setAvailableCategories(derivedCategories);
          }
          if (derivedBrands.length && availableBrands.length === 0) {
            setAvailableBrands(derivedBrands);
          }
          if (derivedSkinTypes.length && availableSkinTypes.length === 0) {
            setAvailableSkinTypes(derivedSkinTypes);
          }
          if (
            (derivedCategories.length && availableCategories.length === 0) ||
            (derivedBrands.length && availableBrands.length === 0) ||
            (derivedSkinTypes.length && availableSkinTypes.length === 0)
          ) {
            setFiltersHydrated(true);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        if (!append) {
          setProductsData([]);
          setTotalProducts(0);
        }
        setHasMore(false);
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [
      availableBrands.length,
      availableCategories.length,
      availableSkinTypes.length,
      buildApiFilters,
      filtersHydrated,
      productsData.length,
    ]
  );

  useEffect(() => {
    fetchProducts({ page: 1, append: false });
  }, [filters, sortBy, searchQuery, fetchProducts]);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    fetchProducts({ page: page + 1, append: true });
  };

  const showingCount = isLoading ? '...' : productsData.length;

  return (
    <>
      <SEO
        title={searchQuery ? `Search: ${searchQuery}` : 'Shop'}
        description="Browse our collection of premium makeup and skincare products. Filter by category, brand, and price to find your perfect beauty essentials."
        keywords="shop cosmetics, buy makeup, skincare products, beauty products"
      />
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="bg-gradient-to-r from-accent/20 to-secondary/30 py-12 md:py-16">
          <div className="container">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop Our Collection'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Discover premium quality cosmetics and skincare products for your beauty routine
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableCategories={availableCategories}
                availableBrands={availableBrands}
                availableSkinTypes={availableSkinTypes}
              />
              {isLoadingFilters && (
                <p className="text-xs text-muted-foreground px-2">Loading filter options...</p>
              )}
              {filtersError && (
                <p className="text-xs text-destructive px-2">{filtersError}</p>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {showingCount} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                </p>

                <div className="flex items-center gap-3">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-[180px] rounded-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="text-center py-8 text-destructive">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <ProductCardSkeleton key={idx} />
                  ))}
                </div>
              ) : productsData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {productsData.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">
                    {searchQuery ? `No products found for "${searchQuery}"` : 'No products match your filters'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}

              {hasMore && !isLoading && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="outline"
                    className="rounded-full min-w-[180px]"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Products'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
