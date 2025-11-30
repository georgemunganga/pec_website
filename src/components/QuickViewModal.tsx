import { useState } from 'react';
import { Product } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ShoppingCart, Heart, Minus, Plus, X } from 'lucide-react';
import { Rating } from './Rating';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { Link } from 'wouter';

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  if (!product) return null;

  const images = product.images || [product.image];
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart`);
    onClose();
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick View: {product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div>
            <div className="aspect-square bg-secondary rounded-2xl overflow-hidden mb-3">
              <img
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
          <div className="flex flex-col">
            {product.badge && (
              <div className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-medium uppercase mb-3 ${
                product.badge === 'sale' 
                  ? 'bg-primary text-primary-foreground' 
                  : product.badge === 'sold-out'
                  ? 'bg-gray-500 text-white'
                  : 'bg-accent text-accent-foreground'
              }`}>
                {product.badge}
              </div>
            )}

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {product.name}
            </h2>

            <p className="text-muted-foreground mb-3">{product.category}</p>

            <div className="mb-4">
              <Rating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock Indicator */}
            {product.stock !== undefined && (
              <div className="mb-4">
                {product.stock > 0 ? (
                  <p className="text-sm">
                    <span className="text-green-600 font-medium">In Stock</span>
                    {product.stock <= 10 && (
                      <span className="text-muted-foreground ml-2">
                        (Only {product.stock} left!)
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                )}
              </div>
            )}

            <p className="text-foreground mb-4 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-sm">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full"
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
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <Button
                className="flex-1 rounded-full gap-2"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleToggleWishlist}
              >
                <Heart className={`w-5 h-5 ${
                  inWishlist ? 'fill-primary text-primary' : ''
                }`} />
              </Button>
            </div>

            {/* View Full Details */}
            <Link href={`/product/${product.id}`}>
              <Button
                variant="ghost"
                className="w-full rounded-full"
                onClick={onClose}
              >
                View Full Details
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
