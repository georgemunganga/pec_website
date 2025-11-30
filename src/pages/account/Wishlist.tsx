import { useEffect, useState } from 'react';
import { AccountLayout } from '@/components/AccountLayout';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { wishlistAPI } from '@/services/api';
import type { Product } from '@/types/product';
import { Heart } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Wishlist() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadWishlist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await wishlistAPI.getWishlist();
        const payload = (response as any) || [];
        const items: Product[] =
          payload.items ||
          payload.products ||
          payload.data ||
          (Array.isArray(payload) ? payload : []);
        if (isMounted) {
          setWishlistProducts(items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load wishlist');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWishlist();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          <p className="text-muted-foreground mt-2">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {error && (
          <p className="text-destructive">{error}</p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="bg-card rounded-3xl p-12 border border-border text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Save your favorite products to buy them later
            </p>
            <Link href="/shop">
              <Button className="rounded-full">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
