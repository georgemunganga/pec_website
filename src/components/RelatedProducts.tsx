import { useState, useEffect } from 'react';
import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { productsAPI } from '@/services/api';

interface RelatedProductsProps {
  productId: string;
  category: string;
}

export function RelatedProducts({ productId, category }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedProducts();
  }, [productId]);

  const loadRelatedProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getRelated(Number(productId), 4);
      const payload = (data as any) || [];
      const items: Product[] =
        payload.products ||
        payload.items ||
        payload.data ||
        (Array.isArray(payload) ? payload : []);
      setRelatedProducts(items);
    } catch (error) {
      console.error('Failed to load related products:', error);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
