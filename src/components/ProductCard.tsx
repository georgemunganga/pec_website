import { Link, useLocation } from 'wouter';
import { ShoppingBag, ArrowRight, Heart, Scale, Image as ImageIcon } from 'lucide-react';
import type { Product } from '@/types/product';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useComparison } from '@/contexts/ComparisonContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { useState, type SyntheticEvent } from 'react';
import { AddToCartDialog } from '@/components/AddToCartDialog';

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
  const [, setLocation] = useLocation();
  const inWishlist = isInWishlist(product.id);
  const inComparisonList = isInComparison(product.id);
  const hasValidImage = Boolean(product.image && product.image.trim());
  const imageSources = getOptimizedImageSources(product.image);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(!hasValidImage);

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    setShowPlaceholder(true);
    const target = event.currentTarget;
    target.removeAttribute('srcset');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
    setDialogOpen(true);
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
    <>
    <div className="group">
      <Link href={`/product/${product.id}`}>
        <div className="relative bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer mb-3 md:mb-4">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-secondary/20">
            {product.badge && (
              <div className={`absolute top-2 left-2 md:top-4 md:left-4 z-10 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-bold uppercase ${
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
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 flex gap-1.5 md:gap-2">
              <button
                className="w-9 h-9 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
                onClick={handleToggleWishlist}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                  inWishlist
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`} />
              </button>
              <button
                className="w-9 h-9 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
                onClick={handleAddToComparison}
                disabled={inComparisonList}
                aria-label="Add to comparison"
              >
                <Scale className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                  inComparisonList
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`} />
              </button>
              <button
                className="w-9 h-9 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
              </button>
            </div>

            {showPlaceholder ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground">
                <ImageIcon className="w-12 h-12" aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Image coming soon
                </span>
              </div>
            ) : (
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
            )}
            
            {/* Bottom Buttons */}
            <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 flex items-center gap-1.5 md:gap-2">
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 rounded-full bg-white/95 hover:bg-white text-foreground backdrop-blur-sm shadow-sm font-medium text-xs md:text-sm h-9 md:h-11"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <span className="hidden sm:inline">Buy now</span>
                <span className="sm:hidden">Buy</span>
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              </Button>
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 md:px-6 font-semibold shadow-sm text-xs md:text-sm h-9 md:h-11"
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
      <div className="px-1 md:px-2">
        <h3 className="font-semibold text-foreground text-sm md:text-base mb-0.5 md:mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">
          {product.category}
        </p>
        {product.originalPrice && (
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm line-through text-muted-foreground">
              {formatPrice(product.originalPrice)}
            </span>
          </div>
        )}
      </div>
    </div>
    <AddToCartDialog
      open={dialogOpen}
      productName={product.name}
      onContinue={() => setDialogOpen(false)}
      onCheckout={() => {
        setDialogOpen(false);
        setLocation('/checkout');
      }}
    />
    </>
  );
}
