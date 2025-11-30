import { Link } from 'wouter';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function ThankYou() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart when thank you page loads
    clearCart();
  }, [clearCart]);

  // In a real app, you'd get this from URL params or state
  const orderNumber = `PE${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-gradient-to-b from-background to-secondary/20">
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your order has been received and is being processed
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-card rounded-3xl shadow-lg p-6 md:p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-lg font-bold text-foreground">{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                <p className="text-lg font-semibold text-foreground">{estimatedDelivery}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                What's Next?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Order Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email confirmation shortly at the email address you provided
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Processing</p>
                    <p className="text-sm text-muted-foreground">
                      We're preparing your items for shipment
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Shipping</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive tracking information once your order ships
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-secondary/50 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              If you have any questions about your order, please don't hesitate to contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <span className="font-medium">Email:</span>{' '}
                <a href="mailto:info@pureessenceapothecary.com" className="text-primary hover:underline">
                  info@pureessenceapothecary.com
                </a>
              </p>
              <p className="text-foreground">
                <span className="font-medium">Phone:</span>{' '}
                <a href="tel:0977883578" className="text-primary hover:underline">
                  097 7883578
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/account/orders">
              <Button variant="outline" size="lg" className="w-full gap-2">
                <Package className="w-5 h-5" />
                Track Order
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" className="w-full gap-2">
                <ShoppingBag className="w-5 h-5" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="text-center mt-6">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
