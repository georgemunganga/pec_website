import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Rating } from '@/components/Rating';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { useComparison } from '@/contexts/ComparisonContext';
import { toast } from 'sonner';
import { ProductReviews } from '@/components/ProductReviews';
import { RelatedProducts } from '@/components/RelatedProducts';
import { ImageZoom } from '@/components/ImageZoom';
import { SEO } from '@/components/SEO';
import { StructuredData, generateProductSchema } from '@/components/StructuredData';
import { productsAPI } from '@/services/api';
import type { Product } from '@/types/product';

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const productId = params?.id ?? '';
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [, setLocation] = useLocation();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToComparison, isInComparison } = useComparison();

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const fetchBySlug = async () => productsAPI.getBySlug(productId);
      const fetchById = async () => productsAPI.getById(Number(productId));

      try {
        let result: Product;
        if (Number.isNaN(Number(productId))) {
          result = await fetchBySlug();
        } else {
          result = await fetchById();
        }
        if (isMounted) {
          setProduct(result);
          setSelectedImage(0);
        }
      } catch (firstError) {
        try {
          const fallback = Number.isNaN(Number(productId)) ? await fetchById() : await fetchBySlug();
          if (isMounted) {
            setProduct(fallback);
            setSelectedImage(0);
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Product not found');
            setProduct(null);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Add to recently viewed when product loads
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEO title="Product Not Found" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{error || 'Product not found'}</h2>
            <Link href="/shop">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product.inStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    // Add to cart and go directly to checkout
    addToCart(product, quantity);
    setLocation('/checkout');
  };

  const handleAddToComparison = () => {
    addToComparison(product);
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        keywords={`${product.name}, ${product.category}, ${product.brand || 'beauty products'}`}
        image={product.image}
        type="product"
      />
      <StructuredData data={generateProductSchema(product)} />
      <div className="min-h-screen pb-20 md:pb-8">
        <div className="container py-6">
          {/* Back Button */}
          <Link href="/shop">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div>
              <div className="aspect-square bg-secondary rounded-lg overflow-hidden mb-4">
                <ImageZoom
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.badge && (
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase mb-4 ${
                product.badge === 'sale' 
                  ? 'bg-primary text-primary-foreground' 
                  : product.badge === 'sold-out'
                  ? 'bg-gray-500 text-white'
                  : 'bg-accent text-accent-foreground'
              }`}>
                {product.badge}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {product.name}
            </h1>

            <p className="text-muted-foreground mb-4">{product.category}</p>

            <div className="mb-6">
              <Rating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock Indicator */}
            {product.stock !== undefined && (
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="text-sm font-medium text-green-600">
                      In Stock
                      {product.stock <= 10 && (
                        <span className="text-muted-foreground ml-2">
                          (Only {product.stock} left!)
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <p className="text-sm font-medium text-red-600">Out of Stock</p>
                  </div>
                )}
              </div>
            )}

            <p className="text-foreground mb-6 leading-relaxed">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Buy Now' : 'Out of Stock'}
                </Button>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleAddToComparison}
                disabled={isInComparison(product.id)}
              >
                {isInComparison(product.id) ? 'Added to Comparison' : 'Add to Comparison'}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts productId={product.id} category={product.category} />
        </div>
      </div>
    </div>
    </>
  );
}
