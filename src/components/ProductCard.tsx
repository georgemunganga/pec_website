import { Link } from 'wouter';
import { ShoppingBag, ArrowRight, Heart, Scale } from 'lucide-react';
import type { Product } from '@/types/product';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useComparison } from '@/contexts/ComparisonContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import type { SyntheticEvent } from 'react';

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_WEBP = '/assets/products/product-placeholder-800.webp';
const PLACEHOLDER_WEBP_SET = '/assets/products/product-placeholder-800.webp 800w, /assets/products/product-placeholder-1600.webp 1600w';
const PLACEHOLDER_AVIF = '/assets/products/product-placeholder.avif';
const PRODUCT_IMAGE_SIZES = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw';

interface OptimizedImageSources {
  fallback: string;
  imgSrcSet?: string;
  webpSrcSet?: string;
  avifSrcSet?: string;
}

const placeholderSources: OptimizedImageSources = {
  fallback: PLACEHOLDER_WEBP,
  imgSrcSet: PLACEHOLDER_WEBP_SET,
  webpSrcSet: PLACEHOLDER_WEBP_SET,
  avifSrcSet: `${PLACEHOLDER_AVIF} 1600w`,
};

const getOptimizedImageSources = (src?: string): OptimizedImageSources => {
  if (!src) {
    return placeholderSources;
  }

  if (/^https?:/i.test(src)) {
    try {
      const url = new URL(src);
      if (url.hostname.includes('images.unsplash.com')) {
        const base = `${url.origin}${url.pathname}`;
        const build = (format: 'webp' | 'avif', width: number, quality: number) =>
          `${base}?fm=${format}&fit=crop&w=${width}&q=${quality}`;

        const webp800 = build('webp', 800, 75);
        const webp1400 = build('webp', 1400, 70);
        const avif800 = build('avif', 800, 60);
        const avif1400 = build('avif', 1400, 55);

        return {
          fallback: webp800,
          imgSrcSet: `${webp800} 800w, ${webp1400} 1400w`,
          webpSrcSet: `${webp800} 800w, ${webp1400} 1400w`,
          avifSrcSet: `${avif800} 800w, ${avif1400} 1400w`,
        };
      }
    } catch {
      return { fallback: src };
    }
  }

  if (src.startsWith('/')) {
    return { fallback: src };
  }

  return { fallback: src };
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToComparison, isInComparison } = useComparison();
  const { formatPrice } = useCurrency();
  const inWishlist = isInWishlist(product.id);
  const inComparisonList = isInComparison(product.id);
  const imageSources = getOptimizedImageSources(product.image);

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied === 'true') {
      return;
    }
    target.dataset.fallbackApplied = 'true';
    target.src = PLACEHOLDER_WEBP;
    target.srcset = PLACEHOLDER_WEBP_SET;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToComparison(product);
  };

  return (
    <div className="group">
      <Link href={`/product/${product.id}`}>
        <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer mb-4">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-secondary/20">
            {product.badge && (
              <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                product.badge === 'sale' 
                  ? 'bg-primary text-primary-foreground' 
                  : product.badge === 'sold-out'
                  ? 'bg-gray-500 text-white'
                  : 'bg-accent text-accent-foreground'
              }`}>
                {product.badge}
              </div>
            )}
            
            {/* Action Icons - Top Right */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
                onClick={handleToggleWishlist}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-5 h-5 transition-colors ${
                  inWishlist
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`} />
              </button>
              <button
                className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
                onClick={handleAddToComparison}
                disabled={inComparisonList}
                aria-label="Add to comparison"
              >
                <Scale className={`w-5 h-5 transition-colors ${
                  inComparisonList
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`} />
              </button>
              <button
                className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <picture>
              {imageSources.avifSrcSet && (
                <source srcSet={imageSources.avifSrcSet} type="image/avif" />
              )}
              {imageSources.webpSrcSet && (
                <source srcSet={imageSources.webpSrcSet} type="image/webp" />
              )}
              <img
                src={imageSources.fallback}
                srcSet={imageSources.imgSrcSet}
                sizes={PRODUCT_IMAGE_SIZES}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
                onError={handleImageError}
              />
            </picture>
            
            {/* Bottom Buttons */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 rounded-full bg-white/95 hover:bg-white text-foreground backdrop-blur-sm shadow-sm font-medium"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                Buy now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 font-semibold shadow-sm"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {formatPrice(product.price)}
              </Button>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Product Info Below Card */}
      <div className="px-2">
        <h3 className="font-semibold text-foreground text-base mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-1">
          {product.category}
        </p>
        {product.originalPrice && (
          <div className="flex items-center gap-2">
            <span className="text-sm line-through text-muted-foreground">
              {formatPrice(product.originalPrice)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
